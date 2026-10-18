import Link from "next/link";
import { notFound } from "next/navigation";
import { requerirAdmin } from "@/lib/admin/sesion";
import {
  Aviso, ChipEstadoCatalogo, ChipRevision, Subtitulo, Tarjeta, claseOk, fecha
} from "@/components/admin/ui";
import { CatalogEditorConPortada } from "@/components/admin/CatalogEditorConPortada";
import { EditorComplementos } from "@/components/admin/EditorComplementos";
import { AuditoriaPortadas } from "@/components/admin/AuditoriaPortadas";
import { AccionesRevision } from "@/components/admin/AccionesRevision";
import { ControlesEstadoCatalogo } from "@/components/admin/ControlesEstadoCatalogo";
import {
  AROMATIC_INTENSITY_LABELS, ETIQUETA_CATEGORIA, ETIQUETA_GENERO, ETIQUETA_ORIGEN, FAMILY_LABELS,
  diferenciasRevision, esFuncionAusente, esSlugValido, type CategoriaCatalogo, type EstadoCatalogo,
  type GeneroCatalogo, type OrigenCatalogo
} from "@/lib/admin/catalogo-v2";
import { productoAdmin } from "@/lib/admin/catalogo";
import {
  avisoFicha, leerAvisoUrl, valoresComplementos, valoresEditor, versionFicha, type FilaFicha, type VersionFicha
} from "@/lib/admin/ficha-sincronizacion";
import { guardarEdicionCatalogo } from "./acciones";

export const metadata = { title: "Ficha del catálogo" };

const ACCION_LOG: Record<string, string> = {
  create: "Creación", update: "Edición", publish: "Publicación", hide: "Ocultamiento",
  archive: "Archivado", restore: "Restauración", discard_revision: "Revisión descartada"
};

function valorLegible(clave: string, v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (clave === "gender") return ETIQUETA_GENERO[v as GeneroCatalogo] ?? String(v);
  if (clave === "universe") return ETIQUETA_CATEGORIA[v as CategoriaCatalogo] ?? String(v);
  if (clave === "origin") return ETIQUETA_ORIGEN[v as OrigenCatalogo] ?? String(v);
  if (typeof v === "string") return v;
  return JSON.stringify(v, null, 2);
}

function Lista({ titulo, valores }: { titulo: string; valores: unknown }) {
  const items = Array.isArray(valores) ? valores.filter((x) => typeof x === "string") : [];
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-mist">{titulo}</dt>
      <dd className="mt-1 text-[13.5px] text-haze">{items.length ? items.join(" · ") : "—"}</dd>
    </div>
  );
}

export default async function FichaCatalogoAdmin({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase } = await requerirAdmin();
  const { slug } = await params;
  const avisoUrl = leerAvisoUrl(await searchParams);
  if (!esSlugValido(slug)) notFound();

  const { data, error } = await supabase
    .from("catalog_products")
    .select("slug,house,fragrance_name,gender,universe,origin,status,olfactory,image_path,description,inspired_label,data_status,performance,created_at,updated_at")
    .eq("slug", slug)
    .maybeSingle();
  if (error) return <Aviso tono="error">No se pudo consultar esta ficha del catálogo V2. Probá actualizar la página.</Aviso>;
  if (!data) notFound();

  const [revision, historial] = await Promise.all([
    supabase.from("catalog_revisions").select("proposed_data,proposed_at,base_updated_at").eq("product_slug", slug).maybeSingle(),
    supabase.from("catalog_change_log").select("id,action,created_at,actor_id").eq("product_slug", slug)
      .order("created_at", { ascending: false }).limit(10)
  ]);

  // Disponibilidad del descarte: una llamada con identificador vacío falla en la
  // validación (NX401/NX422) sin escribir nada si la función existe; si no
  // existe, PostgREST responde PGRST202. Sólo se consulta si hay revisión.
  let descarteDisponible = true;
  if (revision.data) {
    const sonda = await supabase.rpc("nox_catalog_descartar_revision", { p_slug: "" });
    descarteDisponible = !esFuncionAusente(sonda.error);
  }

  const estado = data.status as EstadoCatalogo;
  const perfil = (data.olfactory ?? null) as Record<string, unknown> | null;
  const rutaPortada = typeof data.image_path === "string" && data.image_path.startsWith(`covers/${slug}/`) ? data.image_path : null;
  // URL firmada efímera (60 s), generada en servidor tras autenticar con MFA. No se persiste.
  const portada = rutaPortada ? await supabase.storage.from("nox-catalog-covers").createSignedUrl(rutaPortada, 60) : null;

  const actual: Record<string, unknown> = {
    house: data.house, fragrance_name: data.fragrance_name, gender: data.gender, universe: data.universe,
    origin: data.origin, image_path: data.image_path, olfactory: data.olfactory, inspired_label: data.inspired_label,
    description: data.description, data_status: data.data_status, performance: data.performance
  };
  const propuesta = (revision.data?.proposed_data ?? null) as Record<string, unknown> | null;
  const cambios = propuesta ? diferenciasRevision(actual, propuesta) : [];
  const editable = estado === "draft" || estado === "published";

  // Versión que ven los formularios. Si cambia (aprobación, guardado, cambio de
  // estado), se reinician con los datos actuales; el servidor rechaza guardados
  // hechos sobre una versión anterior.
  const version: VersionFicha = {
    updatedAt: String(data.updated_at),
    estado,
    revisionAt: typeof revision.data?.proposed_at === "string" ? revision.data.proposed_at : null
  };
  const claveVersion = versionFicha(version);
  const guardarConVersion = guardarEdicionCatalogo.bind(null, version);
  const aviso = avisoFicha(avisoUrl, estado, Boolean(revision.data));
  const portadaPropuesta = propuesta && Object.hasOwn(propuesta, "image_path") && propuesta.image_path !== data.image_path
    ? propuesta.image_path : undefined;

  return (
    <div className="space-y-6">
      <nav aria-label="Ruta" className="text-[13px] text-mist">
        <Link href="/admin/catalogo" className="hover:text-bone">Catálogo</Link>
        <span aria-hidden="true" className="mx-2">/</span>
        <span className="text-haze">{data.house} {data.fragrance_name}</span>
      </nav>

      <header className="flex flex-col gap-4 border-b border-edge pb-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-widest text-mist">{data.house}</p>
          <h1 className="mt-2 font-display text-[32px] leading-tight text-bone md:text-[40px]">{data.fragrance_name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <ChipEstadoCatalogo estado={estado} />
            {revision.data ? <ChipRevision /> : null}
            <span className="font-mono text-[12px] text-mist">{data.slug}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-[13px]">
          {productoAdmin(slug) ? (
            <Link href={`/admin/inventario/${encodeURIComponent(slug)}`} className="text-mist underline-offset-4 hover:text-bone hover:underline">
              Ver stock en Inventario
            </Link>
          ) : (
            <span className="text-mist">Sin inventario: fragancia nueva fuera del catálogo histórico</span>
          )}
        </div>
      </header>

      {aviso ? <p role="status" className={claseOk}>{aviso}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          {revision.error ? (
            <Aviso tono="error">No se pudo verificar si existen revisiones pendientes.</Aviso>
          ) : revision.data ? (
            <Tarjeta className="border-steel/30">
              <Subtitulo descripcion={`Propuesta guardada el ${fecha(revision.data.proposed_at)}. La ficha actual no cambia hasta aprobarla.`}>
                Revisión pendiente
              </Subtitulo>
              {cambios.length === 0 ? (
                <p className="mb-5 text-[13px] text-mist">La propuesta no tiene diferencias con la ficha actual.</p>
              ) : (
                <div className="mb-6 overflow-x-auto rounded-xl border border-edge">
                  <table className="w-full min-w-[560px] border-collapse text-left text-[13px]">
                    <caption className="sr-only">Cambios propuestos</caption>
                    <thead>
                      <tr>
                        <th scope="col" className="border-b border-edge px-4 py-2.5 text-[11px] font-normal uppercase tracking-wider text-mist">Campo</th>
                        <th scope="col" className="border-b border-edge px-4 py-2.5 text-[11px] font-normal uppercase tracking-wider text-mist">Actual</th>
                        <th scope="col" className="border-b border-edge px-4 py-2.5 text-[11px] font-normal uppercase tracking-wider text-mist">Propuesto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cambios.map((c) => (
                        <tr key={c.clave}>
                          <th scope="row" className="border-b border-edge/60 px-4 py-3 align-top font-normal text-haze">{c.etiqueta}</th>
                          <td className="border-b border-edge/60 px-4 py-3 align-top text-mist">
                            <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words font-sans">{valorLegible(c.clave, c.antes)}</pre>
                          </td>
                          <td className="border-b border-edge/60 px-4 py-3 align-top text-bone">
                            <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words font-sans">{valorLegible(c.clave, c.despues)}</pre>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <AccionesRevision slug={slug} puedeAprobar={estado === "published"} descarteDisponible={descarteDisponible} version={version} />
            </Tarjeta>
          ) : null}

          {editable ? (
            <CatalogEditorConPortada
              slug={slug}
              mode={estado === "draft" ? "edit-draft" : "propose-revision"}
              initial={valoresEditor(data as FilaFicha, propuesta)}
              version={claveVersion}
              hayRevision={Boolean(propuesta)}
              onSave={guardarConVersion}
            />
          ) : (
            <Aviso>
              Esta fragancia está {estado === "hidden" ? "oculta" : "archivada"}: no se puede editar.
              {estado === "hidden" ? " Volvé a publicarla para proponer cambios." : " Restaurala como borrador para editarla."}
            </Aviso>
          )}

          {editable ? (
            <Tarjeta>
              <Subtitulo descripcion={estado === "published" ? "En fichas publicadas, estos cambios también quedan como revisión." : undefined}>
                Información complementaria
              </Subtitulo>
              <EditorComplementos slug={slug} status={estado} version={version}
                initial={valoresComplementos(data as FilaFicha, propuesta)} />
            </Tarjeta>
          ) : null}
        </div>

        <aside className="min-w-0 space-y-6">
          <Tarjeta>
            <Subtitulo>Publicación</Subtitulo>
            <ControlesEstadoCatalogo
              slug={slug}
              estado={estado}
              bloqueoPublicar={revision.data && estado === "hidden" ? "Hay una revisión pendiente: aprobala o descartala antes de volver a publicar." : null}
            />
            <p className="mt-5 text-[12px] leading-relaxed text-mist">
              El catálogo V2 todavía no alimenta la tienda pública: publicar acá no cambia lo que ven los clientes.
            </p>
          </Tarjeta>

          <Tarjeta>
            <Subtitulo>Ficha actual</Subtitulo>
            <dl className="grid gap-3 text-[13.5px]">
              <div><dt className="text-[11px] uppercase tracking-wider text-mist">Género</dt><dd className="mt-1 text-haze">{valorLegible("gender", data.gender)}</dd></div>
              <div><dt className="text-[11px] uppercase tracking-wider text-mist">Categoría</dt><dd className="mt-1 text-haze">{valorLegible("universe", data.universe)}</dd></div>
              <div><dt className="text-[11px] uppercase tracking-wider text-mist">Origen</dt><dd className="mt-1 text-haze">{valorLegible("origin", data.origin)}</dd></div>
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-mist">Familia</dt>
                <dd className="mt-1 text-haze">{typeof perfil?.family === "string" ? FAMILY_LABELS[perfil.family as keyof typeof FAMILY_LABELS] ?? perfil.family : "—"}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-mist">Carácter</dt>
                <dd className="mt-1 text-haze">{typeof perfil?.aromaticIntensity === "string" ? AROMATIC_INTENSITY_LABELS[perfil.aromaticIntensity as keyof typeof AROMATIC_INTENSITY_LABELS] ?? perfil.aromaticIntensity : "—"}</dd>
              </div>
              <Lista titulo="Notas principales" valores={perfil?.mainNotes} />
              <Lista titulo="Acordes" valores={perfil?.accords} />
              <div><dt className="text-[11px] uppercase tracking-wider text-mist">Actualizada</dt><dd className="mt-1 text-haze">{fecha(data.updated_at)}</dd></div>
            </dl>
          </Tarjeta>

          <Tarjeta>
            <Subtitulo>Portada</Subtitulo>
            {rutaPortada ? (
              portada?.data?.signedUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={portada.data.signedUrl} alt={`Portada de ${data.fragrance_name}`} referrerPolicy="no-referrer"
                  className="max-h-72 w-auto rounded-xl border border-edge object-contain" />
              ) : (
                <Aviso tono="error">No se pudo obtener la portada privada. Actualizá la página.</Aviso>
              )
            ) : (
              <p className="text-[13px] leading-relaxed text-mist">
                Sin portada en almacenamiento privado. La tienda sigue usando la portada local validada.
              </p>
            )}
            {portadaPropuesta !== undefined ? (
              <p className="mt-4 text-[12.5px] leading-relaxed text-mist">
                {portadaPropuesta
                  ? "La revisión pendiente propone una portada nueva: se aplica a la ficha recién al aprobarla."
                  : "La revisión pendiente quita la portada: se aplica recién al aprobarla."}
              </p>
            ) : null}
            <div className="mt-5 border-t border-edge pt-5">
              <AuditoriaPortadas slug={slug} />
            </div>
          </Tarjeta>

          <Tarjeta>
            <Subtitulo>Historial</Subtitulo>
            {historial.error ? (
              <p className="text-[13px] text-mist">No se pudo leer el historial.</p>
            ) : (historial.data ?? []).length === 0 ? (
              <p className="text-[13px] text-mist">Sin cambios registrados desde la carga inicial.</p>
            ) : (
              <ol className="space-y-2.5">
                {(historial.data ?? []).map((h) => (
                  <li key={h.id} className="flex items-baseline justify-between gap-3 text-[13px]">
                    <span className="text-haze">{ACCION_LOG[h.action] ?? h.action}</span>
                    <span className="whitespace-nowrap text-[12px] text-mist">{fecha(h.created_at)}</span>
                  </li>
                ))}
              </ol>
            )}
          </Tarjeta>

          <p className="text-[12px] leading-relaxed text-mist">
            El stock no se modifica desde el catálogo. Cantidades y movimientos se registran sólo en Inventario.
          </p>
        </aside>
      </div>
    </div>
  );
}
