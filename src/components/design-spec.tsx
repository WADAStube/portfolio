import { useEffect, useState } from "react";
import { Reveal } from "@/components/motion-primitives";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/lang";

/* ────────────────────────────────────────────────────────────
   GESTALTUNGSANGABEN

   Drei Bausteine, die zeigen statt zu beschreiben:

     Palette     Farbflaechen mit Hex-Wert und Rolle
     LightSetup  Lichtaufbau als Draufsicht, mit Lichtfarben
     TypeSpec    die Schrift als Ausschnitt aus der Arbeit selbst

   Regel fuer alle drei: hoechstens ein Satz je Eintrag. Wer das
   Bild sehen will, soll nicht erst einen Absatz lesen muessen.
   ──────────────────────────────────────────────────────────── */

type Bi = { en: string; de: string };

/* ────────────────── Gemeinsamer Kopf ────────────────── */

function SpecHead({
  label,
  note,
  invert,
}: {
  label: string;
  note?: string;
  invert?: boolean;
}) {
  return (
    <div className="mb-7 flex items-baseline gap-5">
      <span
        className={cn(
          "shrink-0 text-[9px] uppercase tracking-[0.28em]",
          invert ? "text-black/55" : "text-white/55",
        )}
      >
        {label}
      </span>
      <span className={cn("h-px flex-1", invert ? "bg-black/12" : "bg-white/[0.12]")} />
      {note && (
        <span
          className={cn(
            "shrink-0 text-[9px] tracking-[0.08em]",
            invert ? "text-black/45" : "text-white/45",
          )}
        >
          {note}
        </span>
      )}
    </div>
  );
}

/* ────────────────── Farbpalette ────────────────── */

export interface Hue {
  hex: string;
  role: Bi;
  /** Ein Halbsatz, wofuer die Farbe da ist. Optional. */
  use?: Bi;
}

/* true ab 1024 px. Darunter bleibt das Raster bei zwei bis drei
   Spalten, sechs Farben nebeneinander waeren auf dem Handy
   unleserlich. */
function useWide(px = 1024) {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${px}px)`);
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [px]);
  return wide;
}

export function Palette({
  colors,
  why,
  invert,
  className,
}: {
  colors: Hue[];
  /** Warum diese Farben. Fehlt der Satz, steht keiner da. */
  why?: Bi;
  invert?: boolean;
  className?: string;
}) {
  const { lang } = useLang();
  const wide = useWide();

  return (
    <section className={className}>
      <SpecHead
        label={lang === "de" ? "Farbpalette" : "Colour palette"}
        invert={invert}
      />

      {/* Flaeche und Beschriftung stehen in derselben Spalte, sonst
          rutscht der Text beim Umbruch unter die falsche Farbe.
          Kein Abstand zwischen den Spalten: die Palette liest sich
          als ein durchgehendes Band. */}
      <dl
        className="grid grid-cols-2 sm:grid-cols-3"
        style={{
          /* Ab lg so viele Spalten wie Farben — sonst steht die
             Beschriftung unter der falschen Flaeche. */
          gridTemplateColumns: wide
            ? `repeat(${colors.length}, minmax(0, 1fr))`
            : undefined,
        }}
      >
        {colors.map((c) => (
          <div key={c.hex}>
            <div className="h-20 w-full md:h-28" style={{ backgroundColor: c.hex }} />
            <dt
              className={cn(
                "mt-3 pr-4 font-mono text-[11px] tracking-[0.06em] md:text-[10px]",
                invert ? "text-black/75" : "text-white/80",
              )}
            >
              {c.hex}
            </dt>
            <dd
              className={cn(
                "mt-1 pr-4 text-[10px] uppercase tracking-[0.16em]",
                invert ? "text-black/55" : "text-white/55",
              )}
            >
              {c.role[lang]}
            </dd>
            {c.use && (
              <dd
                className={cn(
                  "mt-1.5 pr-4 pb-1 text-[12px] font-light leading-[1.65] md:text-[11px]",
                  invert ? "text-black/55" : "text-white/55",
                )}
              >
                {c.use[lang]}
              </dd>
            )}
          </div>
        ))}
      </dl>

      {why && (
        <p
          className={cn(
            "mt-6 max-w-2xl text-[13px] font-light leading-[1.85]",
            invert ? "text-black/70" : "text-white/70",
          )}
        >
          {why[lang]}
        </p>
      )}
    </section>
  );
}

/* ────────────────── Lichtaufbau ──────────────────
   Draufsicht: wo die Lichter stehen, welche Farbe sie haben,
   was sie im Bild tun. Fuer 3D ist das die Information, die
   sonst im Fliesstext verschwindet.
   ──────────────────────────────────────────────────────────── */

export interface Light {
  /** Kurz: Key, Fill, Rim, Practicals */
  name: string;
  hex: string;
  /** Farbtemperatur, wenn bekannt */
  kelvin?: string;
  /** Position in der Draufsicht, 0–100 vom linken/oberen Rand */
  x: number;
  y: number;
  does: Bi;
}

export function LightSetup({
  lights,
  why,
  className,
}: {
  lights: Light[];
  why?: Bi;
  className?: string;
}) {
  const { lang } = useLang();

  return (
    <section className={className}>
      <SpecHead
        label={lang === "de" ? "Lichtaufbau" : "Lighting setup"}
        note={lang === "de" ? "Draufsicht" : "seen from above"}
      />

      <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-12">
        {/* ── Diagramm ── */}
        <div className="lg:col-span-5">
          <div className="relative aspect-[4/3] w-full border border-white/[0.1] bg-[#070707]">
            <svg viewBox="0 0 100 75" className="absolute inset-0 h-full w-full">
              <defs>
                <pattern id="ls-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path
                    d="M10 0H0V10"
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="0.3"
                  />
                </pattern>
              </defs>
              <rect width="100" height="75" fill="url(#ls-grid)" />

              {/* Motiv in der Mitte */}
              <rect
                x="43"
                y="33"
                width="14"
                height="10"
                fill="none"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="0.6"
              />
              <text
                x="50"
                y="48.5"
                textAnchor="middle"
                fill="rgba(255,255,255,0.45)"
                style={{ font: "3px ui-monospace, monospace", letterSpacing: "0.2px" }}
              >
                {lang === "de" ? "MOTIV" : "SUBJECT"}
              </text>

              {/* Kamera unten */}
              <path
                d="M46 66 L54 66 L58 72 L42 72 Z"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="0.5"
              />
              <text
                x="50"
                y="63"
                textAnchor="middle"
                fill="rgba(255,255,255,0.35)"
                style={{ font: "2.8px ui-monospace, monospace" }}
              >
                {lang === "de" ? "KAMERA" : "CAMERA"}
              </text>

              {lights.map((l) => {
                const x = (l.x / 100) * 100;
                const y = (l.y / 100) * 75;
                return (
                  <g key={l.name}>
                    <line
                      x1={x}
                      y1={y}
                      x2={50}
                      y2={38}
                      stroke={l.hex}
                      strokeWidth="0.4"
                      strokeDasharray="1.6 1.6"
                      opacity="0.75"
                    />
                    <circle cx={x} cy={y} r="2.6" fill={l.hex} />
                    <circle
                      cx={x}
                      cy={y}
                      r="4.6"
                      fill="none"
                      stroke={l.hex}
                      strokeWidth="0.35"
                      opacity="0.45"
                    />
                    <text
                      x={x}
                      y={y < 10 ? y + 8.6 : y - 6.4}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.75)"
                      style={{ font: "3px ui-monospace, monospace", letterSpacing: "0.3px" }}
                    >
                      {l.name.toUpperCase()}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* ── Legende ── */}
        <div className="lg:col-span-7">
          <ul className="border-t border-white/[0.1]">
            {lights.map((l) => (
              <li
                key={l.name}
                className="flex items-start gap-5 border-b border-white/[0.1] py-4"
              >
                <span
                  className="mt-0.5 h-8 w-8 shrink-0"
                  style={{ backgroundColor: l.hex }}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-x-4">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-white/85">
                      {l.name}
                    </span>
                    <span className="font-mono text-[10px] text-white/50">{l.hex}</span>
                    {l.kelvin && (
                      <span className="font-mono text-[10px] text-white/50">{l.kelvin}</span>
                    )}
                  </span>
                  <span className="mt-1.5 block text-[12.5px] font-light leading-[1.7] text-white/62">
                    {l.does[lang]}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          {why && (
            <p className="mt-6 max-w-xl text-[13px] font-light leading-[1.85] text-white/70">
              {why[lang]}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ────────────────── Typografie ──────────────────
   Die Schrift wird als Ausschnitt aus der Arbeit selbst gezeigt.
   Ein Schriftname im Fliesstext sagt nichts; das Schriftbild
   schon. Der Name steht daneben, sobald er feststeht.
   ──────────────────────────────────────────────────────────── */

export interface TypeFace {
  /** Ausschnitt aus der eigenen Arbeit */
  src: string;
  /** Name der Schrift. Fehlt er, wird keiner behauptet. */
  name?: string;
  /** Wofuer sie eingesetzt ist */
  role: Bi;
  /** Schnitte und Groessen, soweit bekannt */
  detail?: string;
}

export function TypeSpec({
  faces,
  why,
  invert,
  className,
}: {
  faces: TypeFace[];
  why?: Bi;
  invert?: boolean;
  className?: string;
}) {
  const { lang } = useLang();

  return (
    <section className={className}>
      <SpecHead
        label={lang === "de" ? "Typografie" : "Typography"}
        invert={invert}
      />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {faces.map((f) => (
          <figure key={f.src}>
            <div
              className={cn(
                "overflow-hidden",
                invert ? "bg-black/[0.04] ring-1 ring-black/10" : "bg-white/[0.03] ring-1 ring-white/[0.08]",
              )}
            >
              <img src={f.src} alt="" loading="lazy" decoding="async" className="w-full" />
            </div>
            <figcaption className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              {f.name && (
                <span
                  className={cn(
                    "text-[12px] tracking-[0.02em]",
                    invert ? "text-black/85" : "text-white/85",
                  )}
                >
                  {f.name}
                </span>
              )}
              <span
                className={cn(
                  "text-[9px] uppercase tracking-[0.2em]",
                  invert ? "text-black/55" : "text-white/55",
                )}
              >
                {f.role[lang]}
              </span>
              {f.detail && (
                <span
                  className={cn(
                    "font-mono text-[10px]",
                    invert ? "text-black/45" : "text-white/45",
                  )}
                >
                  {f.detail}
                </span>
              )}
            </figcaption>
          </figure>
        ))}
      </div>

      {why && (
        <p
          className={cn(
            "mt-6 max-w-2xl text-[13px] font-light leading-[1.85]",
            invert ? "text-black/70" : "text-white/70",
          )}
        >
          {why[lang]}
        </p>
      )}
    </section>
  );
}

/* Rahmen, der die Bausteine eines Projekts zusammenhaelt. */
export function SpecGroup({
  children,
  invert,
}: {
  children: React.ReactNode;
  invert?: boolean;
}) {
  return (
    <Reveal direction="up" duration={0.9}>
      <div
        className={cn(
          "mx-auto mt-20 max-w-[1600px] space-y-20 px-6 md:mt-28 md:space-y-24 md:px-10 lg:px-16",
          invert && "text-black",
        )}
      >
        {children}
      </div>
    </Reveal>
  );
}
