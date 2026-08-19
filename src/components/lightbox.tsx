import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Project } from "@/data/projects";
import { cn } from "@/lib/utils";
import { EASE } from "@/components/motion-primitives";

interface LightboxProps {
  project: Project | null;
  startIndex: number;
  onClose: () => void;
}

export function Lightbox({ project, startIndex, onClose }: LightboxProps) {
  const [idx, setIdx] = useState(startIndex);
  const [dir, setDir] = useState(1);

  const shots = project?.shots ?? [];
  const count = shots.length;

  useEffect(() => setIdx(startIndex), [startIndex, project]);

  const go = useCallback(
    (delta: number) => {
      if (count < 2) return;
      setDir(delta);
      setIdx((i) => (i + delta + count) % count);
    },
    [count],
  );

  /* Body-Scroll sperren */
  useEffect(() => {
    if (!project) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [project]);

  /* Tastatursteuerung */
  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [project, onClose, go]);

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 70 : -70, scale: 0.98 }),
    center: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.55, ease: EASE },
    },
    exit: (d: number) => ({
      opacity: 0,
      x: d > 0 ? -70 : 70,
      scale: 0.98,
      transition: { duration: 0.35, ease: EASE },
    }),
  };

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="fixed inset-0 z-[9997] bg-black/96 backdrop-blur-xl flex flex-col"
        >
          {/* Kopfzeile */}
          <div className="flex items-center justify-between px-5 md:px-8 py-5 shrink-0">
            <div className="min-w-0">
              <p className="text-sm font-display font-medium text-white/85 truncate">
                {project.title}
              </p>
              <p className="text-[9px] uppercase tracking-[0.22em] text-white/30 mt-1 truncate">
                {shots[idx]?.caption ?? project.category}
              </p>
            </div>
            <div className="flex items-center gap-6 shrink-0 pl-4">
              <span className="font-mono text-[10px] text-white/30 tabular-nums">
                {String(idx + 1).padStart(2, "0")} /{" "}
                {String(count).padStart(2, "0")}
              </span>
              <button
                onClick={onClose}
                aria-label="Close"
                className="text-white/45 hover:text-white transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Bildbühne */}
          <div className="relative flex-1 min-h-0 flex items-center justify-center px-4 md:px-16 pb-4">
            <AnimatePresence initial={false} custom={dir} mode="wait">
              {shots[idx]?.video ? (
                <motion.video
                  key={`v${idx}`}
                  src={shots[idx]?.src}
                  poster={shots[idx]?.poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  custom={dir}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  drag={count > 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.14}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -70) go(1);
                    else if (info.offset.x > 70) go(-1);
                  }}
                  className="max-h-full max-w-full object-contain select-none cursor-grab active:cursor-grabbing"
                />
              ) : (
                <motion.img
                  key={`i${idx}`}
                  src={shots[idx]?.src}
                  alt={`${project.title} — ${shots[idx]?.caption ?? idx + 1}`}
                  custom={dir}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  drag={count > 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.14}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -70) go(1);
                    else if (info.offset.x > 70) go(-1);
                  }}
                  className="max-h-full max-w-full object-contain select-none cursor-grab active:cursor-grabbing"
                />
              )}
            </AnimatePresence>

            {count > 1 && (
              <>
                <button
                  onClick={() => go(-1)}
                  aria-label="Previous image"
                  className="absolute left-2 md:left-5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/[0.06] hover:bg-white/[0.14] text-white/60 hover:text-white transition-all duration-200"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => go(1)}
                  aria-label="Next image"
                  className="absolute right-2 md:right-5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/[0.06] hover:bg-white/[0.14] text-white/60 hover:text-white transition-all duration-200"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {count > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5, ease: EASE }}
              className="shrink-0 flex gap-2 justify-center px-4 pb-6 overflow-x-auto no-scroll"
            >
              {shots.map((s, i) => (
                <button
                  key={s.src}
                  onClick={() => {
                    setDir(i > idx ? 1 : -1);
                    setIdx(i);
                  }}
                  className={cn(
                    "shrink-0 w-16 h-11 overflow-hidden transition-all duration-300",
                    i === idx
                      ? "opacity-100 ring-1 ring-white/70"
                      : "opacity-35 hover:opacity-70",
                  )}
                >
                  <img
                    src={s.video ? (s.poster ?? s.src) : s.src}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
