import { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { useIsSmallScreen } from "@/components/motion-primitives";
import { cn } from "@/lib/utils";

export interface BreakdownLayer {
  src: string;
  label: string;
  title: string;
  body: string;
  tech: string[];
}

/* ────────────────────────────────────────────────────────────
   LayerBreakdown

   Jede Ebene bekommt eine eigene Bildschirmhoehe und rastet
   beim Scrollen sanft ein — daher das Magnetgefuehl. Das
   Einrasten laeuft ueber CSS scroll-snap im Modus "proximity":
   es zieht nur an, wenn man ohnehin in der Naehe stoppt, und
   blockiert das Durchscrollen nie.

   Bild und Text wechseln die Seite, damit der Blick beim
   Scrollen wandert statt in einer Spalte zu kleben.
   ──────────────────────────────────────────────────────────── */

function LayerBlock({
  layer,
  index,
}: {
  layer: BreakdownLayer;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const small = useIsSmallScreen();

  /* Bild rechts bei geraden, links bei ungeraden Ebenen */
  const flipped = index % 2 === 1;
  const from = flipped ? -1 : 1;

  /* Ein einziger Fortschrittswert steuert Auftritt UND Abgang.
     Vorher lief der Auftritt ueber einen Sichtbarkeits-Schalter —
     das springt, sobald man schnell scrollt. Am Scroll gekoppelt
     laeuft beides durchgehend. */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const soft = { stiffness: 120, damping: 30, mass: 0.4 };

  /* Auftritt: von der Seite herein */
  const inX = useSpring(
    useTransform(scrollYProgress, [0.06, 0.36], [reduced || small ? 0 : 72 * from, 0]),
    soft,
  );
  const inXText = useSpring(
    useTransform(scrollYProgress, [0.08, 0.40], [reduced || small ? 0 : -56 * from, 0]),
    soft,
  );
  const inOpacity = useSpring(
    useTransform(scrollYProgress, [0.05, 0.32], [0, 1]),
    soft,
  );

  /* Abgang: aufsteigen, kleiner werden, weich zeichnen, ausblenden —
     derselbe Ablauf wie beim Turntable. */
  const outY = useSpring(
    useTransform(scrollYProgress, [0.68, 0.98], [0, reduced ? 0 : -150]),
    soft,
  );
  const outScale = useSpring(
    useTransform(scrollYProgress, [0.68, 0.98], [1, reduced ? 1 : 0.93]),
    soft,
  );
  const outOpacity = useSpring(
    useTransform(scrollYProgress, [0.72, 0.99], [1, 0]),
    soft,
  );
  const outBlurRaw = useTransform(
    scrollYProgress,
    [0.68, 0.98],
    [0, reduced || small ? 0 : 9],
  );
  const outFilter = useTransform(outBlurRaw, (b) => `blur(${b}px)`);

  /* Leichter Versatz des Bildes gegen die Scrollrichtung */
  const par = useSpring(
    useTransform(scrollYProgress, [0, 1], [reduced || small ? 0 : 46, reduced || small ? 0 : -46]),
    { stiffness: 110, damping: 30, mass: 0.45 },
  );

  return (
    <div
      ref={ref}
      className="snap-center min-h-svh flex items-center py-16 md:py-20"
    >
      {/* Abgangs-Ebene: gilt fuer Bild und Text gemeinsam,
          damit der ganze Abschnitt als Einheit wegzieht. */}
      <motion.div
        style={{
          y: outY,
          scale: outScale,
          opacity: outOpacity,
          filter: reduced || small ? undefined : outFilter,
        }}
        className="w-full will-change-transform"
      >
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-y-8 gap-x-10 xl:gap-x-12 items-center">
          {/* Bild */}
          <motion.div
            style={{ x: inX, opacity: inOpacity }}
            className={cn(
              "lg:col-span-8 xl:col-span-9",
              flipped ? "lg:order-1" : "lg:order-2",
            )}
          >
            <motion.div style={{ y: par }}>
              <div className="relative overflow-hidden bg-[#050505] ring-1 ring-white/[0.06] aspect-[16/9] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
                <img
                  src={layer.src}
                  alt={`${layer.label} — ${layer.title}`}
                  loading={index < 2 ? "eager" : "lazy"}
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Text */}
          <motion.div
            style={{ x: inXText, opacity: inOpacity }}
            className={cn(
              "lg:col-span-4 xl:col-span-3",
              flipped ? "lg:order-2" : "lg:order-1",
            )}
          >
            <p className="text-[8px] uppercase tracking-[0.3em] text-white/28 mb-4">
              {layer.label}
            </p>
            <h3
              className="font-display font-medium text-white leading-[1.15] mb-5"
              style={{
                fontSize: "clamp(1.4rem, 2.4vw, 2rem)",
                letterSpacing: "-0.01em",
              }}
            >
              {layer.title}
            </h3>
            <p className="text-sm font-light leading-[1.95] text-white/48 max-w-sm">
              {layer.body}
            </p>
            <p className="mt-6 pt-5 border-t border-white/[0.07] text-[10px] leading-relaxed text-white/25 max-w-sm">
              {layer.tech.join("  ·  ")}
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export function LayerBreakdown({ layers }: { layers: BreakdownLayer[] }) {
  return (
    <div className="max-w-[1760px] mx-auto px-6 md:px-10 lg:px-12">
      {layers.map((l, i) => (
        <LayerBlock key={l.src} layer={l} index={i} />
      ))}
    </div>
  );
}

export function BreakdownIntro({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="max-w-[1760px] mx-auto px-6 md:px-10 lg:px-12">
        <p className="text-[8px] uppercase tracking-[0.28em] text-white/22 mb-4">
          Breakdown
        </p>
        <h3
          className="font-display font-bold text-white leading-none"
          style={{ fontSize: "clamp(1.6rem, 4vw, 3rem)", letterSpacing: "-0.02em" }}
        >
          How it was built
        </h3>
      </div>
    </div>
  );
}
