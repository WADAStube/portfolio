import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  animate,
  useInView,
  useMotionValue,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

/* ── Kleiner Viewport? Steuert die Parallax-Staerke ────────── */
export function useIsSmallScreen(breakpoint = 768) {
  const [small, setSmall] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setSmall(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);
  return small;
}

/* ── Shared easing ─────────────────────────────────────────── */
export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const EASE_SOFT: [number, number, number, number] = [0.25, 0.4, 0.25, 1];

type Direction = "up" | "down" | "left" | "right" | "none";

const OFFSETS: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 44 },
  down: { x: 0, y: -44 },
  left: { x: 48, y: 0 },
  right: { x: -48, y: 0 },
  none: { x: 0, y: 0 },
};

/* ────────────────────────────────────────────────────────────
   Reveal — elegantes Einblenden beim Scrollen
   ──────────────────────────────────────────────────────────── */
export function Reveal({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 0.9,
  amount = 0.25,
  once = true,
  blur = false,
}: {
  children: ReactNode;
  className?: string;
  direction?: Direction;
  delay?: number;
  duration?: number;
  amount?: number;
  once?: boolean;
  blur?: boolean;
}) {
  const reduced = useReducedMotion();
  const { x, y } = reduced ? OFFSETS.none : OFFSETS[direction];

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        x,
        y,
        filter: blur && !reduced ? "blur(8px)" : "blur(0px)",
      }}
      whileInView={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)" }}
      viewport={{ once, amount }}
      transition={{ duration: reduced ? 0.2 : duration, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   Stagger — Container + Item fuer gestaffelte Listen
   ──────────────────────────────────────────────────────────── */
export function Stagger({
  children,
  className,
  gap = 0.07,
  delay = 0,
  amount = 0.2,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
  delay?: number;
  amount?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: gap, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  distance = 24,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: reduced ? 0 : distance },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: reduced ? 0.2 : 0.8, ease: EASE },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   Parallax — verschiebt Inhalt sanft gegen die Scrollrichtung
   ──────────────────────────────────────────────────────────── */
export function Parallax({
  children,
  className,
  /** Staerke in Pixeln. Positiv = laeuft langsamer als der Scroll. */
  strength = 60,
  spring = true,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
  spring?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const raw = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? [0, 0] : [strength, -strength],
  );
  const smooth = useSpring(raw, { stiffness: 120, damping: 28, mass: 0.4 });
  const y: MotionValue<number> = spring && !reduced ? smooth : raw;

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   RevealImage — Bild mit Scale-Reveal + optionalem Parallax
   Kein Crop: das Bild behaelt sein natuerliches Seitenverhaeltnis.
   ──────────────────────────────────────────────────────────── */
export function RevealImage({
  src,
  alt,
  caption,
  className,
  parallax = 40,
  onClick,
  priority = false,
  width,
  height,
}: {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  parallax?: number;
  onClick?: () => void;
  priority?: boolean;
  width?: number;
  height?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const small = useIsSmallScreen();

  /* Auf kleinen Screens ist der Versatz relativ zur Bildhoehe viel
     staerker sichtbar — deshalb dort deutlich abschwaechen. */
  const strength = reduced ? 0 : small ? parallax * 0.35 : parallax;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const rawY = useTransform(scrollYProgress, [0, 1], [strength, -strength]);
  const y = useSpring(rawY, { stiffness: 110, damping: 30, mass: 0.45 });

  return (
    <figure ref={ref} className={cn("group relative", className)}>
      {/* Bild UND Bildunterschrift liegen gemeinsam im Parallax-Wrapper,
          sonst schiebt sich das Bild beim Scrollen ueber die Unterschrift. */}
      <motion.div
        style={{ y: reduced ? 0 : y }}
        className="will-change-transform"
      >
        <motion.div
          initial={{ opacity: 0, scale: reduced ? 1 : 1.05, y: reduced ? 0 : 28 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: reduced ? 0.2 : 1.1, ease: EASE }}
          className={cn(
            "relative overflow-hidden bg-white/[0.02] border border-white/[0.06]",
            onClick && "cursor-pointer",
          )}
          style={
            width && height ? { aspectRatio: `${width} / ${height}` } : undefined
          }
          onClick={onClick}
        >
          <motion.img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className="block w-full h-full object-cover select-none"
            whileHover={reduced ? undefined : { scale: 1.025 }}
            transition={{ duration: 0.7, ease: EASE }}
          />

          {/* Hover-Hinweis */}
          {onClick && (
            <div className="pointer-events-none absolute inset-0 flex items-end justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="bg-black/70 backdrop-blur-sm px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] text-white/80">
                Enlarge
              </span>
            </div>
          )}
        </motion.div>

        {caption && (
          <figcaption className="mt-3 text-[10px] text-white/28 uppercase tracking-[0.18em]">
            {caption}
          </figcaption>
        )}
      </motion.div>
    </figure>
  );
}

/* ────────────────────────────────────────────────────────────
   SplitText — Zeilen/Woerter steigen gestaffelt auf
   ──────────────────────────────────────────────────────────── */
export function SplitText({
  text,
  className,
  delay = 0,
  once = true,
}: {
  text: string;
  className?: string;
  delay?: number;
  once?: boolean;
}) {
  const reduced = useReducedMotion();
  const words = text.split(" ");

  /* Wichtig: whileInView sitzt auf dem NICHT abgeschnittenen Eltern-Element.
     Die inneren Spans liegen hinter overflow:hidden — der IntersectionObserver
     wuerde sie dort nie als sichtbar melden und die Animation liefe nie an. */
  return (
    <motion.span
      className={cn("inline-block", className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.2 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.055, delayChildren: delay } },
      }}
    >
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          /* pb/-mb gibt Unterlaengen (g, y, p) Platz — ohne das
             schneidet overflow-hidden sie unten ab. */
          className="inline-block overflow-hidden align-bottom pb-[0.18em] -mb-[0.18em]"
        >
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: reduced ? 0 : "110%", opacity: reduced ? 0 : 1 },
              visible: {
                y: 0,
                opacity: 1,
                transition: { duration: reduced ? 0.2 : 0.9, ease: EASE },
              },
            }}
          >
            {word}
            {i < words.length - 1 && "\u00A0"}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/* ────────────────────────────────────────────────────────────
   Magnetic — zieht das Element leicht zum Zeiger.
   Nur bei echter Maus; auf Touch passiert nichts.
   ──────────────────────────────────────────────────────────── */
export function Magnetic({
  children,
  className,
  strength = 0.28,
  radius = 90,
}: {
  children: ReactNode;
  className?: string;
  /** 0 = starr, 1 = folgt dem Zeiger vollstaendig */
  strength?: number;
  /** Wirkbereich in Pixeln um das Element herum */
  radius?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 18, mass: 0.35 });
  const y = useSpring(my, { stiffness: 220, damping: 18, mass: 0.35 });

  useEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const reach = Math.max(r.width, r.height) / 2 + radius;
      if (dist < reach) {
        mx.set(dx * strength);
        my.set(dy * strength);
      } else {
        mx.set(0);
        my.set(0);
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my, strength, radius, reduced]);

  return (
    <motion.div ref={ref} style={{ x, y }} className={className}>
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   CountUp — zaehlt beim Sichtbarwerden hoch.
   ──────────────────────────────────────────────────────────── */
export function CountUpNumber({
  value,
  duration = 1.6,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setShown(value);
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: EASE,
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, duration, reduced]);

  return (
    <span ref={ref} className={className}>
      {shown.toLocaleString("en-US")}
    </span>
  );
}
