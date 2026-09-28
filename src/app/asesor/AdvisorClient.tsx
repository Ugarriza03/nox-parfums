"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { Button, ButtonLink, IconArrow, IconWhatsApp, Reveal } from "@/components/ui";
import { ProductCover } from "@/components/product/ProductCover";
import { AddedFlash, OrderControl, RemoveFromOrder } from "@/components/order/OrderControl";
import {
  EMPTY_ANSWERS,
  NOTE_GROUPS,
  answersToMessageFields,
  hasEnoughSignal,
  recommend,
  type AdvisorAnswers
} from "@/lib/advisor";
import { advisorEnquiryLink } from "@/lib/whatsapp";
import {
  FAMILY_LABELS,
  OCCASION_LABELS,
  type Family,
  type Gender,
  type IntensityPreference,
  type Occasion
} from "@/data/types";

/* ------------------------------------------------------------- definiciones */

const FAMILY_OPTIONS: { value: Family | "sin-definir"; label: string; hint: string }[] = [
  { value: "citrico-fresco", label: "Fresco y cítrico", hint: "Limpio, luminoso, liviano" },
  { value: "gourmand-dulce", label: "Dulce y gourmand", hint: "Vainilla, caramelo, café" },
  { value: "amaderado", label: "Amaderado", hint: "Cedro, sándalo, vetiver" },
  { value: "especiado", label: "Especiado", hint: "Pimienta, canela, cardamomo" },
  { value: "floral", label: "Floral", hint: "Jazmín, rosa, azahar" },
  { value: "aromatico-limpio", label: "Limpio", hint: "Lavanda, hierbas, almizcle" },
  { value: "ambarado-intenso", label: "Ambarado", hint: "Ámbar, resinas, calidez y profundidad" },
  { value: "sin-definir", label: "No estoy seguro", hint: "Seguimos y vemos" }
];

const OCCASION_OPTIONS: Occasion[] = [
  "diario",
  "trabajo",
  "cita",
  "noche",
  "evento",
  "regalo",
  "versatil"
];

/**
 * Preferencia de presencia. Es una lectura de CARÁCTER aromático: se cruza con
 * `aromaticIntensity`, no con duración ni proyección.
 */
const INTENSITY_OPTIONS: { value: IntensityPreference | "sin-definir"; label: string; hint: string }[] = [
  { value: "discreta", label: "Discreta", hint: "Perfil suave y contenido" },
  { value: "equilibrada", label: "Equilibrada", hint: "Carácter definido, sin ser dominante" },
  { value: "marcada", label: "Que se note", hint: "Carácter marcado e intenso" },
  { value: "sin-definir", label: "Me da igual", hint: "" }
];

const GENDER_OPTIONS: { value: Gender | "indistinto"; label: string }[] = [
  { value: "masculino", label: "Masculino" },
  { value: "femenino", label: "Femenino" },
  { value: "unisex", label: "Unisex" },
  { value: "indistinto", label: "Indistinto" }
];

/** Las tres preguntas obligatorias. */
const CORE_STEPS = ["Aroma", "Notas", "Ocasión"];

/** Refinamiento opcional: sólo si el usuario lo pide desde la pantalla de decisión. */
const REFINE_STEPS = ["Intensidad", "Perfil"];

/**
 * Fases del asesor:
 *   preguntas → decision → (refinar) → resultados
 * Después de la tercera pregunta NO se avanza solo: se pregunta qué quiere hacer.
 */
type Phase = "preguntas" | "decision" | "refinar" | "resultados";

/* --------------------------------------------------------------- componente */

export function AdvisorClient() {
  const [phase, setPhase] = useState<Phase>("preguntas");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AdvisorAnswers>(EMPTY_ANSWERS);
  /** true si el usuario pasó por el refinamiento opcional. */
  const [refined, setRefined] = useState(false);

  const set = <K extends keyof AdvisorAnswers>(key: K, value: AdvisorAnswers[K]) =>
    setAnswers((a) => ({ ...a, [key]: value }));

  const reiniciar = () => {
    setAnswers(EMPTY_ANSWERS);
    setStep(0);
    setRefined(false);
    setPhase("preguntas");
  };

  /** Avanza dentro de la fase actual. Al terminar las 3 obligatorias, frena. */
  const next = () => {
    if (phase === "preguntas") {
      if (step >= CORE_STEPS.length - 1) setPhase("decision");
      else setStep((s) => s + 1);
      return;
    }
    if (phase === "refinar") {
      if (step >= REFINE_STEPS.length - 1) {
        setRefined(true);
        setPhase("resultados");
      } else setStep((s) => s + 1);
    }
  };

  const back = () => {
    if (phase === "refinar" && step === 0) {
      setPhase("decision");
      return;
    }
    if (phase === "decision") {
      setPhase("preguntas");
      setStep(CORE_STEPS.length - 1);
      return;
    }
    setStep((s) => Math.max(0, s - 1));
  };

  const abrirRefinamiento = () => {
    setStep(0);
    setPhase("refinar");
  };

  const toggleNote = (id: string) =>
    setAnswers((a) => ({
      ...a,
      notesOpen: false,
      noteGroups: a.noteGroups.includes(id)
        ? a.noteGroups.filter((x) => x !== id)
        : [...a.noteGroups, id]
    }));

  if (phase === "resultados") {
    return (
      <Results
        answers={answers}
        refined={refined}
        onRestart={reiniciar}
        onRefine={abrirRefinamiento}
      />
    );
  }

  if (phase === "decision") {
    return (
      <DecisionScreen
        answers={answers}
        onBack={back}
        onResults={() => setPhase("resultados")}
        onRefine={abrirRefinamiento}
      />
    );
  }

  const enRefinamiento = phase === "refinar";
  const pasos = enRefinamiento ? REFINE_STEPS : CORE_STEPS;

  return (
    <section className="pt-28 md:pt-36">
      <div className="nox-shell pb-20">
        {/* Progreso */}
        <div className="mb-10 md:mb-14">
          <div className="flex items-center justify-between">
            <p className="nox-eyebrow">
              {enRefinamiento && <span className="text-mist/60">Afinando · </span>}
              Paso {step + 1} de {pasos.length}
            </p>
            <button
              type="button"
              onClick={back}
              className="text-[12px] text-mist transition-colors hover:text-bone"
            >
              Volver
            </button>
          </div>
          <div className="mt-4 flex gap-1.5">
            {pasos.map((label, i) => (
              <div
                key={label}
                className={`h-px flex-1 transition-all duration-700 ease-nox ${
                  i <= step ? "bg-bone" : "bg-edge"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ------------------------- preguntas obligatorias ------------------------- */}

        {!enRefinamiento && step === 0 && (
          <Question
            key="q1"
            title="¿Qué tipo de aroma te atrae?"
            lead="Elegí el que más se acerque. No hay respuesta incorrecta."
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {FAMILY_OPTIONS.map((option) => (
                <OptionCard
                  key={option.value}
                  label={option.label}
                  hint={option.hint}
                  active={answers.family === option.value}
                  onClick={() => {
                    set("family", option.value);
                    setTimeout(next, 180);
                  }}
                />
              ))}
            </div>
          </Question>
        )}

        {!enRefinamiento && step === 1 && (
          <Question
            key="q2"
            title="¿Qué notas te gustan?"
            lead="Podés elegir varias. También podés saltear esta parte."
          >
            <div className="flex flex-wrap gap-2.5">
              {NOTE_GROUPS.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => toggleNote(group.id)}
                  className={`rounded-full border px-4 py-2.5 text-[13px] transition-all duration-300 ease-nox ${
                    answers.noteGroups.includes(group.id)
                      ? "border-bone bg-bone text-void"
                      : "border-edge text-haze hover:border-mist hover:text-bone"
                  }`}
                  aria-pressed={answers.noteGroups.includes(group.id)}
                >
                  {group.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setAnswers((a) => ({ ...a, noteGroups: [], notesOpen: true }));
                setTimeout(next, 180);
              }}
              className={`mt-6 inline-flex items-center gap-2 text-[13px] underline underline-offset-4 transition-colors ${
                answers.notesOpen ? "text-bone" : "text-mist hover:text-bone"
              }`}
            >
              No sé, prefiero que me guíen
            </button>

            <div className="mt-10">
              <Button onClick={next} size="lg">
                Continuar <IconArrow />
              </Button>
            </div>
          </Question>
        )}

        {!enRefinamiento && step === 2 && (
          <Question
            key="q3"
            title="¿Para qué ocasión lo buscás?"
            lead="Con esto ya tenemos con qué orientarte."
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {OCCASION_OPTIONS.map((occasion) => (
                <OptionCard
                  key={occasion}
                  label={OCCASION_LABELS[occasion]}
                  active={answers.occasion === occasion}
                  onClick={() => {
                    set("occasion", occasion);
                    setTimeout(next, 180);
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={next}
              className="mt-8 text-[13px] text-mist underline underline-offset-4 transition-colors hover:text-bone"
            >
              Saltear
            </button>
          </Question>
        )}

        {/* --------------------------- refinamiento opcional --------------------------- */}

        {enRefinamiento && step === 0 && (
          <Question
            key="r1"
            title="¿Qué intensidad preferís?"
            lead="Opcional. Si no lo tenés claro, seguí de largo."
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {INTENSITY_OPTIONS.map((option) => (
                <OptionCard
                  key={option.value}
                  label={option.label}
                  hint={option.hint}
                  active={answers.intensity === option.value}
                  onClick={() => {
                    set("intensity", option.value);
                    setTimeout(next, 180);
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={next}
              className="mt-8 text-[13px] text-mist underline underline-offset-4 transition-colors hover:text-bone"
            >
              Saltear
            </button>
          </Question>
        )}

        {enRefinamiento && step === 1 && (
          <Question key="r2" title="¿Preferís algún perfil?" lead="Opcional.">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {GENDER_OPTIONS.map((option) => (
                <OptionCard
                  key={option.value}
                  label={option.label}
                  active={answers.gender === option.value}
                  onClick={() => {
                    set("gender", option.value);
                    setTimeout(next, 200);
                  }}
                />
              ))}
            </div>
            <div className="mt-10">
              <Button onClick={next} size="lg">
                Ver mis recomendaciones <IconArrow />
              </Button>
            </div>
          </Question>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------ pantalla de decisión */

/**
 * Pantalla intermedia después de las tres preguntas obligatorias.
 * Evita empujar al usuario a un cuestionario más largo: con tres respuestas ya
 * se puede recomendar, y afinar queda como opción discreta.
 */
function DecisionScreen({
  answers,
  onBack,
  onResults,
  onRefine
}: {
  answers: AdvisorAnswers;
  onBack: () => void;
  onResults: () => void;
  onRefine: () => void;
}) {
  const waHref = advisorEnquiryLink(answersToMessageFields(answers));

  return (
    <section className="pt-28 md:pt-36">
      <div className="nox-shell pb-24">
        <Reveal>
          <div className="flex items-center justify-between">
            <p className="nox-eyebrow">Listo</p>
            <button
              type="button"
              onClick={onBack}
              className="text-[12px] text-mist transition-colors hover:text-bone"
            >
              Volver
            </button>
          </div>

          <h1 className="mt-5 max-w-2xl font-display text-[32px] leading-[1.08] text-bone md:text-[50px]">
            Ya tenemos suficiente para orientarte.
          </h1>

          <AnswerSummary answers={answers} />
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 md:mt-12">
            <button
              type="button"
              onClick={onResults}
              className="flex flex-col items-start rounded-2xl border border-bone bg-white/[0.05] p-6 text-left transition-all duration-400 ease-nox hover:bg-white/[0.08]"
            >
              <span className="font-display text-[22px] text-bone md:text-[26px]">
                Ver mis recomendaciones
              </span>
              <span className="mt-2 text-[13px] leading-relaxed text-mist">
                Con lo que respondiste ya podemos mostrarte fragancias compatibles.
              </span>
              <span className="mt-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-haze">
                Ver ahora <IconArrow />
              </span>
            </button>

            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-start rounded-2xl border border-edge/70 p-6 transition-all duration-400 ease-nox hover:border-mist/60"
            >
              <span className="font-display text-[22px] text-bone md:text-[26px]">
                Quiero asesoramiento personalizado
              </span>
              <span className="mt-2 text-[13px] leading-relaxed text-mist">
                Te escribimos por WhatsApp con tus respuestas ya cargadas.
              </span>
              <span className="mt-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-haze">
                <IconWhatsApp /> Abrir WhatsApp
              </span>
            </a>
          </div>
        </Reveal>

        <Reveal delay={140}>
          <button
            type="button"
            onClick={onRefine}
            className="mt-8 inline-flex items-center gap-2 text-[13px] text-mist underline underline-offset-4 transition-colors hover:text-bone"
          >
            Afinar un poco más
            <span className="text-mist/60">· dos preguntas opcionales</span>
          </button>
        </Reveal>
      </div>
    </section>
  );
}

/** Resumen de respuestas, compartido por la pantalla de decisión y los resultados. */
function AnswerSummary({ answers }: { answers: AdvisorAnswers }) {
  const summary = answersToMessageFields(answers);
  const visibles = Object.entries(summary).filter(
    ([, v]) => v && v !== "Sin preferencia" && v !== "Sin definir"
  );
  if (visibles.length === 0) return null;

  return (
    <dl className="mt-7 flex flex-wrap gap-x-8 gap-y-3">
      {visibles.map(([k, v]) => (
        <div key={k}>
          <dt className="text-[10px] uppercase tracking-[0.16em] text-mist/70">{k}</dt>
          <dd className="mt-1 text-[13px] text-haze">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ------------------------------------------------------------------- piezas */

function Question({
  title,
  lead,
  children
}: {
  title: string;
  lead?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h1 className="max-w-2xl font-display text-[30px] leading-[1.1] text-bone md:text-[46px]">
        {title}
      </h1>
      {lead && <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-mist">{lead}</p>}
      <div className="mt-9 md:mt-12">{children}</div>
    </div>
  );
}

function OptionCard({
  label,
  hint,
  active,
  onClick
}: {
  label: string;
  hint?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group flex min-h-[96px] flex-col items-start justify-between rounded-2xl border p-5 text-left transition-all duration-400 ease-nox ${
        active
          ? "border-bone bg-white/[0.06]"
          : "border-edge/70 hover:border-mist/60 hover:bg-white/[0.025]"
      }`}
    >
      <span className="font-display text-[19px] leading-tight text-bone md:text-[21px]">
        {label}
      </span>
      {hint && <span className="mt-2 text-[12px] leading-relaxed text-mist">{hint}</span>}
    </button>
  );
}

/* --------------------------------------------------------------- resultados */

function Results({
  answers,
  refined,
  onRestart,
  onRefine
}: {
  answers: AdvisorAnswers;
  refined: boolean;
  onRestart: () => void;
  onRefine: () => void;
}) {
  const results = useMemo(() => recommend(answers, 5), [answers]);
  const enough = hasEnoughSignal(answers);
  const waHref = advisorEnquiryLink(answersToMessageFields(answers));
  const hayResultados = enough && results.length > 0;

  return (
    <section className="pt-28 md:pt-36">
      <div className="nox-shell pb-24">
        <Reveal>
          <p className="nox-eyebrow">{refined ? "Recomendaciones afinadas" : "Recomendaciones"}</p>
          <h1 className="mt-4 max-w-2xl font-display text-[32px] leading-[1.08] text-bone md:text-[50px]">
            {hayResultados
              ? "Esto es lo que te recomendamos"
              : "Necesitamos charlar un poco más"}
          </h1>
          <AnswerSummary answers={answers} />
        </Reveal>

        {!hayResultados && (
          <Reveal delay={80}>
            <p className="mt-8 max-w-xl text-[13px] leading-relaxed text-mist">
              Con lo que respondiste no nos alcanza para recomendarte con criterio, y preferimos
              no tirar nombres al azar. Escribinos y lo resolvemos en dos mensajes.
            </p>
            <ButtonLink href={waHref} external variant="whatsapp" size="lg" className="mt-8">
              <IconWhatsApp /> Quiero asesoramiento personalizado
            </ButtonLink>
          </Reveal>
        )}

        {hayResultados && (
          <div className="mt-12 flex flex-col gap-4 md:mt-16 md:gap-5">
            {results.map((rec, index) => (
              <Reveal key={rec.product.slug} delay={index * 70}>
                <RecommendationRow rec={rec} />
              </Reveal>
            ))}
          </div>
        )}

        {/* Salidas secundarias */}
        {hayResultados && (
          <Reveal delay={140}>
            <div className="mt-12 flex flex-col gap-4 border-t border-edge/50 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-sm text-[13px] leading-relaxed text-mist">
                ¿Ninguna te cierra del todo? Contanos y te ayudamos a elegir.
              </p>
              <ButtonLink href={waHref} external variant="outline" className="shrink-0">
                <IconWhatsApp /> Quiero asesoramiento personalizado
              </ButtonLink>
            </div>
          </Reveal>
        )}

        <Reveal delay={180}>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
            {!refined && (
              <button
                type="button"
                onClick={onRefine}
                className="text-[13px] text-mist underline underline-offset-4 transition-colors hover:text-bone"
              >
                Afinar un poco más
              </button>
            )}
            <button
              type="button"
              onClick={onRestart}
              className="text-[13px] text-mist underline underline-offset-4 transition-colors hover:text-bone"
            >
              Empezar de nuevo
            </button>
            <Link
              href="/catalogo"
              className="text-[13px] text-mist underline underline-offset-4 transition-colors hover:text-bone"
            >
              Ver el catálogo completo
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function RecommendationRow({
  rec
}: {
  rec: { product: ReturnType<typeof recommend>[number]["product"]; reasons: string[] };
}) {
  const product = rec.product;

  return (
    <div className="flex gap-4 rounded-2xl border border-edge/60 p-4 transition-colors duration-500 hover:border-mist/50 md:gap-6 md:p-5">
      <Link
        href={`/fragancia/${product.slug}`}
        className="block w-24 shrink-0 overflow-hidden rounded-xl md:w-36"
      >
        {/* Misma portada que el catálogo y la ficha. ProductCover es el punto
            único de decisión del proyecto: si el producto tiene foto real la
            muestra, y si no cae en la composición generada. Llamar al
            componente de respaldo directamente desde acá era lo que hacía que
            el asesor mostrara siempre la composición aunque la fragancia
            tuviera su portada. */}
        <div className="aspect-[4/5] w-full">
          <ProductCover product={product} size="thumb" />
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <p className="text-[10px] uppercase tracking-[0.18em] text-mist">Inspirado en</p>
        <h3 className="mt-1">
          <Link
            href={`/fragancia/${product.slug}`}
            className="font-display text-[20px] leading-tight text-bone transition-colors hover:text-white md:text-[26px]"
          >
            {product.inspiredBy}
          </Link>
        </h3>

        <ul className="mt-3 flex flex-col gap-1.5">
          {rec.reasons.slice(0, 3).map((reason) => (
            <li key={reason} className="flex gap-2.5 text-[12px] leading-relaxed text-mist md:text-[13px]">
              <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-steel" aria-hidden="true" />
              {reason}
            </li>
          ))}
        </ul>

        {/* Agregar y ajustar cantidad sin pasar por la ficha ni por Mi pedido */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <OrderControl product={product} variant="row" addLabel="Agregar al pedido" />
          <AddedFlash product={product} />
          <RemoveFromOrder product={product} />
          <Link
            href={`/fragancia/${product.slug}`}
            className="text-[12px] text-mist underline underline-offset-4 transition-colors hover:text-bone"
          >
            Ver ficha
          </Link>
        </div>
      </div>
    </div>
  );
}
