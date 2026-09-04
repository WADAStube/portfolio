import { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
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

   Das Bild bleibt an EINER Stelle stehen. Jede neue Ebene
   blendet darueber ein, statt daneben zu erscheinen — dadurch
   sieht man genau, was hinzugekommen ist.

   Weil jede Ebene alles Vorherige enthaelt, muss die alte
   nicht ausgeblendet werden: die neue legt sich einfach
   darueber. Das ergibt einen sauberen Aufbau ohne Flackern
   in der Mitte der Blende.

   Der Text scrollt daneben normal weiter.
   ──────────────────────────────────────────────────────────── */

function LayerText({
  layer,
  progress,
  start,
  end,
}: {
  layer: BreakdownLayer;
  progress: MotionValue<number>;
  start: number;
  end: number;
}) {
  const reduced = useReducedMotion();
  const small = useIsSmallScreen();
  const off = reduced || small ? 0 : 1;
  const span = end - start;

  /* Auftritt, Standzeit, Abgang — alles aus derselben Quelle */
  const opacity = useTransform(
    progress,
    [start - span * 0.35, start + span * 0.18, end - span * 0.18, end + span * 0.2],
    [0, 1, 1, 0],
  );
  const x = useTransform(
    progress,
    [start - span * 0.35, start + span * 0.18],
    [-46 * off, 0],
  );
  const y = useTransform(
    progress,
    [end - span * 0.18, end + span * 0.2],
    [0, -70 * off],
  );

  return (
    <motion.div
      style={{ opacity, x, y, willChange: "transform, opacity" }}
      className="absolute inset-x-0 top-0 lg:top-1/2 lg:-translate-y-1/2"
    >
      <p className="text-[8px] uppercase tracking-[0.3em] text-white/28 mb-4">
        {layer.label}
      </p>
      <h3
        className="font-display font-medium text-white leading-[1.15] mb-5"
        style={{ fontSize: "clamp(1.4rem, 2.2vw, 1.9rem)", letterSpacing: "-0.01em" }}
      >
        {layer.title}
      </h3>
      <p className="text-sm font-light leading-[1.95] text-white/50 max-w-sm">
        {layer.body}
      </p>
      <p className="mt-6 pt-5 border-t border-white/[0.07] text-[10px] leading-relaxed text-white/25 max-w-sm">
        {layer.tech.join("  ·  ")}
      </p>
    </motion.div>
  );
}

export function LayerBreakdown({ layers }: { layers: BreakdownLayer[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const small = useIsSmallScreen();
  const n = layers.length;

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  /* Eine Feder glaettet den Fortschritt, alles Weitere wird
     daraus abgeleitet — dadurch laufen Blende, Bewegung und
     Abgang exakt synchron. */
  const p = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 26,
    mass: 0.35,
    restDelta: 0.0005,
  });

  /* Die Ebenen belegen die ersten 88 %, danach zieht das ganze
     Bild weg — derselbe Abgang wie beim Turntable. */
  const build = 0.88;
  const step = build / n;

  const outY = useTransform(p, [build, 1], [0, reduced ? 0 : -170]);
  const outScale = useTransform(p, [build, 1], [1, reduced ? 1 : 0.93]);
  const outOpacity = useTransform(p, [build + 0.03, 0.99], [1, 0]);
  const outFilter = useTransform(
    useTransform(p, [build, 0.98], [0, reduced || small ? 0 : 8]),
    (b) => `blur(${b}px)`,
  );

  /* Sehr langsames Heranfahren ueber den gesamten Aufbau */
  const imgScale = useTransform(p, [0, build], [reduced ? 1 : 1.05, 1]);

  return (
    <div ref={trackRef} className="relative" style={{ height: `${n * (small ? 70 : 85)}vh` }}>
      <div className="sticky top-0 h-svh flex items-center overflow-hidden">
        <motion.div
          style={{
            y: outY,
            scale: outScale,
            opacity: outOpacity,
            filter: reduced ? undefined : outFilter,
            willChange: "transform, opacity, filter",
          }}
          className="w-full max-w-[1760px] mx-auto px-6 md:px-10 lg:px-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-6 gap-x-10 xl:gap-x-14 items-center">
            {/* Text — auf dem Handy unter dem Bild, ab Laptop daneben */}
            <div className="order-2 lg:order-1 lg:col-span-4 xl:col-span-3 relative h-[34vh] lg:h-[62vh]">
              {layers.map((l, i) => (
                <LayerText
                  key={l.src}
                  layer={l}
                  progress={p}
                  start={i * step}
                  end={(i + 1) * step}
                />
              ))}
            </div>

            {/* Bild — bleibt stehen, Ebenen blenden uebereinander */}
            <div className="order-1 lg:order-2 lg:col-span-8 xl:col-span-9">
              <div className="relative overflow-hidden bg-[#050505] ring-1 ring-white/[0.06] aspect-[16/9] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
                {layers.map((l, i) => (
                  <LayerImage
                    key={l.src}
                    layer={l}
                    index={i}
                    progress={p}
                    step={step}
                    scale={imgScale}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function LayerImage({
  layer,
  index,
  progress,
  step,
  scale,
}: {
  layer: BreakdownLayer;
  index: number;
  progress: MotionValue<number>;
  step: number;
  scale: MotionValue<number>;
}) {
  /* Ebene 0 liegt immer sichtbar unten. Jede weitere blendet
     in ihrem eigenen Fenster darueber ein und bleibt dann —
     so wachsen die Ebenen sichtbar aufeinander. */
  const start = index * step;
  const opacity = useTransform(
    progress,
    [start - step * 0.55, start + step * 0.15],
    [0, 1],
  );

  return (
    <motion.img
      src={layer.src}
      alt={index === 0 ? `${layer.label} — ${layer.title}` : ""}
      aria-hidden={index !== 0}
      loading={index < 3 ? "eager" : "lazy"}
      decoding="async"
      style={{
        opacity: index === 0 ? 1 : opacity,
        scale,
        willChange: "opacity, transform",
      }}
      className="absolute inset-0 w-full h-full object-cover"
    />
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
