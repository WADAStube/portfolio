import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "framer-motion";
import { EASE, useIsSmallScreen } from "@/components/motion-primitives";
import type { ProjectShot } from "@/data/projects";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────
   ShotFrame

   Jedes Bild sitzt in einem Rahmen mit einheitlichem
   Seitenverhaeltnis (pro Projekt festgelegt). Das Bild selbst
   wird NIE beschnitten — es wird eingepasst (object-contain).
   Der Rest des Rahmens wird mit einer weichgezeichneten,
   abgedunkelten Kopie desselben Bildes gefuellt.

   Dadurch stehen Hoch- und Querformat nebeneinander ruhig da,
   ohne dass etwas verloren geht oder verzerrt wird.
   ──────────────────────────────────────────────────────────── */

export function ShotFrame({
  shot,
  index,
  total,
  frameRatio,
  className,
  parallax = 48,
  priority = false,
  onClick,
}: {
  shot: ProjectShot;
  index: number;
  total: number;
  /** Breite/Hoehe des Rahmens, z.B. 1.78 fuer 16:9 */
  frameRatio: number;
  className?: string;
  parallax?: number;
  priority?: boolean;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const small = useIsSmallScreen();
  const [hover, setHover] = useState(false);

  const strength = reduced ? 0 : small ? parallax * 0.32 : parallax;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const rawY = useTransform(scrollYProgress, [0, 1], [strength, -strength]);
  const y = useSpring(rawY, { stiffness: 110, damping: 30, mass: 0.45 });

  /* Bild passt exakt in den Rahmen? Dann keinen Backdrop rendern. */
  const shotRatio = shot.w / shot.h;
  const fits = Math.abs(shotRatio - frameRatio) < 0.04;

  return (
    <figure
      ref={ref}
      className={cn("group relative", className)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <motion.div style={{ y: reduced ? 0 : y }} className="will-change-transform">
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 34, scale: reduced ? 1 : 0.985 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: reduced ? 0.2 : 1.05, ease: EASE }}
          className={cn(
            "relative overflow-hidden bg-[#080808] ring-1 ring-white/[0.07]",
            "transition-shadow duration-500",
            onClick && "cursor-pointer",
            hover && "ring-white/[0.16] shadow-[0_24px_70px_-30px_rgba(0,0,0,0.9)]",
          )}
          style={{ aspectRatio: `${frameRatio}` }}
          onClick={onClick}
        >
          {/* Weichgezeichneter Fuellhintergrund */}
          {!fits && (
            <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
              <img
                src={shot.src}
                alt=""
                aria-hidden="true"
                loading={priority ? "eager" : "lazy"}
                className="absolute inset-0 w-full h-full object-cover scale-125 blur-2xl opacity-30 saturate-150"
              />
              <div className="absolute inset-0 bg-black/45" />
            </div>
          )}

          {/* Das eigentliche Bild — vollstaendig, nie beschnitten */}
          <motion.img
            src={shot.src}
            alt={shot.caption ?? ""}
            width={shot.w}
            height={shot.h}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            animate={reduced ? undefined : { scale: hover ? 1.018 : 1 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="relative w-full h-full object-contain select-none"
          />

          {/* Zaehler oben links */}
          <div className="pointer-events-none absolute top-0 left-0 p-3 md:p-4">
            <motion.span
              animate={{ opacity: hover ? 1 : 0.45 }}
              transition={{ duration: 0.3 }}
              className="inline-block bg-black/55 backdrop-blur-sm px-2 py-1 font-mono text-[9px] tabular-nums text-white/70"
            >
              {String(index + 1).padStart(2, "0")}
              <span className="text-white/30"> / {String(total).padStart(2, "0")}</span>
            </motion.span>
          </div>

          {/* Hinweis unten rechts */}
          {onClick && (
            <motion.div
              initial={false}
              animate={{ opacity: hover ? 1 : 0, y: hover ? 0 : 8 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="pointer-events-none absolute bottom-0 right-0 p-3 md:p-4"
            >
              <span className="inline-flex items-center gap-2 bg-white/95 text-black px-3 py-1.5 text-[9px] uppercase tracking-[0.18em] font-medium">
                View full
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                  <path d="M1 9L9 1M9 1H3M9 1V7" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </span>
            </motion.div>
          )}
        </motion.div>

        {shot.caption && (
          <figcaption className="mt-3 flex items-baseline gap-3">
            <span className="h-px w-5 bg-white/15 shrink-0 translate-y-[-3px]" />
            <span className="text-[10px] text-white/32 uppercase tracking-[0.18em]">
              {shot.caption}
            </span>
          </figcaption>
        )}
      </motion.div>
    </figure>
  );
}
