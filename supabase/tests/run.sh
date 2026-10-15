#!/usr/bin/env bash
# =============================================================================
# Pruebas SQL de NOX Admin sobre un PostgreSQL desechable.
#
#   PGHOST=... PGPORT=... PGUSER=postgres bash supabase/tests/run.sh
#
# Crea una base nueva, aplica el stub de Supabase y TODAS las migraciones de
# supabase/migrations en orden, corre las pruebas secuenciales y después las
# de concurrencia (varias conexiones reales en paralelo). Borra la base al
# final. Nunca apunta a un proyecto real de Supabase.
# =============================================================================
set -euo pipefail

RAIZ="$(cd "$(dirname "$0")/../.." && pwd)"
DB="nox_admin_test_$$"
PSQL=(psql -X -q -v ON_ERROR_STOP=1 -d "$DB")

limpiar() { dropdb --if-exists "$DB" >/dev/null 2>&1 || true; }
trap limpiar EXIT

createdb "$DB"
"${PSQL[@]}" -f "$RAIZ/supabase/tests/00_stub_supabase.sql" >/dev/null
for m in "$RAIZ"/supabase/migrations/*.sql; do
  echo "· migración $(basename "$m")"
  "${PSQL[@]}" -f "$m" >/dev/null
done

echo
echo "── Pruebas secuenciales ─────────────────────────────────────────────"
"${PSQL[@]}" -f "$RAIZ/supabase/tests/10_inventario.sql" 2>&1 | sed -n 's/^.*NOTICE:  //p; /ERROR/p; /OK$/p'

echo
echo "── NOX Admin V2: esquema, RLS y auditoría ──"
"${PSQL[@]}" -f "$RAIZ/supabase/tests/catalogo_v2_fase1.sql"
"${PSQL[@]}" -f "$RAIZ/supabase/tests/catalogo_v2_estados.sql"
"${PSQL[@]}" -f "$RAIZ/supabase/tests/catalogo_v2_borradores.sql"
"${PSQL[@]}" -f "$RAIZ/supabase/tests/catalogo_v2_editar_borradores.sql"
"${PSQL[@]}" -f "$RAIZ/supabase/tests/catalogo_v2_revisiones.sql"
"${PSQL[@]}" -f "$RAIZ/supabase/tests/catalogo_v2_seguridad.sql"
"${PSQL[@]}" -f "$RAIZ/supabase/tests/catalogo_v2_campos_complementarios.sql"
"${PSQL[@]}" -f "$RAIZ/supabase/tests/catalogo_v2_storage.sql"
"${PSQL[@]}" -f "$RAIZ/supabase/tests/catalogo_v2_validar_imagen.sql"
"${PSQL[@]}" -f "$RAIZ/supabase/tests/catalogo_v2_imagen_en_uso.sql"
echo

echo "── Concurrencia ─────────────────────────────────────────────────────"
ADMIN_A="00000000-0000-0000-0000-00000000000a"
ADMIN_B="00000000-0000-0000-0000-00000000000b"

como_admin() { # $1 = uuid del admin, $2 = sentencia
  "${PSQL[@]}" -t -A -c "begin; select set_config('request.jwt.claims', json_build_object('sub','$1','role','authenticated','aal','aal1')::text, true); set local role authenticated; $2; commit;"
}

# Producto con 10 unidades y 25 egresos de 1 unidad lanzados a la vez por dos
# administradores: deben aceptarse exactamente 10.
como_admin "$ADMIN_A" "select public.registrar_movimiento(gen_random_uuid(), 'armaf-club-de-nuit', 'carga_inicial', 10, 'Conteo para prueba de concurrencia')" >/dev/null

TMP="$(mktemp -d)"
for i in $(seq 1 25); do
  admin=$([ $((i % 2)) -eq 0 ] && echo "$ADMIN_A" || echo "$ADMIN_B")
  ( como_admin "$admin" "select public.registrar_movimiento(gen_random_uuid(), 'armaf-club-de-nuit', 'egreso', 1, 'Prueba concurrente')" \
      >"$TMP/$i.out" 2>"$TMP/$i.err" && echo ok >"$TMP/$i.res" || echo fail >"$TMP/$i.res" ) &
done
wait

aceptados=$(grep -l '^ok$' "$TMP"/*.res | wc -l)
rechazados_stock=$(grep -l 'Stock insuficiente' "$TMP"/*.err | wc -l)
otros_errores=$(( 25 - aceptados - rechazados_stock ))
stock_final=$("${PSQL[@]}" -t -A -c "select stock from public.inventory_items where product_slug = 'armaf-club-de-nuit'")
cadena=$("${PSQL[@]}" -t -A -c "select string_agg(stock_before::text, ',' order by id) from public.inventory_movements where product_slug = 'armaf-club-de-nuit' and movement_type = 'egreso'")
esperada="10,9,8,7,6,5,4,3,2,1"

echo "  25 egresos simultáneos de 1 sobre stock 10 → aceptados $aceptados · rechazados por stock $rechazados_stock · otros errores $otros_errores · stock final $stock_final"
echo "  stock_before de los egresos aceptados, en orden: $cadena"
if [ "$aceptados" -ne 10 ] || [ "$rechazados_stock" -ne 15 ] || [ "$otros_errores" -ne 0 ] || [ "$stock_final" -ne 0 ] || [ "$cadena" != "$esperada" ]; then
  echo "✗ FALLA: la concurrencia de egresos no es consistente"; cat "$TMP"/*.err | sort | uniq -c; exit 1
fi
echo "✓ concurrencia de egresos: exactamente 10 aceptados, sin stock negativo, cadena de saldos sin huecos"

# El mismo request_id enviado 12 veces a la vez (doble clic, reintentos):
# un único movimiento y un único ingreso aplicado.
como_admin "$ADMIN_A" "select public.registrar_movimiento(gen_random_uuid(), 'rasasi-hawas-for-him', 'carga_inicial', 0, 'Conteo para prueba de idempotencia')" >/dev/null
RID="$(cat /proc/sys/kernel/random/uuid)"
for i in $(seq 1 12); do
  ( como_admin "$ADMIN_A" "select public.registrar_movimiento('$RID', 'rasasi-hawas-for-him', 'ingreso', 3, 'Reintento')" \
      >"$TMP/r$i.out" 2>"$TMP/r$i.err" || true ) &
done
wait
movs=$("${PSQL[@]}" -t -A -c "select count(*) from public.inventory_movements where request_id = '$RID'")
stock_r=$("${PSQL[@]}" -t -A -c "select stock from public.inventory_items where product_slug = 'rasasi-hawas-for-him'")
otros=$(cat "$TMP"/r*.err | grep -c 'ERROR' || true)
echo "  12 envíos simultáneos con el mismo request_id → movimientos $movs · stock $stock_r · errores inesperados $otros"
if [ "$movs" -ne 1 ] || [ "$stock_r" -ne 3 ] || [ "$otros" -ne 0 ]; then
  echo "✗ FALLA: el request_id repetido no es idempotente bajo concurrencia"; cat "$TMP"/r*.err | sort | uniq -c; exit 1
fi
echo "✓ idempotencia concurrente: un solo movimiento y un solo ingreso aplicado"

# Dos cargas iniciales simultáneas del mismo producto: sólo una prospera.
for i in 1 2 3 4; do
  ( como_admin "$ADMIN_B" "select public.registrar_movimiento(gen_random_uuid(), 'afnan-9pm-night-out', 'carga_inicial', $i, 'Carga simultánea')" \
      >"$TMP/c$i.out" 2>"$TMP/c$i.err" && echo ok >"$TMP/c$i.res" || echo fail >"$TMP/c$i.res" ) &
done
wait
cargas=$(grep -l '^ok$' "$TMP"/c*.res | wc -l)
movs_c=$("${PSQL[@]}" -t -A -c "select count(*) from public.inventory_movements where product_slug = 'afnan-9pm-night-out'")
echo "  4 cargas iniciales simultáneas → aceptadas $cargas · movimientos $movs_c"
if [ "$cargas" -ne 1 ] || [ "$movs_c" -ne 1 ]; then
  echo "✗ FALLA: hubo más de una carga inicial"; exit 1
fi
echo "✓ carga inicial concurrente: una sola"

rm -rf "$TMP"
echo
echo "PRUEBAS SQL: TODAS OK"
