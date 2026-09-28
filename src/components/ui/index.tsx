"use client";

/** KIT BASE DE INTERFAZ NOX */

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode
} from "react";

/* ------------------------------------------------------------------ Reveal */

export function Reveal({
  children,
  delay = 0,
  className = ""
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`nox-reveal ${className}`}
      data-visible={visible}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ Button */

type Variant = "primary" | "outline" | "ghost" | "whatsapp";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-bone text-void hover:bg-white active:scale-[0.985] shadow-[0_1px_0_rgba(255,255,255,0.35)_inset]",
  outline:
    "border border-edge text-bone hover:border-mist hover:bg-white/[0.04] active:scale-[0.985]",
  ghost: "text-haze hover:text-bone",
  whatsapp:
    "bg-[#1E4D3B] text-[#DDF3E6] border border-[#2C6B52] hover:bg-[#256045] active:scale-[0.985]"
};

const SIZES: Record<Size, string> = {
  sm: "h-10 px-4 text-[12px]",
  md: "h-12 px-6 text-[13px]",
  lg: "h-14 px-8 text-[13px]"
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium uppercase tracking-[0.14em] transition-all duration-300 ease-nox disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap";

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className = "",
  external = false,
  children,
  onClick
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  external?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  const classes = `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} onClick={onClick}>
      {children}
    </Link>
  );
}

/* -------------------------------------------------------------------- Chip */

export function Chip({
  active = false,
  children,
  onClick,
  as = "button"
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  as?: "button" | "span";
}) {
  const classes = `inline-flex items-center rounded-full border px-3.5 py-2 text-[12px] tracking-[0.06em] transition-all duration-250 ease-nox ${
    active
      ? "border-bone bg-bone text-void"
      : "border-edge text-haze hover:border-mist hover:text-bone"
  }`;
  if (as === "span") return <span className={classes}>{children}</span>;
  return (
    <button type="button" className={classes} onClick={onClick} aria-pressed={active}>
      {children}
    </button>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-edge/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-mist">
      {children}
    </span>
  );
}

/* ----------------------------------------------------------------- Section */

export function Section({
  children,
  className = "",
  id
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`py-16 md:py-24 ${className}`}>
      <div className="nox-shell">{children}</div>
    </section>
  );
}

export function SectionHead({
  eyebrow,
  title,
  lead,
  action
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-col gap-5 md:mb-14 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="nox-eyebrow mb-3">{eyebrow}</p>}
        <h2 className="font-display text-[30px] leading-[1.12] tracking-[-0.01em] text-bone md:text-[44px]">
          {title}
        </h2>
        {lead && <p className="mt-4 text-[14px] leading-relaxed text-mist md:text-[15px]">{lead}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* --------------------------------------------------------- QuantityStepper */

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  step = 1,
  label = "Cantidad"
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}) {
  return (
    <div
      className="inline-flex h-12 items-center rounded-full border border-edge"
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        className="grid h-12 w-12 place-items-center rounded-l-full text-haze transition-colors hover:text-bone disabled:opacity-30"
        onClick={() => onChange(Math.max(min, value - step))}
        disabled={value <= min}
        aria-label={`Quitar ${step}`}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <path d="M2 7h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
      <span className="min-w-[2.5rem] text-center text-[14px] tabular-nums text-bone" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className="grid h-12 w-12 place-items-center rounded-r-full text-haze transition-colors hover:text-bone disabled:opacity-30"
        onClick={() => onChange(Math.min(max, value + step))}
        disabled={value >= max}
        aria-label={`Agregar ${step}`}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------- Marca */

export function NoxMark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="NOX"
      className="shrink-0"
    >
      <defs>
        <radialGradient id="noxStone" cx="38%" cy="30%" r="85%">
          <stop offset="0%" stopColor="#1B2230" />
          <stop offset="60%" stopColor="#0E131C" />
          <stop offset="100%" stopColor="#070A0F" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="47" fill="url(#noxStone)" />
      <circle cx="50" cy="50" r="47" fill="none" stroke="#ECEAE5" strokeWidth="1.6" />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#ECEAE5"
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fontSize="34"
        letterSpacing="2.5"
      >
        NOX
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------ Nota de dato */

export function DataNotice({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-xl border border-edge/70 bg-white/[0.02] p-4">
      <svg width="16" height="16" viewBox="0 0 16 16" className="mt-0.5 shrink-0 text-steel" aria-hidden="true">
        <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M8 7.2v4M8 4.9v.9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <p className="text-[13px] leading-relaxed text-mist">{children}</p>
    </div>
  );
}

/* ----------------------------------------------------------------- Íconos */

export function IconWhatsApp({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.69 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.1-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.84-.2-.49-.4-.42-.55-.43h-.47c-.16 0-.43.06-.65.31-.22.24-.85.83-.85 2.03s.87 2.35.99 2.51c.12.17 1.71 2.62 4.15 3.67.58.25 1.03.4 1.39.51.58.19 1.11.16 1.53.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.29Z" />
    </svg>
  );
}

export function IconArrow({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M2 7h10M8.2 3.2 12 7l-3.8 3.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
