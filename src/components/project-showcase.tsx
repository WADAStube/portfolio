import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import type { Project } from "@/data/projects";
import {
  Reveal,
  Stagger,
  StaggerItem,
  SplitText,
  EASE,
  useIsSmallScreen,
  CountUpNumber,
} from "@/components/motion-primitives";
import { ShotFrame } from "@/components/shot-frame";
import { SourceStrip } from "@/components/source-strip";
import { CompareSlider } from "@/components/compare-slider";
import { ScrollSequence } from "@/components/scroll-sequence";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────
   Einheitliches Rahmenformat pro Projekt.

   Statt jedes Bild in seiner eigenen Groesse zu setzen (was zu
   dem unruhigen Wechsel aus grossen und kleinen Bildern fuehrt),
   bekommt jedes Projekt EIN Rahmenformat. Es wird aus dem
   Median der Bildformate abgeleitet, damit der Rahmen zu dem
   passt, was tatsaechlich drin liegt.
   ──────────────────────────────────────────────────────────── */
const frameRatioFor = (shots: { w: number; h: number }[]) => {
  if (!shots.length) return 16 / 9;
  const ratios = shots.map((s) => s.w / s.h).sort((a, b) => a - b);
  const mid = Math.floor(ratios.length / 2);
  const median =
    ratios.length % 2 ? ratios[mid] : (ratios[mid - 1] + ratios[mid]) / 2;
  return Math.min(2.1, Math.max(0.48, median));
};

/* Spaltenbreite passend zum Rahmenformat — ein Hochformat darf
   nicht die volle Breite einnehmen, sonst wird es riesig. */
const columnWidthFor = (ratio: number) => {
  if (ratio < 0.62) return "w-[64%] sm:w-[46%] md:w-[38%]"; // Handy-Screenshots
  if (ratio < 0.95) return "w-[88%] sm:w-[70%] md:w-[56%]"; // Poster
  if (ratio < 1.35) return "w-full sm:w-[86%] md:w-[74%]"; // quadratisch
  return "w-full"; // Querformat
};

export function ProjectShowcase({
  project,
  index,
  total,
  onOpenShot,
}: {
  project: Project;
  index: number;
  total: number;
  onOpenShot: (project: Project, shotIndex: number) => void;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const shotsRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [activeShot, setActiveShot] = useState(0);

  const shots = project.shots;
  const small = useIsSmallScreen();
  const isGrid = project.layout === "grid";
  const invert = !!project.invert;
  const frameRatio = frameRatioFor(shots);
  const colWidth = columnWidthFor(frameRatio);
  const num = String(index + 1).padStart(2, "0");
  const totalLabel = String(total).padStart(2, "0");

  /* Fortschritt innerhalb der Bildspalte */
  const { scrollYProgress } = useScroll({
    target: shotsRef,
    offset: ["start 60%", "end 80%"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.3,
  });

  /* Aktives Bild: das, welches der Mitte des Viewports am naechsten ist.
     Deutlich genauer als eine Rechnung aus dem Scroll-Fortschritt. */
  useEffect(() => {
    const carousel = carouselRef.current;
    const root = carousel ?? shotsRef.current;
    if (!root || shots.length < 2) return;

    const figures = Array.from(root.querySelectorAll("figure"));
    if (!figures.length) return;

    const horizontal = !!carousel;
    let raf = 0;

    const measure = () => {
      raf = 0;
      /* Waagerecht wird gegen die Mitte des Wischfelds gemessen,
         senkrecht gegen die Mitte des Bildschirms. */
      const mid = horizontal
        ? carousel!.getBoundingClientRect().left +
          carousel!.getBoundingClientRect().width / 2
        : window.innerHeight / 2;

      let best = 0;
      let bestDist = Infinity;
      figures.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        const center = horizontal ? r.left + r.width / 2 : r.top + r.height / 2;
        const dist = Math.abs(center - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      setActiveShot((prev) => (prev === best ? prev : best));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    measure();
    const target: (Window | HTMLDivElement)[] = horizontal
      ? [carousel!]
      : [window];
    target.forEach((t) =>
      t.addEventListener("scroll", onScroll as EventListener, { passive: true }),
    );
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      target.forEach((t) =>
        t.removeEventListener("scroll", onScroll as EventListener),
      );
      window.removeEventListener("resize", onScroll);
    };
  }, [shots.length, small, isGrid]);

  /* Grosse Ordnungszahl driftet leicht mit */
  const { scrollYProgress: sectionProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const numY = useTransform(
    sectionProgress,
    [0, 1],
    reduced ? ["0%", "0%"] : ["30%", "-30%"],
  );
  const numOpacity = useTransform(
    sectionProgress,
    [0, 0.2, 0.8, 1],
    [0, 1, 1, 0],
  );

  return (
    <section
      ref={sectionRef}
      id={project.id}
      /* overflow-x-clip statt -hidden: begrenzt seitlich, erzeugt aber
         KEINEN Scroll-Container — position: sticky bleibt dadurch
         funktionsfaehig. Noetig, weil die Bildspalte beim Einblenden
         46 px versetzt startet. */
      className={cn(
        "relative overflow-x-clip scroll-mt-24 border-t py-20 md:py-32 lg:py-40",
        "transition-colors duration-700",
        invert
          ? "bg-[#f4f2ee] text-[#0a0a0a] border-black/10"
          : "border-white/[0.05]",
      )}
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-10 gap-x-10 lg:gap-x-16">
          {/* ─────────── Sticky Info-Spalte ─────────── */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-hidden">
              {/* Der ganze Textblock kommt von links herein.
                  Das x liegt auf dem INHALT, nicht auf dem
                  sticky-Element selbst — sonst bricht das Kleben. */}
              <motion.div
                /* Seitlich nur ab Tablet. Auf dem Handy wuerde der
                   Versatz die Seite waagerecht verschiebbar machen,
                   solange die Section noch nicht sichtbar ist. */
                initial={{
                  opacity: 0,
                  x: reduced || small ? 0 : -46,
                  y: reduced ? 0 : small ? 26 : 0,
                }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: reduced ? 0.2 : 1.05, ease: EASE }}
              >
              {/* Kopfzeile: Nummer + Kategorie */}
              <Reveal direction="up" duration={0.8}>
                <div className="flex items-center gap-4 mb-5">
                  <span className={cn("font-mono text-[10px] tabular-nums", invert ? "text-black/45" : "text-white/30")}>
                    {num}
                    <span className={invert ? "text-black/25" : "text-white/15"}> / {totalLabel}</span>
                  </span>
                  <span className={cn("h-px flex-1", invert ? "bg-black/10" : "bg-white/[0.08]")} />
                  {project.featured && (
                    <span className={cn("text-[8px] uppercase tracking-[0.24em]", invert ? "text-black/45" : "text-white/35")}>
                      Featured
                    </span>
                  )}
                </div>
              </Reveal>

              {/* Titel */}
              <h2
                className={cn(
                  "font-display font-bold leading-[1.02] mb-3",
                  invert ? "text-[#0a0a0a]" : "text-white",
                )}
                style={{
                  fontSize: "clamp(1.9rem, 3.4vw, 3rem)",
                  letterSpacing: "-0.02em",
                }}
              >
                <SplitText text={project.title} />
              </h2>

              <Reveal direction="up" delay={0.1} duration={0.9}>
                <p className={cn("text-[10px] uppercase tracking-[0.24em] mb-6", invert ? "text-black/45" : "text-white/35")}>
                  {project.category}
                </p>
              </Reveal>

              {/* Bildfortschritt — steht bewusst weit oben, damit er
                  auch auf niedrigen Bildschirmen immer sichtbar ist. */}
              {shots.length > 1 && small && !isGrid && (
                <div className="flex items-center gap-3 mb-7">
                  <span className="text-[8px] uppercase tracking-[0.2em] text-white/30 shrink-0">
                    Swipe
                  </span>
                  <div className="flex items-center gap-1.5">
                    {shots.map((sh, i) => (
                      <motion.span
                        key={sh.src}
                        animate={{
                          width: i === activeShot ? 18 : 6,
                          opacity: i === activeShot ? 0.9 : 0.25,
                        }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="h-[3px] rounded-full bg-white block"
                      />
                    ))}
                  </div>
                  <span className="ml-auto font-mono text-[10px] text-white/45 tabular-nums">
                    {String(activeShot + 1).padStart(2, "0")}
                    <span className="text-white/20">
                      /{String(shots.length).padStart(2, "0")}
                    </span>
                  </span>
                </div>
              )}

              {shots.length > 1 && !(small && !isGrid) && (
                <div className="flex items-center gap-4 mb-7">
                  <div className="relative h-[2px] flex-1 bg-white/[0.08] overflow-hidden rounded-full">
                    <motion.div
                      className="absolute inset-y-0 left-0 w-full bg-white/55 origin-left rounded-full"
                      style={{ scaleX: progress }}
                    />
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[10px] tabular-nums shrink-0">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={activeShot}
                        initial={{ y: reduced ? 0 : 9, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: reduced ? 0 : -9, opacity: 0 }}
                        transition={{ duration: 0.32, ease: EASE }}
                        className="inline-block text-white/75"
                      >
                        {String(activeShot + 1).padStart(2, "0")}
                      </motion.span>
                    </AnimatePresence>
                    <span className="text-white/20">
                      /{String(shots.length).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              )}

              {/* Software — ebenfalls oberhalb des Beschreibungstexts */}
              <div className="mb-7">
                <p className={cn("text-[8px] uppercase tracking-[0.24em] mb-3", invert ? "text-black/40" : "text-white/22")}>
                  Software
                </p>
                <Stagger className="flex flex-wrap gap-2" gap={0.05}>
                  {project.tools.map((tool) => (
                    <StaggerItem key={tool} distance={12}>
                      <motion.span
                        whileHover={reduced ? undefined : { y: -2 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className={cn(
                          "inline-block px-3 py-1.5 text-[10px] tracking-wide border transition-colors duration-300",
                          invert
                            ? "text-black/65 bg-black/[0.03] border-black/10 hover:border-black/35 hover:text-black"
                            : "text-white/55 bg-white/[0.03] border-white/[0.07] hover:border-white/20 hover:text-white/80",
                        )}
                      >
                        {tool}
                      </motion.span>
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>

              {/* Polygonzahlen — zaehlen beim Erscheinen hoch */}
              {project.stats && (
                <div
                  className={cn(
                    "grid grid-cols-2 gap-6 mb-7 pt-6 border-t",
                    invert ? "border-black/10" : "border-white/[0.06]",
                  )}
                >
                  <div>
                    <p
                      className={cn(
                        "text-[8px] uppercase tracking-[0.24em] mb-1.5",
                        invert ? "text-black/40" : "text-white/22",
                      )}
                    >
                      Vertices
                    </p>
                    <p
                      className={cn(
                        "font-display font-medium tabular-nums",
                        invert ? "text-black/80" : "text-white/80",
                      )}
                      style={{ fontSize: "clamp(1rem, 1.5vw, 1.25rem)" }}
                    >
                      <CountUpNumber value={project.stats.verts} />
                    </p>
                  </div>
                  <div>
                    <p
                      className={cn(
                        "text-[8px] uppercase tracking-[0.24em] mb-1.5",
                        invert ? "text-black/40" : "text-white/22",
                      )}
                    >
                      Triangles
                    </p>
                    <p
                      className={cn(
                        "font-display font-medium tabular-nums",
                        invert ? "text-black/80" : "text-white/80",
                      )}
                      style={{ fontSize: "clamp(1rem, 1.5vw, 1.25rem)" }}
                    >
                      <CountUpNumber value={project.stats.tris} duration={1.9} />
                    </p>
                  </div>
                </div>
              )}

              {/* Meta */}
              <Stagger
                className={cn("grid grid-cols-2 gap-6 mb-7 pt-6 border-t", invert ? "border-black/10" : "border-white/[0.06]")}
                gap={0.06}
              >
                {project.role && (
                  <StaggerItem>
                    <p className={cn("text-[8px] uppercase tracking-[0.24em] mb-1.5", invert ? "text-black/40" : "text-white/22")}>
                      Role
                    </p>
                    <p className={cn("text-sm font-light", invert ? "text-black/70" : "text-white/65")}>
                      {project.role}
                    </p>
                  </StaggerItem>
                )}
                {project.year && (
                  <StaggerItem>
                    <p className={cn("text-[8px] uppercase tracking-[0.24em] mb-1.5", invert ? "text-black/40" : "text-white/22")}>
                      Year
                    </p>
                    <p className={cn("text-sm font-light tabular-nums", invert ? "text-black/70" : "text-white/65")}>
                      {project.year}
                    </p>
                  </StaggerItem>
                )}
              </Stagger>

              {/* Beschreibung zuletzt — auf niedrigen Bildschirmen
                  wird sie gekuerzt, damit oben nichts abgeschnitten wird. */}
              <Reveal direction="up" delay={0.14} duration={0.9}>
                <p
                  className={cn(
                    "text-sm font-light leading-[1.85] max-w-md",
                    invert ? "text-black/60" : "text-white/48",
                    "lg:[@media(max-height:900px)]:line-clamp-6",
                    "lg:[@media(max-height:780px)]:line-clamp-4",
                  )}
                >
                  {project.longDescription || project.description}
                </p>
              </Reveal>
              </motion.div>
            </div>
          </div>

          {/* ─────────── Bildspalte ─────────── */}
          <motion.div
            ref={shotsRef}
            initial={{
              opacity: 0,
              x: reduced || small ? 0 : 46,
              y: reduced ? 0 : small ? 26 : 0,
            }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{ duration: reduced ? 0.2 : 1.05, ease: EASE }}
            className="lg:col-span-8 space-y-14 md:space-y-20 lg:space-y-28"
          >
            {small && !isGrid ? (
              /* Handy: waagerecht wischbare Galerie mit Einrasten.
                 Statt eines langen Stapels, durch den man nur
                 scrollt, laesst sich hier Bild fuer Bild wischen —
                 kuerzere Seite und echte Interaktion. */
              <div
                ref={carouselRef}
                className="-mx-6 px-6 flex gap-4 overflow-x-auto snap-x snap-mandatory no-scroll pb-1"
              >
                {shots.map((shot, i) => (
                  <div key={shot.src} className="w-[86%] shrink-0 snap-center">
                    <ShotFrame
                      shot={shot}
                      index={i}
                      total={shots.length}
                      frameRatio={frameRatio}
                      parallax={0}
                      priority={index === 0 && i === 0}
                      className="w-full"
                      onClick={() => onOpenShot(project, i)}
                    />
                  </div>
                ))}
                {/* Luft am Ende, damit das letzte Bild mittig einrastet */}
                <div className="shrink-0 w-2" aria-hidden="true" />
              </div>
            ) : isGrid ? (
              /* Raster — App-Screenshots sind klein und gleichfoermig.
                 Untereinander gestapelt wirken sie neben den grossen
                 Renders unruhig, im Raster dagegen ruhig und geordnet. */
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {shots.map((shot, i) => (
                  <ShotFrame
                    key={shot.src}
                    shot={shot}
                    index={i}
                    total={shots.length}
                    frameRatio={frameRatio}
                    parallax={0}
                    priority={index === 0 && i === 0}
                    className="w-full"
                    invert={invert}
                    onClick={() => onOpenShot(project, i)}
                  />
                ))}
              </div>
            ) : (
              shots.map((shot, i) => (
                <ShotFrame
                  key={shot.src}
                  shot={shot}
                  index={i}
                  total={shots.length}
                  frameRatio={frameRatio}
                  parallax={reduced ? 0 : i % 2 === 0 ? 44 : 66}
                  priority={index === 0 && i === 0}
                  className={cn(colWidth, i % 2 === 1 && "md:ml-auto")}
                  invert={invert}
                  onClick={() => onOpenShot(project, i)}
                />
              ))
            )}

            {project.sequence && (
              <ScrollSequence
                frames={project.sequence.frames}
                ratio={project.sequence.ratio}
                caption={project.sequence.caption}
                className={columnWidthFor(project.sequence.ratio)}
              />
            )}

            {project.compare && (
              <CompareSlider
                before={project.compare.before}
                after={project.compare.after}
                beforeLabel={project.compare.beforeLabel}
                afterLabel={project.compare.afterLabel}
                note={project.compare.note}
                invert={invert}
                className={columnWidthFor(
                  project.compare.before.w / project.compare.before.h,
                )}
              />
            )}

            {project.sources?.length ? (
              <SourceStrip sources={project.sources} invert={invert} />
            ) : null}
          </motion.div>
        </div>
      </div>

      {/* Grosse Ordnungszahl im Hintergrund.
          Eigener geclippter Wrapper — kein overflow-hidden auf der Section,
          das wuerde position:sticky in der Info-Spalte aushebeln. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden hidden xl:block -z-10"
      >
        <motion.span
          style={{ y: numY, opacity: numOpacity }}
          className="select-none absolute right-6 top-1/2 font-display font-bold text-white/[0.028] leading-none"
        >
          <span style={{ fontSize: "clamp(8rem, 16vw, 20rem)" }}>{num}</span>
        </motion.span>
      </div>
    </section>
  );
}
