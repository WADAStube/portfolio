import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { EASE } from "@/components/motion-primitives";
import type { ProjectShot } from "@/data/projects";

/* ────────────────────────────────────────────────────────────
   SourceStrip

   Ausklappbare Leiste mit dem Quellmaterial einer Montage —
   die einzelnen Ebenen, aus denen das finale Bild entstanden ist.
   Standardmaessig eingeklappt, damit sie das Projekt nicht
   ueberlagert.
   ──────────────────────────────────────────────────────────── */

export function SourceStrip({
  sources,
  label = "Source material",
}: {
  sources: ProjectShot[];
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  if (!sources.length) return null;

  return (
    <div className="mt-10 md:mt-14">
      <button
        onClick={() => setOpen((o) => !o)}
        className="group flex items-center gap-3 w-full border-t border-white/[0.08] pt-5 text-left"
      >
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="text-white/35 group-hover:text-white/70 transition-colors duration-300"
        >
          {open ? <Minus size={13} /> : <Plus size={13} />}
        </motion.span>
        <span className="text-[10px] uppercase tracking-[0.22em] text-white/40 group-hover:text-white/75 transition-colors duration-300">
          {label}
        </span>
        <span className="ml-auto font-mono text-[9px] text-white/25 tabular-nums">
          {String(sources.length).padStart(2, "0")}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduced ? 0.15 : 0.6, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="pt-6 pb-5 text-xs font-light leading-relaxed text-white/40 max-w-xl">
              The finished poster is a composite. These are the individual
              plates it was built from — each masked, graded and blended
              separately before being combined.
            </p>

            <div className="flex gap-3 overflow-x-auto no-scroll pb-3 -mx-1 px-1">
              {sources.map((s, i) => (
                <motion.figure
                  key={s.src}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: reduced ? 0.15 : 0.6,
                    ease: EASE,
                    delay: reduced ? 0 : i * 0.07,
                  }}
                  whileHover={reduced ? undefined : { y: -5 }}
                  className="shrink-0 w-[150px] sm:w-[180px] group/src"
                >
                  <div className="relative overflow-hidden bg-[#080808] ring-1 ring-white/[0.07] group-hover/src:ring-white/20 transition-all duration-400 aspect-[3/2]">
                    <img
                      src={s.src}
                      alt={s.caption ?? ""}
                      loading="lazy"
                      className="w-full h-full object-cover opacity-70 group-hover/src:opacity-100 transition-opacity duration-500"
                    />
                    <span className="absolute top-1.5 left-1.5 font-mono text-[8px] text-white/50 bg-black/60 px-1.5 py-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <figcaption className="mt-2 text-[9px] uppercase tracking-[0.14em] text-white/28">
                    {s.caption}
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
