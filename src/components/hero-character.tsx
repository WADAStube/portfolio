import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { useIsSmallScreen } from "@/components/motion-primitives";

/* ────────────────────────────────────────────────────────────
   HeroCharacter

   Ruhe:      Der Blick folgt der Maus. Die waagerechte
              Zeigerposition setzt die Abspielzeit des Clips,
              der nur einen sauberen Schwenk enthaelt.
   Uebergang: Beim Scrollen zieht Dunkelheit von unten herauf,
              der Charakter tritt zurueck, wird weich und geht
              darin auf. Danach beginnt die Seite.
   ──────────────────────────────────────────────────────────── */

const STILL = "/images/hero/dirs/c.jpg";

/* Zeitfenster des Schwenks in Sekunden.
   Ganz links = LOOK_FROM, ganz rechts = LOOK_TO. */
const LOOK_FROM = 2.2;
const LOOK_TO = 0.05;

/* Ab hier beginnt der Uebergang (Anteil am Scrollweg) */
const EXIT_START = 0.42;

export function HeroCharacter({
  title,
  kicker,
  children,
}: {
  title: string;
  kicker?: string;
  children?: React.ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const small = useIsSmallScreen();

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    mass: 0.35,
    restDelta: 0.0005,
  });

  /* ── Blick folgt der Maus ── */
  const mouseX = useMotionValue(0.5);
  const smoothX = useSpring(mouseX, {
    stiffness: 80,
    damping: 22,
    mass: 0.45,
    restDelta: 0.001,
  });

  useEffect(() => {
    if (small || reduced) return;
    const onMove = (e: PointerEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mouseX, small, reduced]);

  useMotionValueEvent(smoothX, "change", (v) => {
    const el = videoRef.current;
    if (!el || small || reduced) return;
    const t = Math.min(1, Math.max(0, v));
    const time = LOOK_FROM + (LOOK_TO - LOOK_FROM) * t;
    if (Math.abs(el.currentTime - time) > 0.012) el.currentTime = time;
  });

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const onReady = () => {
      el.currentTime = (LOOK_FROM + LOOK_TO) / 2;
    };
    el.addEventListener("loadeddata", onReady, { once: true });
    return () => el.removeEventListener("loadeddata", onReady);
  }, [small, reduced]);

  /* ── Uebergang ── */
  const charScale = useTransform(p, [EXIT_START, 1], [1, reduced ? 1 : 1.12]);
  const charOpacity = useTransform(p, [EXIT_START + 0.12, 0.95], [1, 0]);
  const charBlur = useTransform(
    useTransform(p, [EXIT_START, 0.95], [0, reduced || small ? 0 : 16]),
    (b) => `blur(${b}px)`,
  );

  /* Dunkelheit steigt von unten */
  const veil = useTransform(p, [EXIT_START - 0.05, 0.92], ["0%", "115%"]);

  /* Waerme weicht kaltem Schwarz */
  const tint = useTransform(p, [EXIT_START, 0.85], [0, 0.75]);

  const titleOpacity = useTransform(p, [0, EXIT_START - 0.06], [1, 0]);
  const titleY = useTransform(p, [0, EXIT_START], [0, -70]);
  const hintOpacity = useTransform(p, [0, 0.08], [1, 0]);

  return (
    <div ref={trackRef} className="relative" style={{ height: "230vh" }}>
      <div className="sticky top-0 h-svh overflow-hidden bg-[#f2600c]">
        <motion.div
          style={{
            scale: charScale,
            opacity: charOpacity,
            filter: reduced || small ? undefined : charBlur,
            willChange: "transform, opacity, filter",
          }}
          className="absolute inset-0"
        >
          {small || reduced ? (
            <img
              src={STILL}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <video
              ref={videoRef}
              src="/videos/look.mp4"
              poster={STILL}
              muted
              playsInline
              preload="auto"
              aria-label={title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </motion.div>

        <motion.div
          style={{ opacity: tint }}
          className="pointer-events-none absolute inset-0 bg-[#0a0a0a] mix-blend-multiply"
        />

        <motion.div
          style={{ height: veil }}
          className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent"
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/55 to-transparent" />

        <motion.div
          style={{ opacity: titleOpacity, y: reduced ? 0 : titleY }}
          className="absolute inset-x-0 bottom-0 z-10 px-6 md:px-14 pb-10 md:pb-14"
        >
          {kicker && (
            <p className="text-[9px] uppercase tracking-[0.28em] text-white/55 mb-3">
              {kicker}
            </p>
          )}
          <h1
            className="font-display font-bold text-white leading-[0.9]"
            style={{ fontSize: "clamp(2.2rem, 7.5vw, 7rem)", letterSpacing: "-0.03em" }}
          >
            {title}
          </h1>
          {children}
        </motion.div>

        <motion.div
          style={{ opacity: hintOpacity }}
          className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.span
            animate={reduced ? undefined : { y: [0, 6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="block h-8 w-px bg-white/40"
          />
        </motion.div>
      </div>
    </div>
  );
}
