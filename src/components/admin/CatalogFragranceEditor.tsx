"use client";

/**
 * EDITOR DE FICHA DEL CATÁLOGO V2 — sólo interfaz.
 *
 * No habla con Supabase: arma los valores, los valida y llama a `onSave`
 * (una Server Action que vuelve a validar y usa las RPC auditadas).
 * El perfil olfativo se edita en campos estructurados; las claves que el
 * editor no conoce se conservan, y guardar sin tocar nada no altera el perfil.
 * No incluye stock: el inventario se gestiona sólo desde Inventario.
 *
 * Sincronización: `version` identifica los datos del servidor con que se
 * renderizó. Cuando cambia (aprobación, guardado, cambio de estado), el
 * formulario se reinicia con los valores actuales, para que nunca quede un
 * valor viejo que pueda revertir un cambio aprobado al volver a guardar.
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AROMATIC_INTENSITY_LABELS,
  CATEGORIAS_CATALOGO,
  ESTACIONES,
  ETIQUETA_CATEGORIA,
  ETIQUETA_GENERO,
  ETIQUETA_ORIGEN,
  FAMILIAS,
  FAMILY_LABELS,
  GENEROS_CATALOGO,
  INTENSIDADES,
  OCASIONES,
  OCCASION_LABELS,
  ORIGENES_CATALOGO,
  SEASON_LABELS,
  editableAPerfil,
  esSlugValido,
  perfilAEditable,
  sugerirSlug,
  type PerfilEditable
} from "@/lib/admin/catalogo-v2";
import { ayudaCampoPortada, sinCambios } from "@/lib/admin/ficha-sincronizacion";
import { claseAyuda, claseBoton, claseCampo, claseError, claseEtiqueta, claseOk } from "./ui";

export type CatalogEditorValues = {
  slug: string;
  house: string;
  fragranceName: string;
  gender: "femenino" | "masculino" | "unisex";
  universe: "disenador" | "nicho" | "arabe" | "pendiente";
  origin: "internacional" | "arabe";
  olfactory: Record<string, unknown> | null;
  imagePath: string | null;
};

/** Resultado de guardar: la acción devuelve el destino opcional tras crear. */
export type ResultadoGuardado = { ok: true; slug?: string } | { ok: false; error: string; desactualizada?: boolean };

type Props = {
  initial?: Partial<CatalogEditorValues>;
  mode: "create-draft" | "edit-draft" | "propose-revision";
  busy?: boolean;
  uploadedImagePath?: string | null;
  /** Versión de los datos del servidor; al cambiar, el formulario se reinicia. */
  version?: string;
  onSave: (values: CatalogEditorValues) => Promise<ResultadoGuardado | void>;
};

function Casillas({
  leyenda, opciones, etiquetas, valor, onChange, disabled
}: {
  leyenda: string;
  opciones: readonly string[];
  etiquetas: Record<string, string>;
  valor: string[];
  onChange: (v: string[]) => void;
  disabled: boolean;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-[12px] uppercase tracking-wider text-mist">{leyenda}</legend>
      <div className="flex flex-wrap gap-2">
        {opciones.map((o) => {
          const activo = valor.includes(o);
          return (
            <label
              key={o}
              className={`cursor-pointer select-none rounded-full border px-3 py-1.5 text-[12.5px] transition-colors focus-within:ring-2 focus-within:ring-steel/70 ${
                activo ? "border-bone/50 bg-graphite text-bone" : "border-edge text-haze hover:border-mist"
              } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={activo}
                disabled={disabled}
                onChange={() => onChange(activo ? valor.filter((x) => x !== o) : [...valor, o])}
              />
              {etiquetas[o] ?? o}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

type Modo = Props["mode"];
/** Mensaje ligado al modo en que se produjo: si el modo cambia, deja de mostrarse. */
type Mensaje = { texto: string; modo: Modo } | null;

export function CatalogFragranceEditor({ initial, mode, busy = false, uploadedImagePath, version, onSave }: Props) {
  const router = useRouter();
  const creando = mode === "create-draft";
  const perfilBase = initial?.olfactory ?? null;

  const [house, setHouse] = useState(initial?.house ?? "");
  const [fragranceName, setFragranceName] = useState(initial?.fragranceName ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTocado, setSlugTocado] = useState(Boolean(initial?.slug));
  const [gender, setGender] = useState<CatalogEditorValues["gender"]>(initial?.gender ?? "unisex");
  const [universe, setUniverse] = useState<CatalogEditorValues["universe"]>(initial?.universe ?? "disenador");
  const [origin, setOrigin] = useState<CatalogEditorValues["origin"]>(initial?.origin ?? "internacional");
  const [perfil, setPerfil] = useState<PerfilEditable>(() => perfilAEditable(perfilBase));
  const [imagePath, setImagePath] = useState(initial?.imagePath ?? "");
  const [error, setErrorMensaje] = useState<Mensaje>(null);
  const [ok, setOkMensaje] = useState<Mensaje>(null);
  const [saving, setSaving] = useState(false);
  const setError = (texto: string | null) => setErrorMensaje(texto ? { texto, modo: mode } : null);
  const setOk = (texto: string | null) => setOkMensaje(texto ? { texto, modo: mode } : null);

  // Reinicio al cambiar la versión del servidor (patrón "estado derivado de
  // props" de React: se aplica en el mismo render, sin mostrar valores viejos).
  const [versionVista, setVersionVista] = useState(version);
  if (version !== versionVista) {
    setVersionVista(version);
    setHouse(initial?.house ?? "");
    setFragranceName(initial?.fragranceName ?? "");
    setSlug(initial?.slug ?? "");
    setGender(initial?.gender ?? "unisex");
    setUniverse(initial?.universe ?? "disenador");
    setOrigin(initial?.origin ?? "internacional");
    setPerfil(perfilAEditable(perfilBase));
    setImagePath(initial?.imagePath ?? "");
  }

  useEffect(() => {
    if (uploadedImagePath) setImagePath(uploadedImagePath);
  }, [uploadedImagePath]);

  // Al crear, el identificador se sugiere desde marca + nombre hasta que se edite a mano.
  useEffect(() => {
    if (creando && !slugTocado) setSlug(sugerirSlug(house, fragranceName));
  }, [creando, slugTocado, house, fragranceName]);

  const locked = busy || saving;
  const slugValid = useMemo(() => esSlugValido(slug), [slug]);
  const campo = <K extends keyof PerfilEditable>(k: K) => (v: PerfilEditable[K]) => setPerfil((p) => ({ ...p, [k]: v }));
  const etiquetaBoton = mode === "propose-revision" ? "Guardar revisión pendiente" : creando ? "Crear borrador" : "Guardar borrador";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setOk(null);
    if (!slugValid) { setError("El identificador sólo admite minúsculas, números y guiones (hasta 120 caracteres)."); return; }
    if (!house.trim() || !fragranceName.trim() || house.trim().length > 160 || fragranceName.trim().length > 180) {
      setError("Completá la marca (hasta 160 caracteres) y el nombre de la fragancia (hasta 180)."); return;
    }
    if (imagePath && (imagePath.length > 500 || !imagePath.startsWith(`covers/${slug}/`) || imagePath.includes(".."))) {
      setError("La portada debe ser una imagen privada subida para esta fragancia."); return;
    }
    const resultado = editableAPerfil(perfil, perfilBase);
    if (!resultado.ok) { setError(resultado.error); return; }
    const valores: CatalogEditorValues = {
      slug, house: house.trim(), fragranceName: fragranceName.trim(), gender, universe, origin,
      olfactory: resultado.perfil, imagePath: imagePath || null
    };
    if (!creando && sinCambios(valores, initial)) {
      setOk(mode === "propose-revision"
        ? "No hay cambios para guardar: el formulario coincide con los datos actuales."
        : "No hay cambios para guardar: el borrador ya tiene estos valores.");
      return;
    }
    setSaving(true);
    try {
      const r = await onSave(valores);
      if (r && !r.ok) {
        setError(r.error);
        // Formulario viejo: se traen los datos actuales (el reinicio lo hace `version`).
        if (r.desactualizada) router.refresh();
        return;
      }
      if (creando && r && r.ok && r.slug) {
        router.push(`/admin/catalogo/${encodeURIComponent(r.slug)}?aviso=creada`);
        return;
      }
      setOk(mode === "propose-revision"
        ? "Revisión guardada. La ficha publicada no cambia hasta aprobarla."
        : "Borrador guardado.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar. Intentá nuevamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-8" aria-label="Editor de ficha de fragancia" noValidate>
      <p className="text-[13px] leading-relaxed text-mist">
        {mode === "propose-revision"
          ? "La ficha está publicada: los cambios se guardan como revisión pendiente y no se aplican hasta aprobarlos."
          : "Los cambios se guardan como borrador. Nada se publica automáticamente."}
      </p>

      <fieldset className="space-y-4" disabled={locked}>
        <legend className="mb-3 text-[15px] text-bone">Identidad</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={claseEtiqueta}>Marca
            <input required maxLength={160} value={house} onChange={(e) => setHouse(e.target.value)} className={claseCampo} autoComplete="off" />
          </label>
          <label className={claseEtiqueta}>Fragancia
            <input required maxLength={180} value={fragranceName} onChange={(e) => setFragranceName(e.target.value)} className={claseCampo} autoComplete="off" />
          </label>
          <label className={`${claseEtiqueta} sm:col-span-2`}>Identificador (slug)
            <input
              required maxLength={120} value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugTocado(true); }}
              disabled={locked || !creando}
              aria-invalid={!slugValid}
              aria-describedby="ayuda-slug"
              className={`${claseCampo} font-mono text-[13px] disabled:opacity-70`}
              spellCheck={false}
            />
            <span id="ayuda-slug" className={claseAyuda}>
              {creando
                ? "Se congela al crear la ficha y no cambia aunque se edite la marca o el nombre."
                : "Identificador estable: no se puede modificar."}
            </span>
          </label>
          <label className={claseEtiqueta}>Género
            <select value={gender} onChange={(e) => setGender(e.target.value as CatalogEditorValues["gender"])} className={claseCampo}>
              {GENEROS_CATALOGO.map((g) => <option key={g} value={g}>{ETIQUETA_GENERO[g]}</option>)}
            </select>
          </label>
          <label className={claseEtiqueta}>Categoría
            <select value={universe} onChange={(e) => setUniverse(e.target.value as CatalogEditorValues["universe"])} className={claseCampo}>
              {CATEGORIAS_CATALOGO.map((c) => <option key={c} value={c}>{ETIQUETA_CATEGORIA[c]}</option>)}
            </select>
          </label>
          <label className={claseEtiqueta}>Origen
            <select value={origin} onChange={(e) => setOrigin(e.target.value as CatalogEditorValues["origin"])} className={claseCampo}>
              {ORIGENES_CATALOGO.map((o) => <option key={o} value={o}>{ETIQUETA_ORIGEN[o]}</option>)}
            </select>
          </label>
          <label className={claseEtiqueta}>Portada privada
            <input value={imagePath} readOnly placeholder="Sin portada en almacenamiento privado" className={`${claseCampo} font-mono text-[12px]`} />
            <span className={claseAyuda}>
              {creando
                ? "La portada se sube después de crear el borrador, desde la ficha."
                : ayudaCampoPortada(mode, initial?.imagePath ?? null, imagePath || null)}
            </span>
          </label>
        </div>
        {imagePath ? (
          <button type="button" onClick={() => setImagePath("")} className="text-[12px] text-mist underline underline-offset-4 hover:text-bone">
            Quitar portada de la ficha
          </button>
        ) : null}
      </fieldset>

      <fieldset className="space-y-5" disabled={locked}>
        <legend className="mb-1 text-[15px] text-bone">Perfil olfativo</legend>
        <p className="text-[13px] leading-relaxed text-mist">
          Describe la fragancia de referencia: notas, acordes y carácter. No incluye duración, proyección ni estela.
          Las listas se separan con comas.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={claseEtiqueta}>Familia principal
            <select value={perfil.family} onChange={(e) => campo("family")(e.target.value)} className={claseCampo}>
              <option value="">Sin definir</option>
              {FAMILIAS.map((f) => <option key={f} value={f}>{FAMILY_LABELS[f]}</option>)}
            </select>
          </label>
          <label className={claseEtiqueta}>Carácter aromático
            <select value={perfil.aromaticIntensity} onChange={(e) => campo("aromaticIntensity")(e.target.value)} className={claseCampo}>
              <option value="">Sin definir</option>
              {INTENSIDADES.map((i) => <option key={i} value={i}>{AROMATIC_INTENSITY_LABELS[i]}</option>)}
            </select>
          </label>
        </div>
        <Casillas leyenda="Familias" opciones={FAMILIAS} etiquetas={FAMILY_LABELS} valor={perfil.families} onChange={campo("families")} disabled={locked} />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={claseEtiqueta}>Notas de salida
            <input value={perfil.topNotes} onChange={(e) => campo("topNotes")(e.target.value)} className={claseCampo} />
          </label>
          <label className={claseEtiqueta}>Notas de corazón
            <input value={perfil.middleNotes} onChange={(e) => campo("middleNotes")(e.target.value)} className={claseCampo} />
          </label>
          <label className={claseEtiqueta}>Notas de fondo
            <input value={perfil.baseNotes} onChange={(e) => campo("baseNotes")(e.target.value)} className={claseCampo} />
          </label>
          <label className={claseEtiqueta}>Notas principales
            <input value={perfil.mainNotes} onChange={(e) => campo("mainNotes")(e.target.value)} className={claseCampo} />
            <span className={claseAyuda}>3 a 5 notas: se usan en tarjetas, asesor y buscador.</span>
          </label>
          <label className={`${claseEtiqueta} sm:col-span-2`}>Acordes
            <input value={perfil.accords} onChange={(e) => campo("accords")(e.target.value)} className={claseCampo} />
          </label>
        </div>
        <Casillas leyenda="Ocasiones" opciones={OCASIONES} etiquetas={OCCASION_LABELS} valor={perfil.occasions} onChange={campo("occasions")} disabled={locked} />
        <Casillas leyenda="Estaciones" opciones={ESTACIONES} etiquetas={SEASON_LABELS} valor={perfil.seasons} onChange={campo("seasons")} disabled={locked} />
        <label className={claseEtiqueta}>Descripción sensorial
          <textarea rows={4} maxLength={1200} value={perfil.feel} onChange={(e) => campo("feel")(e.target.value)} className={`${claseCampo} normal-case tracking-normal`} />
          <span className={claseAyuda}>Redacción propia de NOX. No copiar textos de terceros.</span>
        </label>
        <label className={claseEtiqueta}>Te puede gustar si…
          <textarea rows={3} value={perfil.likeIf} onChange={(e) => campo("likeIf")(e.target.value)} className={`${claseCampo} normal-case tracking-normal`} />
          <span className={claseAyuda}>Una frase por línea.</span>
        </label>
      </fieldset>

      <div aria-live="polite" className="space-y-3">
        {error && error.modo === mode ? <p role="alert" className={claseError}>{error.texto}</p> : null}
        {ok && ok.modo === mode ? <p role="status" className={claseOk}>{ok.texto}</p> : null}
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-edge pt-6">
        <button type="submit" disabled={locked} className={claseBoton} aria-busy={saving}>
          {saving ? "Guardando…" : etiquetaBoton}
        </button>
        <span className="text-[12px] text-mist">
          {mode === "propose-revision" ? "Queda pendiente de aprobación." : "No modifica el stock."}
        </span>
      </div>
    </form>
  );
}
