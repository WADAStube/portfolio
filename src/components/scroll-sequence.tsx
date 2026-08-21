import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import { EASE } from "@/components/motion-primitives";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────
   ScrollSequence

   Eine Bildfolge, die an den Scrollfortschritt gekoppelt ist:
   der Betrachter dreht das Modell selbst, indem er scrollt.

   Warum nicht einfach ein Video? Der Ausgangsclip ist eine
   Bildschirmaufnahme aus dem Viewport — die Drehung geht hin
   und her und laeuft nicht rund. Als Endlosschleife faellt das
   sofort auf. Gekoppelt an den Scroll verschwindet das Problem:
   es gibt keinen Loop, und die Bewegung folgt exakt dem Tempo
   des Betrachters.
   ──────────────────────────────────────────────────────────── */

export function ScrollSequence({
  frames,
  ratio,
  caption,
  className,
}: {
  /** Pfade der Einzelbilder, in Reihenfolge */
  frames: string[];
  /** Breite/Hoehe des Rahmens */
  ratio: number;
  caption?: string;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [touched, setTouched] = useState(false);

  /* Die Drehung braucht Scrollweg. Deshalb sitzt das Bild in
     einer hohen Spur und bleibt darin kleben — waehrend man an
     der Spur vorbeiscrollt, dreht sich das Modell. */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 15%", "end 85%"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const last = frames.length - 1;
    const next = Math.max(0, Math.min(last, Math.round(v * last)));
    setIndex((prev) => {
      if (prev !== next && !touched) setTouched(true);
      return prev === next ? prev : next;
    });
  });

  /* Alle Bilder vorab laden, sonst flackert es beim Scrollen. */
  useEffect(() => {
    let alive = true;
    let loaded = 0;
    frames.forEach((src) => {
      const img = new Image();
      img.onload = () => {
        loaded += 1;
        if (alive && loaded >= Math.min(6, frames.length)) setReady(true);
      };
      img.src = src;
    });
    return () => {
      alive = false;
    };
  }, [frames]);

  return (
    <figure
      ref={ref}
      className={cn("group relative", className)}
      style={{ height: "var(--seq-track)" }}
    >
      <div className="sticky top-[16vh] md:top-[18vh]">
      <motion.div
        initial={{ opacity: 0, y: reduced ? 0 : 34 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: reduced ? 0.2 : 1, ease: EASE }}
        className="relative overflow-hidden bg-[#080808] ring-1 ring-white/[0.07]"
        style={{ aspectRatio: `${ratio}` }}
      >
        {/* Weichgezeichneter Fuellhintergrund */}
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <img
            src={frames[0]}
            alt=""
            className="absolute inset-0 w-full h-full object-cover scale-125 blur-2xl opacity-25 saturate-150"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Alle Bilder liegen uebereinander; nur das aktive ist
            sichtbar. Kein Nachladen waehrend des Scrollens. */}
        {frames.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={i === 0 ? (caption ?? "") : ""}
            aria-hidden={i !== 0}
            loading={i < 4 ? "eager" : "lazy"}
            decoding="async"
            className="absolute inset-0 w-full h-full object-contain select-none"
            style={{ opacity: i === index ? 1 : 0 }}
          />
        ))}

        {/* Fortschritt der Drehung */}
        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
          <div className="flex items-center gap-3">
            <div className="relative h-[2px] flex-1 bg-white/15 overflow-hidden rounded-full">
              <motion.div
                className="absolute inset-y-0 left-0 bg-white/70 rounded-full"
                style={{ width: `${(index / (frames.length - 1)) * 100}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <span className="font-mono text-[9px] tabular-nums text-white/50 shrink-0">
              {String(index + 1).padStart(2, "0")}/{frames.length}
            </span>
          </div>
        </div>

        {/* Hinweis, bis der Betrachter zum ersten Mal scrollt */}
        <motion.div
          initial={false}
          animate={{ opacity: touched || !ready ? 0 : 1 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 md:top-4"
        >
          <span className="inline-flex items-center gap-2 bg-white/95 text-black px-3 py-1.5 text-[9px] uppercase tracking-[0.18em] font-medium whitespace-nowrap">
            <motion.svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              animate={reduced ? undefined : { y: [0, 3, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <path
                d="M5 1v7m0 0L2 5m3 3l3-3"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
            Scroll to rotate
          </span>
        </motion.div>
      </motion.div>

      {caption && (
        <figcaption className="mt-3 flex items-baseline gap-3">
          <span className="h-px w-5 bg-white/15 shrink-0 translate-y-[-3px]" />
          <span className="text-[10px] text-white/32 uppercase tracking-[0.18em]">
            {caption}
          </span>
        </figcaption>
      )}
      </div>
    </figure>
  );
}
