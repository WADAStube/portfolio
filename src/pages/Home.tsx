import { useState, useEffect, useRef } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { Volume2, VolumeX, ArrowDown } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/navbar";
import {
  CV_FILE,
  Grain,
  Cursor,
  StretchOnScroll,
  OtherPages,
  ContactSection,
  SiteFooter,
} from "@/components/site-chrome";
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
  Magnetic,
} from "@/components/motion-primitives";
import { projectsData } from "@/data/projects";
import type { Project } from "@/data/projects";
import { useAmbientSound } from "@/hooks/useAmbientSound";
import { cn } from "@/lib/utils";
import { useLang, t } from "@/lib/lang";

/* ─────────────────────── static data ───────────────────────── */


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

/* ──────── Ueberschrift zieht sich beim Scrollen in Form ────── */
/* ─────────────────────── Loader ─────────────────────────────── */
function Loader({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);
  const [gone, setGone] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setGone(true);
      onDone();
      return;
    }
    const start = performance.now();
    const DUR = 900;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / DUR);
      setPct(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setTimeout(() => {
          setGone(true);
          onDone();
        }, 180);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone, reduced]);

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: EASE }}
          className="fixed inset-0 z-[99998] bg-[#080808] flex flex-col items-center justify-center"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center justify-center h-8 w-8 border border-white/30">
              <span className="font-display font-bold text-[13px] text-white/80">
                W
              </span>
            </span>
            <span className="font-display font-bold text-lg tracking-tight text-white">
              WADAS
            </span>
          </div>

          <div className="relative h-px w-40 bg-white/12 overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-white/70"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-4 font-mono text-[10px] tabular-nums text-white/35">
            {String(pct).padStart(3, "0")}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


/* ─────────────────────── Custom cursor ─────────────────────── */
/* ──────────────────────── Marquee strip ────────────────────── */
function Marquee() {
  const items = [...MARQUEE, ...MARQUEE];
  return (
    <div className="mq-wrap border-y border-white/[0.05] py-6 md:py-8">
      <div className="mq-track">
        {items.map((t, i) => (
          <span
            key={i}
            className="mq-item inline-flex items-center gap-6 md:gap-9 px-6 md:px-9 text-[13px] md:text-[15px] font-light tracking-[0.02em] text-white/35 whitespace-nowrap"
          >
            {t}
            <span className="h-1 w-1 rounded-full bg-white/15 shrink-0" />
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

/* ─────────────── Projekt-Index ────────────────────────────── */
/* Die Werkuebersicht laeuft in zwei Bereichen: zuerst 3D und
   Game Art, danach alles andere. Beide Bereiche zaehlen eigen —
   eine durchlaufende Nummer wuerde die Trennung wieder aufheben. */
function ProjectIndex({ projects }: { projects: Project[] }) {
  const { lang } = useLang();
  const three = projects.filter((p) => (p.group ?? "3d") === "3d");
  const apps = projects.filter((p) => p.group === "apps");
  const design = projects.filter((p) => p.group === "design");

  return (
    <div className="space-y-16 md:space-y-24">
      <IndexGroup
        projects={three}
        title={t("group3d", lang)}
        sub={t("group3dSub", lang)}
      />
      {apps.length > 0 && (
        <IndexGroup
          projects={apps}
          title={t("groupApps", lang)}
          sub={t("groupAppsSub", lang)}
          to="/apps"
        />
      )}
      {design.length > 0 && (
        <IndexGroup
          projects={design}
          title={t("groupDesign", lang)}
          sub={t("groupDesignSub", lang)}
          to="/design"
        />
      )}
    </div>
  );
}

function IndexGroup({
  projects,
  title,
  sub,
  to,
}: {
  projects: Project[];
  title: string;
  sub: string;
  /* Liegt die Gruppe auf einer eigenen Seite, fuehren
     Ueberschrift und Zeilen dorthin statt zu einem Anker. */
  to?: string;
}) {
  const { lang } = useLang();
  const [, navigate] = useLocation();
  const jump = (id: string) => {
    if (to) {
      navigate(to);
      window.scrollTo({ top: 0 });
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      <Reveal direction="up" duration={0.85}>
        <div className="flex items-baseline gap-5 mb-5">
          {to ? (
            <Link href={to}>
              <a className="font-display font-medium text-white/85 hover:text-white text-base md:text-lg tracking-tight shrink-0 transition-colors duration-300">
                {title}
              </a>
            </Link>
          ) : (
          <h3 className="font-display font-medium text-white/85 text-base md:text-lg tracking-tight shrink-0">
            {title}
          </h3>
          )}
          <span className="h-px flex-1 bg-white/[0.09]" />
          <span className="font-mono text-[10px] text-white/22 tabular-nums shrink-0">
            {String(projects.length).padStart(2, "0")}
          </span>
        </div>
        <p className="text-[11px] font-light leading-relaxed text-white/28 mb-7 max-w-xl">
          {sub}
        </p>
      </Reveal>

      <Stagger className="border-t border-white/[0.06]" gap={0.05}>
      {projects.map((p, i) => (
        <StaggerItem key={p.id} distance={16}>
          {/* Projekte ohne Inhalt stehen nur in der Liste. Sie
              bekommen weiter unten keine Section, also auch kein
              Sprungziel — ein Klick ins Leere waere schlechter
              als gar kein Klick. */}
          {(() => {
            const empty = !!p.comingSoon;
            const Tag = empty ? "div" : "button";
            return (
          <Tag
            onClick={empty ? undefined : () => jump(p.id)}
            className={cn(
              "group w-full flex items-baseline gap-5 md:gap-8 py-5 border-b border-white/[0.06] text-left transition-colors duration-300",
              empty ? "cursor-default" : "hover:bg-white/[0.015]",
            )}
          >
            <span className="font-mono text-[10px] text-white/25 tabular-nums shrink-0">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className={cn(
              "font-display font-medium text-lg md:text-2xl transition-colors duration-300 flex-1 min-w-0 truncate",
              p.comingSoon ? "text-white/35" : "text-white/65 group-hover:text-white",
            )}>
              {p.title}
            </span>
            <span className="hidden md:block text-[9px] uppercase tracking-[0.2em] text-white/25 shrink-0">
              {p.comingSoon ? t("comingSoon", lang) : p.tools.slice(0, 2).join(" · ")}
            </span>
            <span
              className={cn(
                "shrink-0 transition-colors duration-300",
                empty
                  ? "text-white/10"
                  : "text-white/25 group-hover:text-white/70",
              )}
            >
              {empty ? (
                <span className="block h-px w-[11px] bg-current" />
              ) : (
                <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M1 9L9 1M9 1H3M9 1V7"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                </svg>
              )}
            </span>
          </Tag>
            );
          })()}
        </StaggerItem>
      ))}
      </Stagger>
    </div>
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

  const { lang } = useLang();
  const projects = projectsData;
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="bg-background min-h-screen text-foreground selection:bg-white/20">
      <Loader onDone={() => setLoaded(true)} />
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
                transition={{ duration: 1, ease: EASE, delay: loaded ? 0.1 : 1.2 }}
                className="text-[9px] text-white/35 uppercase tracking-[0.28em] mb-4"
              >
                {t("portfolioYear", lang)}
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
                    transition={{ duration: 1.2, ease: EASE, delay: loaded ? 0.2 : 1.3 }}
                  >
                    Issam
                  </motion.span>
                </span>{" "}
                <span className="inline-block overflow-hidden align-bottom">
                  <motion.span
                    className="inline-block"
                    initial={{ y: "105%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 1.2, ease: EASE, delay: loaded ? 0.3 : 1.4 }}
                  >
                    Selmi
                  </motion.span>
                </span>
              </h1>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: EASE, delay: loaded ? 0.45 : 1.55 }}
              className="flex flex-col items-start md:items-end gap-4 md:pb-2"
            >
              <p className="text-sm md:text-base font-light text-white/50 uppercase tracking-[0.22em]">
                {t("role", lang)}
              </p>
              <p className="text-[9px] font-light text-white/30 uppercase tracking-[0.2em] -mt-2">
                {t("roleSub", lang)}
              </p>
              <div className="flex items-center gap-2">
                <span className="h-[5px] w-[5px] rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] text-white/35 uppercase tracking-[0.18em]">
                  {t("based", lang)}
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
                {t("viewWork", lang)}
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
                  {t("selectedWork", lang)}
                </p>
              </Reveal>
              <StretchOnScroll>
                <h2
                  className="font-display font-bold leading-none"
                  style={{
                    fontSize: "clamp(2rem, 6vw, 5rem)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  <SplitText key={lang} text={t("portfolio", lang)} />
                </h2>
              </StretchOnScroll>
            </div>
            <Reveal direction="up" delay={0.15}>
              <p className="text-[9px] text-white/22 uppercase tracking-[0.22em] hidden md:block text-right">
                {projects.length}{" "}
                {t("projects", lang)}
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

      {/* Einzelne Projekt-Sections. Projekte ohne Inhalt stehen
          nur in der Liste oben und tauchen hier nicht mehr auf —
          sonst scrollt man durch eine Reihe leerer Ueberschriften.
          Vor dem ersten Projekt des zweiten Bereichs steht ein
          Trennband. */}
      {projects
        .filter((p) => (p.group ?? "3d") === "3d" && !p.comingSoon)
        .map((project, i, shown) => (
          <ProjectShowcase
            key={project.id}
            project={project}
            index={i}
            total={shown.length}
            onOpenShot={(p, idx) => setLightbox({ project: p, index: idx })}
          />
        ))}

      {/* Weiter zu den anderen Bereichen */}
      <OtherPages exclude="3d" />

      {/* ══════════════════ ABOUT ══════════════════ */}
      <AboutSection />

      <ContactSection />
      <SiteFooter />

      <Lightbox
        project={lightbox?.project ?? null}
        startIndex={lightbox?.index ?? 0}
        onClose={() => setLightbox(null)}
      />
    </div>
  );
}
