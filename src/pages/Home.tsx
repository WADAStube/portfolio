import { useState, useEffect, useRef } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Link } from "wouter";
import { Navbar } from "@/components/navbar";
import {
  Grain,
  Cursor,
  ContactSection,
  SiteFooter,
  usePageMeta,
} from "@/components/site-chrome";
import { ProjectCard } from "@/components/project-card";
import { Reveal, EASE, useIsSmallScreen } from "@/components/motion-primitives";
import { ENTRIES, FIELDS, MINOR, STACK, type Bi } from "@/data/portfolio";
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

/* In zehn Sekunden: was er studiert, wo, wann es fertig ist, wo
   er wohnt, woran er arbeitet und was er sucht. Hochschule und
   Wohnort stehen getrennt — studiert wird in Emden, gewohnt in
   Hamburg. */
const FACTS: { k: Bi; v: Bi }[] = [
  {
    k: { en: "Degree", de: "Studium" },
    v: {
      en: "Media Technology, Bachelor of Engineering (in progress), Hochschule Emden/Leer, Emden",
      de: "Medientechnik, Bachelor of Engineering (in Arbeit), Hochschule Emden/Leer, Emden",
    },
  },
  {
    k: { en: "Expected graduation", de: "Abschluss" },
    v: { en: "October 2027", de: "voraussichtlich Oktober 2027" },
  },
  {
    k: { en: "Based in", de: "Wohnort" },
    v: {
      en: "Hamburg. In Emden for on-site classes, exams and projects.",
      de: "Hamburg. In Emden für Präsenztermine, Prüfungen und Projekte.",
    },
  },
  {
    k: { en: "Fields", de: "Arbeitsfelder" },
    v: {
      en: "3D and game art, real-time scenes in Unity, app and web development, media production",
      de: "3D und Game Art, Echtzeit-Szenen in Unity, App- und Web-Entwicklung, Medienproduktion",
    },
  },
  {
    k: { en: "Currently", de: "Zurzeit" },
    v: {
      en: "Working student in media technology in Hamburg-Harburg, freelance since 2024",
      de: "Werkstudent in der Medientechnik in Hamburg-Harburg, seit 2024 außerdem freiberuflich",
    },
  },
  {
    k: { en: "Looking for", de: "Gesucht" },
    v: {
      en: "A mandatory internship (Pflichtpraktikum). Open to a working-student position.",
      de: "Ein Pflichtpraktikum. Offen für eine Werkstudentenstelle.",
    },
  },
];
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
          <p className="mt-4 font-mono text-[10px] tabular-nums text-white/52">
            {String(pct).padStart(3, "0")}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


/* ──────────────────────── Marquee strip ────────────────────── */
function Marquee() {
  const items = [...MARQUEE, ...MARQUEE];
  return (
    <div className="mq-wrap border-y border-white/[0.05] py-6 md:py-8">
      <div className="mq-track">
        {items.map((t, i) => (
          <span
            key={i}
            className="mq-item inline-flex items-center gap-6 md:gap-9 px-6 md:px-9 text-[13px] md:text-[15px] font-light tracking-[0.02em] text-white/52 whitespace-nowrap"
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
/* ─────────────── Abschnittskopf ─────────────── */
function SectionHead({ kicker, title, to, more }: { kicker: string; title: string; to?: string; more?: string }) {
  return (
    <div className="flex items-end justify-between gap-8 mb-10 md:mb-14">
      <div>
        <Reveal direction="up" duration={0.8}>
          <p className="text-[9px] text-white/48 uppercase tracking-[0.28em] mb-4">{kicker}</p>
        </Reveal>
        <Reveal direction="up" duration={0.9}>
          <h2
            className="font-display font-bold leading-[1.02]"
            style={{ fontSize: "clamp(1.9rem, 4.6vw, 3.8rem)", letterSpacing: "-0.02em" }}
          >
            {title}
          </h2>
        </Reveal>
      </div>
      {to && more && (
        <Link href={to}>
          <a className="hidden md:inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-white/62 hover:text-white transition-colors duration-300 pb-2">
            {more} <span aria-hidden="true">→</span>
          </a>
        </Link>
      )}
    </div>
  );
}

/* ─────────────────────────── Home ──────────────────────────── */
export default function Home() {
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


  const { lang } = useLang();
  const featured = ENTRIES.filter((e) => e.home).sort((a, b) => a.home! - b.home!);
  usePageMeta(
    "3D Artist & Creative Developer",
    lang === "de"
      ? "Issam Selmi: 3D-Umgebungen und Charaktere, Echtzeit-Szenen in Unity, Apps und Web-Anwendungen. Medientechnik (B.Eng. in Arbeit) an der Hochschule Emden/Leer, Wohnort Hamburg."
      : "Issam Selmi: 3D environments and characters, real-time scenes in Unity, apps and web applications. Media Technology (B.Eng. in progress) at Hochschule Emden/Leer, based in Hamburg.",
  );
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="bg-background min-h-screen text-foreground selection:bg-white/20">
      <Loader onDone={() => setLoaded(true)} />
      <Grain />
      <Cursor />
      <Navbar />

      {/* ══════════════════ HERO ══════════════════ */}
      <section ref={heroRef} id="top" className="relative h-svh overflow-hidden">
        <div className="absolute inset-0">
          {/* Das Bild ist 16:9. Formatfuellend auf einem
              Hochformat-Handy fiele der halbe Bildausschnitt weg,
              darunter die Huette. Mobil laeuft es daher als
              4:3-Band mit massvollem Beschnitt, ab md
              formatfuellend. Bildausschnitt rechtsbetont, damit
              die Huette nicht unter dem Namen verschwindet. */}
          <div className="absolute inset-x-0 top-[17%] aspect-[4/3] overflow-hidden md:inset-0 md:top-0 md:aspect-auto">
            <motion.img
              src="/images/hero.jpg"
              alt=""
              aria-hidden="true"
              fetchPriority="high"
              decoding="async"
              style={{
                scale: reduced ? 1 : videoScale,
                y: reduced ? 0 : videoY,
                backgroundImage: "url(/images/hero-small.jpg)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              className="w-full h-full object-cover object-[70%_center] md:object-center origin-center will-change-transform"
            />
          </div>

          <motion.div
            className="absolute inset-0 bg-black"
            style={{ opacity: overlayOpacity }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-[42%] bg-gradient-to-t from-black via-black/55 to-transparent" />
          <div className="absolute inset-y-0 left-0 w-[55%] bg-gradient-to-r from-black/70 via-black/20 to-transparent md:w-[45%]" />
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
                className="text-[9px] text-white/52 uppercase tracking-[0.28em] mb-4"
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
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: EASE, delay: loaded ? 0.5 : 1.6 }}
                className="mt-5 md:mt-7 max-w-xl text-sm md:text-base font-light leading-[1.7] text-white/70"
              >
                {t("heroLine", lang)}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: EASE, delay: loaded ? 0.45 : 1.55 }}
              className="flex flex-col items-start md:items-end gap-4 md:pb-2"
            >
              <p className="flex flex-col items-start md:items-end text-sm md:text-base font-normal text-white/90 uppercase tracking-[0.2em] md:text-right">
                {t("role", lang)
                  .split(" · ")
                  .map((part) => (
                    <span key={part} className="whitespace-nowrap">
                      {part}
                    </span>
                  ))}
              </p>
              <p className="flex flex-wrap gap-x-2 md:justify-end text-[10px] md:text-[11px] font-light leading-[1.9] text-white/70 uppercase tracking-[0.16em] -mt-1 max-w-[22rem] md:text-right">
                {t("roleSub", lang)
                  .split(" · ")
                  .map((part, i, all) => (
                    <span key={part} className="whitespace-nowrap">
                      {part}
                      {i < all.length - 1 && <span className="ml-2 text-white/35">·</span>}
                    </span>
                  ))}
              </p>
              <div className="flex items-center gap-2">
                <span className="h-[5px] w-[5px] rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] text-white/52 uppercase tracking-[0.18em]">
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
                className="text-[10px] text-white/48 uppercase tracking-[0.22em] hover:text-white/70 transition-colors duration-300 flex items-center gap-2 mt-2 -mx-2 px-2 py-3 md:py-2"
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
          <span className="text-[8px] text-white/45 uppercase tracking-[0.34em] rotate-180">
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
            className="text-white/45"
          >
            <ArrowDown size={14} />
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════ MARQUEE ══════════════════ */}
      <Marquee />

      {/* ══════════════════ AUF EINEN BLICK ══════════════════ */}
      <section id="work" className="border-b border-white/[0.05]">
        <dl className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {FACTS.map((f, i) => (
            <div
              key={f.k.en}
              className={cn(
                "py-7 md:py-9 lg:pr-10 border-white/[0.06]",
                i > 0 && "border-t sm:border-t-0",
                i > 1 && "sm:border-t",
                i > 2 && "lg:border-t",
                i % 2 === 1 && "sm:pl-10 lg:pl-0",
                i % 3 !== 0 && "lg:pl-10 lg:border-l",
              )}
            >
              <dt className="text-[9px] uppercase tracking-[0.26em] text-white/48 mb-3">{f.k[lang]}</dt>
              <dd className="text-sm font-light leading-[1.75] text-white/75">{f.v[lang]}</dd>
            </div>
          ))}
        </dl>

        {/* Womit gearbeitet wird. Drei Gruppen, jede mit einem Satz
            dazu — eine Reihe aus zwanzig Namen sagt nichts aus.
            Vollständig steht es unter /engineering. */}
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-16 border-t border-white/[0.06] py-10 md:py-14">
          <p className="text-[9px] uppercase tracking-[0.26em] text-white/48 mb-8">
            {t("stackTitle", lang)}
          </p>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-10">
            {STACK.map((g) => (
              <div key={g.group.en}>
                <dt className="text-[10px] uppercase tracking-[0.2em] text-white/70 mb-3">
                  {g.group[lang]}
                </dt>
                <dd>
                  <p className="mb-4 text-[12.5px] font-light leading-[1.8] text-white/55">
                    {g.note[lang]}
                  </p>
                  <ul className="flex flex-wrap gap-1.5">
                    {g.items.map((it) => (
                      <li
                        key={it}
                        className="border border-white/[0.14] px-2.5 py-1.5 font-mono text-[10px] tracking-[0.04em] text-white/70"
                      >
                        {it}
                      </li>
                    ))}
                    {g.early?.map((it) => (
                      <li
                        key={it}
                        title={t("stackEarly", lang)}
                        className="border border-dashed border-white/[0.14] px-2.5 py-1.5 font-mono text-[10px] tracking-[0.04em] text-white/45"
                      >
                        {it}
                      </li>
                    ))}
                  </ul>
                  {g.early?.length ? (
                    <p className="mt-3 text-[10px] text-white/40">
                      {lang === "de"
                        ? "Gestrichelt: erste Erfahrungen."
                        : "Dashed: first experience."}
                    </p>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ══════════════════ AUSGEWAEHLTE PROJEKTE ══════════════════ */}
      <section className="pt-20 md:pt-28 pb-20 md:pb-28">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-16">
          <SectionHead
            kicker={t("portfolio", lang)}
            title={lang === "de" ? "Ausgewählte Projekte" : "Selected projects"}
            to="/projects"
            more={t("allProjects", lang)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-16 md:gap-y-24">
            {featured.map((e, i) => (
              <ProjectCard key={e.project.id} entry={e} large eager={i < 2} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ FACHRICHTUNGEN ══════════════════ */}
      <section className="border-t border-white/[0.05] py-20 md:py-28">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-16">
          <SectionHead
            kicker={t("projects", lang)}
            title={lang === "de" ? "Nach Fachrichtung" : "By field"}
          />
          <ul className="border-t border-white/[0.07]">
            {FIELDS.map((f) => {
              const n =
                ENTRIES.filter((e) => e.fields.includes(f.id)).length +
                MINOR.filter((m) => m.fields.includes(f.id)).length;
              return (
                <li key={f.id} className="border-b border-white/[0.07]">
                  <Link href={`/projects?focus=${f.id}`}>
                    <a className="group grid grid-cols-12 items-baseline gap-x-6 gap-y-2 py-7 md:py-9 hover:bg-white/[0.015] transition-colors duration-300">
                      <span
                        className="col-span-10 md:col-span-5 font-display font-medium text-white/80 group-hover:text-white transition-colors duration-300 leading-tight"
                        style={{ fontSize: "clamp(1.25rem, 2.4vw, 2rem)" }}
                      >
                        {f.label[lang]}
                      </span>
                      <span className="col-span-2 md:col-span-1 md:order-last text-right font-mono text-[11px] text-white/48 tabular-nums">
                        {String(n).padStart(2, "0")}
                      </span>
                      <span className="col-span-12 md:col-span-6 text-sm font-light leading-[1.75] text-white/62">
                        {f.sub[lang]}
                      </span>
                    </a>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ══════════════════ STUDIUM + PERSON ══════════════════ */}
      <section className="border-t border-white/[0.05] bg-[#050505]">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-16 grid grid-cols-1 md:grid-cols-2">
          {[
            {
              to: "/engineering",
              k: "Engineering & Expertise",
              h: lang === "de" ? "Was das Studium abdeckt und was ich davon angewendet habe" : "What the degree covers and what I have applied",
              p:
                lang === "de"
                  ? "Informatik, Nachrichtentechnik, Studio und Produktion. Getrennt nach Lehrinhalt, Projekten und Werkzeugen."
                  : "Computer science, communications engineering, studio and production. Split into taught content, projects and tools.",
            },
            {
              to: "/about",
              k: t("about", lang),
              h: lang === "de" ? "Wer hinter den Projekten steht" : "Who is behind the projects",
              p:
                lang === "de"
                  ? "Werdegang, Arbeit neben dem Studium, Ehrenamt, Sprachen und was außerhalb des Bildschirms passiert."
                  : "Background, work alongside the degree, volunteering, languages and what happens away from the screen.",
            },
          ].map((c, i) => (
            <Link key={c.to} href={c.to}>
              <a
                className={cn(
                  "group block py-14 md:py-24 border-white/[0.06]",
                  i === 0 ? "md:pr-14 border-b md:border-b-0 md:border-r" : "md:pl-14",
                )}
              >
                <p className="text-[9px] uppercase tracking-[0.28em] text-white/48 mb-5">{c.k}</p>
                <h2
                  className="font-display font-bold text-white/85 group-hover:text-white transition-colors duration-300 leading-[1.1] max-w-lg"
                  style={{ fontSize: "clamp(1.4rem, 2.6vw, 2.2rem)", letterSpacing: "-0.02em" }}
                >
                  {c.h}
                </h2>
                <p className="mt-5 text-sm font-light leading-[1.8] text-white/62 max-w-md">{c.p}</p>
                <span className="mt-8 inline-block text-white/52 group-hover:text-white transition-colors duration-300" aria-hidden="true">
                  →
                </span>
              </a>
            </Link>
          ))}
        </div>
      </section>

      <ContactSection />
      <SiteFooter />
    </div>
  );
}
