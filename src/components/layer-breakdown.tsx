import { useRef } from "react";
import {
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { EASE, useIsSmallScreen } from "@/components/motion-primitives";
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
  const imgRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.4 });
  const reduced = useReducedMotion();
  const small = useIsSmallScreen();

  /* Bild rechts bei geraden, links bei ungeraden Ebenen */
  const flipped = index % 2 === 1;
  const from = flipped ? -1 : 1;

  const { scrollYProgress } = useScroll({
    target: imgRef,
    offset: ["start end", "end start"],
  });
  const strength = reduced || small ? 0 : 52;
  const rawY = useTransform(scrollYProgress, [0, 1], [strength, -strength]);
  const y = useSpring(rawY, { stiffness: 110, damping: 30, mass: 0.45 });

  return (
    <div
      ref={ref}
      className="snap-center min-h-svh flex items-center py-16 md:py-20"
    >
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-y-8 gap-x-10 xl:gap-x-12 items-center">
        {/* Bild */}
        <motion.div
          ref={imgRef}
          initial={{ opacity: 0, x: reduced || small ? 0 : 56 * from, y: reduced ? 0 : 28 }}
          animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
          transition={{ duration: reduced ? 0.2 : 1.05, ease: EASE }}
          className={cn(
            "lg:col-span-8 xl:col-span-9",
            flipped ? "lg:order-1" : "lg:order-2",
          )}
        >
          <motion.div style={{ y: reduced || small ? 0 : y }}>
            <div className="relative overflow-hidden bg-[#050505] ring-1 ring-white/[0.06] aspect-[16/9] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
              <motion.img
                src={layer.src}
                alt={`${layer.label} — ${layer.title}`}
                loading={index < 2 ? "eager" : "lazy"}
                decoding="async"
                initial={{ scale: reduced ? 1 : 1.07 }}
                animate={inView ? { scale: 1 } : {}}
                transition={{ duration: reduced ? 0.2 : 1.5, ease: EASE }}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: reduced || small ? 0 : -46 * from, y: reduced ? 0 : 22 }}
          animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
          transition={{
            duration: reduced ? 0.2 : 1,
            ease: EASE,
            delay: reduced ? 0 : 0.12,
          }}
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
            style={{ fontSize: "clamp(1.4rem, 2.4vw, 2rem)", letterSpacing: "-0.01em" }}
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
