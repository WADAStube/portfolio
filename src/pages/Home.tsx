import { useState, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { Volume2, VolumeX, ArrowDown } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Lightbox } from "@/components/lightbox";
import { ProjectShowcase } from "@/components/project-showcase";
import { AboutSection } from "@/components/about-section";
import {
  Reveal,
  Stagger,
  StaggerItem,
  SplitText,
  Parallax,
  EASE,
  useIsSmallScreen,
} from "@/components/motion-primitives";
import { projectsData } from "@/data/projects";
import type { Project } from "@/data/projects";
import { useAmbientSound } from "@/hooks/useAmbientSound";
import { cn } from "@/lib/utils";

/* ─────────────────────── static data ───────────────────────── */

/* Lebenslauf-Download.
   Zum Aktivieren: PDF nach public/ legen und den Pfad hier
   eintragen, z.B. "/Issam-Selmi-CV.pdf".
   Solange null, wird der Button gar nicht erst angezeigt —
   so entsteht kein toter Link auf der Live-Seite. */
const CV_FILE: string | null = "/Issam-Selmi-CV.pdf";
/* Nur Software, die in den Projekten auf dieser Seite
   tatsaechlich zum Einsatz kam. */
const MARQUEE = [
  "Autodesk Maya",
  "Substance Painter",
  "Arnold",
  "XGen",
  "Unreal Engine",
  "Unity",
  "Adobe Photoshop",
  "Adobe Illustrator",
  "Adobe InDesign",
  "After Effects",
  "Premiere Pro",
  "Flutter",
  "React",
  "TypeScript",
];

/* ─────────────────────── Grain overlay ─────────────────────── */
const Grain = () => <div aria-hidden="true" className="grain" />;

/* ─────────────────────── Custom cursor ─────────────────────── */
function Cursor() {
  const dx = useMotionValue(-100);
  const dy = useMotionValue(-100);
  const rx = useMotionValue(-100);
  const ry = useMotionValue(-100);
  const sx = useSpring(rx, { stiffness: 200, damping: 22 });
  const sy = useSpring(ry, { stiffness: 200, damping: 22 });
  const [expanded, setExpanded] = useState(false);
  const [ready, setReady] = useState(false);

  /* Auf Touch-Geräten komplett deaktiviert */
  const [fine, setFine] = useState(false);
  useEffect(() => {
    setFine(window.matchMedia("(pointer: fine)").matches);
  }, []);

  useEffect(() => {
    if (!fine) return;
    const mv = (e: MouseEvent) => {
      dx.set(e.clientX - 2);
      dy.set(e.clientY - 2);
      rx.set(e.clientX - 18);
      ry.set(e.clientY - 18);
      setReady(true);
    };
    const mo = (e: MouseEvent) => {
      setExpanded(
        !!(e.target as HTMLElement).closest("a,button,[role='button'],figure"),
      );
    };
    window.addEventListener("mousemove", mv);
    window.addEventListener("mouseover", mo);
    return () => {
      window.removeEventListener("mousemove", mv);
      window.removeEventListener("mouseover", mo);
    };
  }, [dx, dy, rx, ry, fine]);

  if (!fine || !ready) return null;
  return (
    <>
      <motion.div className="cur-dot" style={{ x: dx, y: dy }} />
      <motion.div
        className={cn("cur-ring", expanded && "expanded")}
        style={{ x: sx, y: sy }}
      />
    </>
  );
}

/* ──────────────────────── Marquee strip ────────────────────── */
function Marquee() {
  const items = [...MARQUEE, ...MARQUEE];
  return (
    <div className="mq-wrap border-y border-white/[0.05] py-3">
      <div className="mq-track">
        {items.map((t, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-4 px-4 text-[9px] uppercase tracking-[0.25em] text-white/20"
          >
            {t}
            <span className="text-white/12">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────── Mute button ───────────────────────── */
function MuteBtn({ muted, onToggle }: { muted: boolean; onToggle: () => void }) {
  return (
    <motion.button
      onClick={onToggle}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      transition={{ delay: 2.5, duration: 0.8, ease: EASE }}
      aria-label={muted ? "Unmute" : "Mute"}
      className="fixed bottom-6 right-6 z-[9995] w-9 h-9 flex items-center justify-center bg-white/[0.07] hover:bg-white/[0.14] text-white/40 hover:text-white/75 transition-colors duration-200"
    >
      {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
    </motion.button>
  );
}

/* ─────────────── Projekt-Index (springt zu den Sections) ────── */
function ProjectIndex({ projects }: { projects: Project[] }) {
  const jump = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <Stagger className="border-t border-white/[0.06]" gap={0.05}>
      {projects.map((p, i) => (
        <StaggerItem key={p.id} distance={16}>
          <button
            onClick={() => jump(p.id)}
            className="group w-full flex items-baseline gap-5 md:gap-8 py-5 border-b border-white/[0.06] text-left transition-colors duration-300 hover:bg-white/[0.015]"
          >
            <span className="font-mono text-[10px] text-white/25 tabular-nums shrink-0">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="font-display font-medium text-lg md:text-2xl text-white/65 group-hover:text-white transition-colors duration-300 flex-1 min-w-0 truncate">
              {p.title}
            </span>
            <span className="hidden md:block text-[9px] uppercase tracking-[0.2em] text-white/25 shrink-0">
              {p.tools.slice(0, 2).join(" · ")}
            </span>
            <motion.span
              className="text-white/25 group-hover:text-white/70 transition-colors duration-300 shrink-0"
              initial={false}
            >
              <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
                <path
                  d="M1 9L9 1M9 1H3M9 1V7"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
            </motion.span>
          </button>
        </StaggerItem>
      ))}
    </Stagger>
  );
}

/* ─────────────────────────── Home ──────────────────────────── */
export default function Home() {
  const [lightbox, setLightbox] = useState<{
    project: Project;
    index: number;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const smallScreen = useIsSmallScreen();
  const videoScale = useTransform(
    scrollYProgress,
    [0, 1],
    smallScreen ? [1, 1.05] : [1, 1.16],
  );
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.4, 0.85]);

  const { isMuted, toggle } = useAmbientSound(
    videoRef as React.RefObject<HTMLVideoElement>,
  );

  const projects = projectsData;

  return (
    <div className="bg-background min-h-screen text-foreground selection:bg-white/20">
      <Grain />
      <Cursor />
      <Navbar />
      <MuteBtn muted={isMuted} onToggle={toggle} />

      {/* ══════════════════ HERO ══════════════════ */}
      <section ref={heroRef} id="top" className="relative h-svh overflow-hidden">
        <div className="absolute inset-0">
          {/* Der Clip ist 1920x812 — sehr breit (2,36:1).
              Formatfuellend auf einem Hochformat-Handy wuerde rund
              80 % der Breite wegfallen und der Rest stark
              hochskaliert: unscharf und schlecht ausgeschnitten.
              Mobil laeuft er daher als 4:3-Band mit massvollem
              Beschnitt — praktisch ohne Hochskalierung und damit
              scharf. Ab md dann wie gehabt formatfuellend. */}
          <div className="absolute inset-x-0 top-[17%] aspect-[4/3] overflow-hidden md:inset-0 md:top-0 md:aspect-auto">
            <motion.video
              ref={videoRef}
              style={{ scale: reduced ? 1 : videoScale, y: reduced ? 0 : videoY }}
              src="/videos/hero.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="w-full h-full object-cover origin-center will-change-transform"
            />
          </div>

          <motion.div
            className="absolute inset-0 bg-black"
            style={{ opacity: overlayOpacity }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-[55%] bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-[30%] bg-gradient-to-b from-black/60 to-transparent" />
        </div>

        {/* Hero-Text */}
        <motion.div
          style={{ opacity: heroOpacity, y: reduced ? 0 : heroY }}
          className="absolute bottom-0 left-0 right-0 z-10 px-6 md:px-14 pb-10 md:pb-14"
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-0">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: EASE, delay: 0.3 }}
                className="text-[9px] text-white/35 uppercase tracking-[0.28em] mb-4"
              >
                Portfolio 2026
              </motion.p>
              <h1
                className="font-display font-bold text-white leading-[0.9]"
                style={{
                  fontSize: "clamp(3.4rem, 10vw, 10rem)",
                  letterSpacing: "-0.02em",
                }}
              >
                <span className="inline-block overflow-hidden align-bottom">
                  <motion.span
                    className="inline-block"
                    initial={{ y: "105%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 1.2, ease: EASE, delay: 0.45 }}
                  >
                    Issam
                  </motion.span>
                </span>{" "}
                <span className="inline-block overflow-hidden align-bottom">
                  <motion.span
                    className="inline-block"
                    initial={{ y: "105%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 1.2, ease: EASE, delay: 0.56 }}
                  >
                    Selmi
                  </motion.span>
                </span>
              </h1>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: EASE, delay: 0.75 }}
              className="flex flex-col items-start md:items-end gap-4 md:pb-2"
            >
              <p className="text-sm md:text-base font-light text-white/50 uppercase tracking-[0.22em]">
                3D &amp; Game Art
              </p>
              <p className="text-[9px] font-light text-white/30 uppercase tracking-[0.2em] -mt-2">
                Media Technology
              </p>
              <div className="flex items-center gap-2">
                <span className="h-[5px] w-[5px] rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] text-white/35 uppercase tracking-[0.18em]">
                  Based in Hamburg
                </span>
              </div>
              <motion.button
                onClick={() =>
                  document
                    .querySelector("#work")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                whileHover={{ x: 4 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="text-[9px] text-white/28 uppercase tracking-[0.22em] hover:text-white/70 transition-colors duration-300 flex items-center gap-2 mt-2"
              >
                <span className="w-5 h-px bg-current" />
                View work
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Vertikales Label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.1 }}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-10 hidden lg:flex"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
        >
          <span className="text-[8px] text-white/22 uppercase tracking-[0.34em] rotate-180">
            WADAS · Est. 2016
          </span>
        </motion.div>

        {/* Scroll-Hinweis */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden md:block"
        >
          <motion.div
            animate={reduced ? undefined : { y: [0, 7, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="text-white/25"
          >
            <ArrowDown size={14} />
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════ MARQUEE ══════════════════ */}
      <Marquee />

      {/* ══════════════════ WORK ══════════════════ */}
      <section id="work" className="pt-20 md:pt-28">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-16">
          <div className="flex items-end justify-between mb-10 md:mb-14">
            <div>
              <Reveal direction="up" duration={0.8}>
                <p className="text-[8px] text-white/22 uppercase tracking-[0.28em] mb-4">
                  Selected Work
                </p>
              </Reveal>
              <h2
                className="font-display font-bold leading-none"
                style={{
                  fontSize: "clamp(2rem, 6vw, 5rem)",
                  letterSpacing: "-0.02em",
                }}
              >
                <SplitText text="Portfolio" />
              </h2>
            </div>
            <Reveal direction="up" delay={0.15}>
              <p className="text-[9px] text-white/22 uppercase tracking-[0.22em] hidden md:block text-right">
                {projects.length}{" "}
                {projects.length === 1 ? "Project" : "Projects"}
              </p>
            </Reveal>
          </div>

          {projects.length > 0 && <ProjectIndex projects={projects} />}

          {projects.length === 0 && (
            <div className="py-24 border border-dashed border-white/[0.07] flex flex-col items-center justify-center gap-3">
              <p className="text-[9px] text-white/25 uppercase tracking-[0.26em]">
                Awaiting upload
              </p>
              <p className="text-sm text-white/35 font-light">
                Projects are being added.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Einzelne Projekt-Sections */}
      {projects.map((project, i) => (
        <ProjectShowcase
          key={project.id}
          project={project}
          index={i}
          total={projects.length}
          onOpenShot={(p, idx) => setLightbox({ project: p, index: idx })}
        />
      ))}

      {/* ══════════════════ ABOUT ══════════════════ */}
      <AboutSection />

      {/* ══════════════════ CONTACT ══════════════════ */}
      <section
        id="contact"
        className="relative py-32 md:py-56 overflow-hidden border-t border-white/[0.05]"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-[#0a0a0a]" />

        <div className="relative max-w-[1600px] mx-auto px-6 md:px-10 lg:px-16">
          <Reveal direction="up">
            <p className="text-[8px] text-white/22 uppercase tracking-[0.28em] mb-14">
              Contact
            </p>
          </Reveal>

          <h2
            className="font-display font-bold text-white leading-[0.9] mb-16"
            style={{ fontSize: "clamp(3rem, 10vw, 11rem)", letterSpacing: "-0.02em" }}
          >
            <SplitText text="Let's work" />
            <br />
            <span className="text-white/22">
              <SplitText text="together." delay={0.15} />
            </span>
          </h2>

          <Reveal direction="up" delay={0.1}>
            <a
              href="mailto:issam-selmi@outlook.com"
              className="group inline-flex items-baseline gap-4 mb-16 md:mb-24"
            >
              <span
                className="font-display font-medium text-white/75 group-hover:text-white transition-colors duration-300"
                style={{ fontSize: "clamp(1rem, 2.2vw, 1.6rem)" }}
              >
                issam-selmi@outlook.com
              </span>
              <motion.svg
                className="text-white/30 group-hover:text-white/65 transition-colors"
                width="16"
                height="16"
                viewBox="0 0 10 10"
                fill="none"
                whileHover={{ x: 3, y: -3 }}
              >
                <path
                  d="M1 9L9 1M9 1H3M9 1V7"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </motion.svg>
            </a>

            {CV_FILE && (
              <div className="flex justify-center mb-20 md:mb-28">
                <motion.a
                  href={CV_FILE}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="group relative inline-flex items-center justify-center gap-4 border border-white/20 hover:border-white/50 px-9 py-5 md:px-12 md:py-6 overflow-hidden transition-colors duration-500"
                >
                  {/* Fuellung faehrt beim Hovern von unten hoch */}
                  <span className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />

                  <motion.svg
                    width="17"
                    height="17"
                    viewBox="0 0 14 14"
                    fill="none"
                    className="relative text-white/60 group-hover:text-black transition-colors duration-500"
                  >
                    <path
                      d="M7 1v8m0 0L4 6m3 3l3-3M1 11v1a1 1 0 001 1h10a1 1 0 001-1v-1"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.svg>
                  <span className="relative text-[11px] md:text-xs uppercase tracking-[0.24em] text-white/75 group-hover:text-black font-medium transition-colors duration-500">
                    Download CV
                  </span>
                </motion.a>
              </div>
            )}

            <div className="w-full h-px bg-white/[0.07] mb-16" />

            <div className="flex flex-wrap items-center gap-10">
              {[
                {
                  label: "LinkedIn",
                  href: "https://www.linkedin.com/in/issam-selmi-6253241b9/",
                },
                { label: "GitHub", href: "https://github.com/WADAStube" },
              ].map(({ label, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="text-[11px] text-white/28 hover:text-white/70 uppercase tracking-[0.2em] transition-colors duration-200"
                >
                  {label}
                </motion.a>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-6">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-16 flex items-center justify-between">
          <p className="flex items-center gap-2.5 text-[9px] text-white/18 uppercase tracking-widest">
            <span className="inline-flex items-center justify-center h-4 w-4 border border-white/20 text-[7px] font-display font-bold text-white/40">
              W
            </span>
            © {new Date().getFullYear()} Issam Selmi · WADAS
          </p>
          <p className="text-[9px] text-white/14 uppercase tracking-wider">
            3D &amp; Game Art · Media Technology
          </p>
        </div>
      </footer>

      <Lightbox
        project={lightbox?.project ?? null}
        startIndex={lightbox?.index ?? 0}
        onClose={() => setLightbox(null)}
      />
    </div>
  );
}
