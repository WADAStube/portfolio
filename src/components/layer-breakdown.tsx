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

  const flipped = index % 2 === 1;
  const from = flipped ? -1 : 1;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  /* EINE Feder glaettet den Fortschritt, alle Werte werden
     daraus abgeleitet. Vorher lief jede Eigenschaft ueber eine
     eigene Feder — die laufen minimal unterschiedlich nach,
     wodurch sich Verschiebung, Groesse und Deckkraft gegenseitig
     "verhaken". Genau das hat unruhig gewirkt. */
  const p = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    mass: 0.35,
    restDelta: 0.0005,
  });

  const off = reduced || small ? 0 : 1;

  /* Auftritt */
  const inX = useTransform(p, [0.04, 0.40], [78 * from * off, 0]);
  const inXText = useTransform(p, [0.07, 0.45], [-58 * from * off, 0]);
  const inOpacity = useTransform(p, [0.04, 0.34], [0, 1]);

  /* Langsames Heranfahren, solange der Abschnitt sichtbar ist */
  const imgScale = useTransform(p, [0.04, 0.7], [1 + 0.06 * off, 1]);

  /* Abgang — gleiche Bewegung wie beim Turntable */
  const outY = useTransform(p, [0.66, 1], [0, reduced ? 0 : -170]);
  const outScale = useTransform(p, [0.66, 1], [1, reduced ? 1 : 0.92]);
  const outOpacity = useTransform(p, [0.7, 0.99], [1, 0]);
  const outFilter = useTransform(
    useTransform(p, [0.66, 0.98], [0, reduced || small ? 0 : 7]),
    (b) => `blur(${b}px)`,
  );

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center",
        /* Genau eine Bildschirmhoehe, damit das Einrasten auch
           genau dort stoppt. Vorher kam Innenabstand dazu — der
           Block war hoeher als der Bildschirm und beim Einrasten
           blieb oben und unten etwas verdeckt. */
        "md:h-svh md:snap-center",
        "min-h-svh py-16 md:py-0",
      )}
    >
      <motion.div
        style={{
          y: outY,
          scale: outScale,
          opacity: outOpacity,
          filter: reduced || small ? undefined : outFilter,
          willChange: "transform, opacity, filter",
        }}
        className="w-full"
      >
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-y-8 gap-x-10 xl:gap-x-12 items-center">
          <motion.div
            style={{ x: inX, opacity: inOpacity, willChange: "transform, opacity" }}
            className={cn(
              "lg:col-span-8 xl:col-span-9",
              flipped ? "lg:order-1" : "lg:order-2",
            )}
          >
            <div className="relative overflow-hidden bg-[#050505] ring-1 ring-white/[0.06] aspect-[16/9] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
              <motion.img
                src={layer.src}
                alt={`${layer.label} — ${layer.title}`}
                loading={index < 2 ? "eager" : "lazy"}
                decoding="async"
                style={{ scale: imgScale, willChange: "transform" }}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          <motion.div
            style={{ x: inXText, opacity: inOpacity, willChange: "transform, opacity" }}
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
