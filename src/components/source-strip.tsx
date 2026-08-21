import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { EASE } from "@/components/motion-primitives";
import { cn } from "@/lib/utils";
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
  invert = false,
}: {
  sources: ProjectShot[];
  label?: string;
  invert?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  if (!sources.length) return null;

  return (
    <div className="mt-10 md:mt-14">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn("group flex items-center gap-3 w-full border-t pt-5 text-left", invert ? "border-black/12" : "border-white/[0.08]")}
      >
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className={cn("transition-colors duration-300", invert ? "text-black/45 group-hover:text-black" : "text-white/35 group-hover:text-white/70")}
        >
          {open ? <Minus size={13} /> : <Plus size={13} />}
        </motion.span>
        <span className={cn("text-[10px] uppercase tracking-[0.22em] transition-colors duration-300", invert ? "text-black/50 group-hover:text-black" : "text-white/40 group-hover:text-white/75")}>
          {label}
        </span>
        <span className={cn("ml-auto font-mono text-[9px] tabular-nums", invert ? "text-black/35" : "text-white/25")}>
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
            <p className={cn("pt-6 pb-5 text-xs font-light leading-relaxed max-w-xl", invert ? "text-black/55" : "text-white/40")}>
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
                  <figcaption className={cn("mt-2 text-[9px] uppercase tracking-[0.14em]", invert ? "text-black/45" : "text-white/28")}>
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
