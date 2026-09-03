import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import { EASE, useIsSmallScreen } from "@/components/motion-primitives";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────
   Showpiece

   Der grosse Auftritt eines Projekts, ueber die volle
   Seitenbreite:

   1. Ein Vergleichsbild auf Bildschirmhoehe. Nur dieser Regler
      haengt an der Maus, nicht am Scroll — man kann jederzeit
      weiterscrollen.
   2. Darunter das Turntable: die Frames sind an den Scroll
      gekoppelt, das Modell dreht sich also im Tempo des
      Betrachters.
   3. Am Ende der Drehung loest sich das Bild nach oben auf —
      es steigt leicht, verliert Deckkraft und gibt die Seite
      wieder frei.
   ──────────────────────────────────────────────────────────── */

export function ShowpieceHero({
  title,
  kicker,
  before,
  after,
  beforeLabel = "Shaded",
  afterLabel = "Wireframe",
}: {
  title: string;
  kicker?: string;
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
}) {
  const reduced = useReducedMotion();
  const small = useIsSmallScreen();

  /* ── Vergleichsregler ── */
  const wrapRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState(false);

  const setFromX = useCallback((clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => {
      e.preventDefault();
      setFromX(e.clientX);
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
  }, [dragging, setFromX]);

  return (
    <>
      {/* ═══════ Vergleich, volle Breite ═══════ */}
      <div className="relative w-full">
        <div
          ref={wrapRef}
          onPointerDown={(e) => {
            setTouched(true);
            setDragging(true);
            setFromX(e.clientX);
          }}
          onPointerMove={(e) => {
            if (!small) {
              setTouched(true);
              setFromX(e.clientX);
            }
          }}
          role="slider"
          tabIndex={0}
          aria-label={`${beforeLabel} versus ${afterLabel}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 4));
            if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 4));
          }}
          className="relative w-full overflow-hidden select-none bg-[#050505] outline-none cursor-ew-resize"
          style={{
            height: small ? "min(72vh, 150vw)" : "min(84vh, 62vw)",
            touchAction: "pan-y",
          }}
        >
          <img
            src={after}
            alt={afterLabel}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <img
            src={before}
            alt={beforeLabel}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
          />

          {/* Verlauf unten fuer den Titel */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/85 to-transparent" />

          {/* Trennlinie + Griff */}
          <div
            className="absolute inset-y-0 pointer-events-none"
            style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
          >
            <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/90 shadow-[0_0_18px_rgba(0,0,0,0.8)]" />
            <motion.div
              animate={{ scale: dragging ? 1.14 : 1 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white text-black flex items-center justify-center shadow-[0_6px_28px_rgba(0,0,0,0.65)]"
            >
              <svg width="18" height="11" viewBox="0 0 18 10" fill="none">
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

          {/* Beschriftungen */}
          <span
            className="absolute top-5 left-5 md:top-8 md:left-10 bg-black/70 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-medium text-white/90 transition-opacity duration-300"
            style={{ opacity: pos > 16 ? 1 : 0 }}
          >
            {beforeLabel}
          </span>
          <span
            className="absolute top-5 right-5 md:top-8 md:right-10 bg-black/70 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-medium text-white/90 transition-opacity duration-300"
            style={{ opacity: pos < 84 ? 1 : 0 }}
          >
            {afterLabel}
          </span>

          {/* Titel im Bild */}
          <div className="absolute bottom-0 left-0 right-0 px-6 md:px-10 lg:px-16 pb-8 md:pb-12">
            {kicker && (
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.8, ease: EASE }}
                className="text-[9px] uppercase tracking-[0.28em] text-white/45 mb-3"
              >
                {kicker}
              </motion.p>
            )}
            <motion.h2
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 1, ease: EASE, delay: 0.08 }}
              className="font-display font-bold text-white leading-[0.95]"
              style={{
                fontSize: "clamp(1.9rem, 7.5vw, 7rem)",
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </motion.h2>
          </div>

          {/* Hinweis */}
          <motion.div
            initial={false}
            animate={{ opacity: touched ? 0 : 1 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="pointer-events-none absolute top-[26%] left-1/2 -translate-x-1/2 md:top-1/2 md:translate-y-12"
          >
            <motion.span
              animate={reduced ? undefined : { x: [-4, 4, -4] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block bg-white/95 text-black px-4 py-2 text-[9px] uppercase tracking-[0.2em] font-medium whitespace-nowrap"
            >
              Drag to compare
            </motion.span>
          </motion.div>
        </div>
      </div>

    </>
  );
}


/* ────────────────────────────────────────────────────────────
   ShowpieceTurntable — steht bewusst am Ende des Projekts:
   Hero, dann Breakdown, dann die Drehung als Abschluss.
   ──────────────────────────────────────────────────────────── */
export function ShowpieceTurntable({
  frames,
  frameRatio,
  caption,
}: {
  frames: string[];
  frameRatio: number;
  caption?: string;
}) {
  const reduced = useReducedMotion();
  const small = useIsSmallScreen();
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const t = Math.min(1, v / 0.78);
    const last = frames.length - 1;
    const next = Math.max(0, Math.min(last, Math.round(t * last)));
    setIndex((p) => (p === next ? p : next));
  });

  const rawOpacity = useTransform(scrollYProgress, [0.78, 1], [1, 0]);
  const rawY = useTransform(scrollYProgress, [0.78, 1], [0, -190]);
  const rawScale = useTransform(scrollYProgress, [0.78, 1], [1, 0.93]);
  const rawBlur = useTransform(scrollYProgress, [0.78, 1], [0, 12]);
  const opacity = useSpring(rawOpacity, { stiffness: 130, damping: 30 });
  const ty = useSpring(rawY, { stiffness: 130, damping: 30 });
  const sc = useSpring(rawScale, { stiffness: 130, damping: 30 });
  const filter = useTransform(rawBlur, (b) => `blur(${b}px)`);

  useEffect(() => {
    frames.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [frames]);

  return (
    <div ref={trackRef} className="relative" style={{ height: small ? "180vh" : "215vh" }}>
        <div className="sticky top-0 h-svh flex items-center justify-center overflow-hidden">
          <motion.div
            style={{
              opacity: reduced ? 1 : opacity,
              y: reduced ? 0 : ty,
              scale: reduced ? 1 : sc,
              filter: reduced ? "none" : filter,
            }}
            className="relative w-full px-4 md:px-10 lg:px-20 will-change-transform"
          >
            <div
              className="relative mx-auto w-full max-w-[1500px] overflow-hidden bg-[#050505]"
              style={{ aspectRatio: `${frameRatio}` }}
            >
              {frames.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt={i === 0 ? (caption ?? "") : ""}
                  aria-hidden={i !== 0}
                  loading={i < 3 ? "eager" : "lazy"}
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{ opacity: i === index ? 1 : 0 }}
                />
              ))}
            </div>

            {caption && (
              <p className="mx-auto w-full max-w-[1500px] mt-4 text-[9px] uppercase tracking-[0.22em] text-white/28">
                {caption}
              </p>
            )}
          </motion.div>
        </div>
    </div>
  );
}
