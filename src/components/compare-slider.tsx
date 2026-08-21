import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "@/components/motion-primitives";
import type { ProjectShot } from "@/data/projects";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────
   CompareSlider

   Zwei Bilder derselben Kamera uebereinander, dazwischen ein
   ziehbarer Griff. Funktioniert mit Maus, Finger und Tastatur.

   Wichtig: Beide Bilder MUESSEN aus derselben Perspektive
   stammen, sonst wirkt der Effekt kaputt.
   ──────────────────────────────────────────────────────────── */

export function CompareSlider({
  before,
  after,
  beforeLabel = "Shaded",
  afterLabel = "Wireframe",
  note,
  invert = false,
  className,
}: {
  before: ProjectShot;
  after: ProjectShot;
  beforeLabel?: string;
  afterLabel?: string;
  /** Kurze Erklaerung unter dem Regler — noetig, wenn der
      Unterschied subtil ist (z.B. RGB gegen CMYK). */
  note?: string;
  /** Helle Sektion — Beschriftungen umfaerben */
  invert?: boolean;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState(false);

  const ratio = before.w / before.h;

  const setFromClientX = useCallback((clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const next = ((clientX - r.left) / r.width) * 100;
    setPos(Math.min(100, Math.max(0, next)));
  }, []);

  /* Zeigerereignisse decken Maus und Touch gemeinsam ab. */
  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => {
      e.preventDefault();
      setFromClientX(e.clientX);
    };
    const up = () => setDragging(false);
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dragging, setFromClientX]);

  const start = (e: React.PointerEvent) => {
    setTouched(true);
    setDragging(true);
    setFromClientX(e.clientX);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      setTouched(true);
      setPos((p) => Math.max(0, p - 4));
    }
    if (e.key === "ArrowRight") {
      setTouched(true);
      setPos((p) => Math.min(100, p + 4));
    }
  };

  return (
    <figure className={cn("group relative", className)}>
      <motion.div
        initial={{ opacity: 0, y: reduced ? 0 : 34 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: reduced ? 0.2 : 1, ease: EASE }}
      >
        <div
          ref={wrapRef}
          onPointerDown={start}
          onKeyDown={onKey}
          role="slider"
          tabIndex={0}
          aria-label={`${beforeLabel} versus ${afterLabel}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          className={cn(
            "relative overflow-hidden select-none touch-none outline-none",
            "bg-[#080808] ring-1 ring-white/[0.07] focus-visible:ring-white/40",
            dragging ? "cursor-grabbing" : "cursor-grab",
          )}
          style={{ aspectRatio: `${ratio}` }}
        >
          {/* Unten: Wireframe */}
          <img
            src={after.src}
            alt={after.caption ?? afterLabel}
            width={after.w}
            height={after.h}
            loading="lazy"
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Oben: Shaded, per clip-path beschnitten */}
          <img
            src={before.src}
            alt={before.caption ?? beforeLabel}
            width={before.w}
            height={before.h}
            loading="lazy"
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
          />

          {/* Beschriftungen */}
          <span
            className="absolute top-3 left-3 md:top-5 md:left-5 bg-black/70 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-medium text-white/90 transition-opacity duration-300"
            style={{ opacity: pos > 16 ? 1 : 0 }}
          >
            {beforeLabel}
          </span>
          <span
            className="absolute top-3 right-3 md:top-5 md:right-5 bg-black/70 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-medium text-white/90 transition-opacity duration-300"
            style={{ opacity: pos < 84 ? 1 : 0 }}
          >
            {afterLabel}
          </span>

          {/* Trennlinie + Griff */}
          <div
            className="absolute inset-y-0 pointer-events-none"
            style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
          >
            <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/85 shadow-[0_0_14px_rgba(0,0,0,0.7)]" />
            <motion.div
              animate={{ scale: dragging ? 1.12 : 1 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white text-black flex items-center justify-center shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
            >
              <svg width="16" height="10" viewBox="0 0 18 10" fill="none">
                <path
                  d="M5 1L1 5l4 4M13 1l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </div>

          {/* Hinweis, bis der Regler das erste Mal bewegt wurde */}
          <motion.div
            initial={false}
            animate={{ opacity: touched ? 0 : 1, y: touched ? 8 : 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 md:bottom-4"
          >
            <motion.span
              animate={reduced || touched ? undefined : { x: [-3, 3, -3] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block bg-white/95 text-black px-3 py-1.5 text-[9px] uppercase tracking-[0.18em] font-medium whitespace-nowrap"
            >
              Drag to compare
            </motion.span>
          </motion.div>
        </div>
      </motion.div>

      <figcaption className="mt-3">
        <span className="flex items-baseline gap-3">
          <span className={cn("h-px w-5 shrink-0 translate-y-[-3px]", invert ? "bg-black/20" : "bg-white/15")} />
          <span className={cn("text-[10px] uppercase tracking-[0.18em]", invert ? "text-black/45" : "text-white/32")}>
            {beforeLabel} / {afterLabel}
            <span className="hidden md:inline"> — drag or use arrow keys</span>
          </span>
        </span>
        {note && (
          <span className={cn("block mt-3 pl-8 text-xs font-light leading-relaxed max-w-xl", invert ? "text-black/55" : "text-white/40")}>
            {note}
          </span>
        )}
      </figcaption>
    </figure>
  );
}
