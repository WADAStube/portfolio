import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { EASE } from "@/components/motion-primitives";
import { cn } from "@/lib/utils";
import { useLang, pick, t } from "@/lib/lang";

/* ────────────────────────────────────────────────────────────
   Walkthrough — anklickbarer Ablauf durch eine Anwendung.

   Kein Video und kein eingebetteter Server: echte Screenshots,
   die der Besucher selbst durchklickt. Rechte Haelfte weiter,
   linke zurueck, dazu Pfeiltasten und Wischen.

   Der Grund fuer diese Loesung statt eines echten Builds:
   eine eingebettete App braucht Server, Anmeldung und Rechte
   und ist genau dann kaputt, wenn jemand sie sich ansieht.
   Dieser Ablauf laedt sofort und funktioniert immer.
   ──────────────────────────────────────────────────────────── */

export interface WalkthroughStep {
  src: string;
  w: number;
  h: number;
  caption: string;
  captionDe?: string;
}

export function Walkthrough({
  steps,
  phone = false,
}: {
  steps: WalkthroughStep[];
  /** Hochformat-Aufnahmen werden schmaler gesetzt */
  phone?: boolean;
}) {
  const { lang } = useLang();
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [touched, setTouched] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);

  const n = steps.length;
  const go = useCallback(
    (next: number) => {
      setDir(next > i ? 1 : -1);
      setI(((next % n) + n) % n);
      setTouched(true);
    },
    [i, n],
  );

  /* Pfeiltasten, sobald der Ablauf im Blick ist */
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (!el.matches(":focus-within")) return;
      if (e.key === "ArrowRight") { e.preventDefault(); go(i + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(i - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, i]);

  const ratio = steps[0] ? steps[0].w / steps[0].h : 16 / 9;

  return (
    <div className={cn("w-full", phone && "max-w-[19rem] mx-auto")}>
      <div
        ref={boxRef}
        tabIndex={0}
        role="group"
        aria-label={pick(steps[i].caption, steps[i].captionDe, lang)}
        onTouchStart={(e) => (startX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - startX.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? i + 1 : i - 1);
        }}
        className={cn(
          "relative overflow-hidden bg-[#070707] ring-1 ring-white/[0.08]",
          "shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] outline-none",
          "focus-visible:ring-white/30",
        )}
        style={{ aspectRatio: `${ratio}` }}
      >
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.img
            key={steps[i].src}
            src={steps[i].src}
            alt={pick(steps[i].caption, steps[i].captionDe, lang)}
            custom={dir}
            initial={reduced ? { opacity: 0 } : { opacity: 0, x: dir * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: dir * -28 }}
            transition={{ duration: reduced ? 0.2 : 0.45, ease: EASE }}
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            className="absolute inset-0 w-full h-full object-contain"
          />
        </AnimatePresence>

        {/* Klickflaechen — unsichtbar, decken das ganze Bild ab */}
        <button
          type="button"
          aria-label="Zurück"
          onClick={() => go(i - 1)}
          disabled={i === 0}
          className="absolute inset-y-0 left-0 w-1/3 disabled:cursor-default cursor-w-resize"
        />
        <button
          type="button"
          aria-label="Weiter"
          onClick={() => go(i + 1)}
          className="absolute inset-y-0 right-0 w-2/3 cursor-e-resize"
        />

        {/* Hinweis, bis zum ersten Klick */}
        <AnimatePresence>
          {!touched && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.6 }}
              className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-2.5 bg-black/55 backdrop-blur-sm px-3.5 py-2"
            >
              <span className="text-[9px] uppercase tracking-[0.22em] text-white/70">
                {t("clickThrough", lang)}
              </span>
              <motion.span
                animate={reduced ? undefined : { x: [0, 4, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="text-white/70"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M3 1l4 4-4 4" stroke="currentColor" strokeWidth="1.3" />
                </svg>
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Schrittleiste */}
      <div className="mt-5 flex items-center gap-2">
        {steps.map((s, k) => (
          <button
            key={s.src}
            type="button"
            aria-label={`${k + 1}`}
            onClick={() => go(k)}
            className="group h-4 flex-1 flex items-center"
          >
            <span
              className={cn(
                "h-[2px] w-full rounded-full transition-colors duration-300",
                k === i ? "bg-white/85" : "bg-white/15 group-hover:bg-white/35",
              )}
            />
          </button>
        ))}
        <span className="ml-3 font-mono text-[10px] tabular-nums text-white/35 shrink-0">
          {String(i + 1).padStart(2, "0")}
          <span className="text-white/15">/{String(n).padStart(2, "0")}</span>
        </span>
      </div>

      {/* Bildunterschrift */}
      <div className={cn("mt-3", phone ? "min-h-[4.4rem]" : "min-h-[2.6rem]")}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={steps[i].src}
            initial={{ opacity: 0, y: reduced ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : -6 }}
            transition={{ duration: 0.3, ease: EASE }}
            className={cn(
              "text-[13px] font-light leading-[1.7] text-white/45",
              phone ? "text-center" : "max-w-xl",
            )}
          >
            {pick(steps[i].caption, steps[i].captionDe, lang)}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
