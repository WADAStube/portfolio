import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  animate,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { Boxes, Trophy, GraduationCap, Plane, Disc3, Activity, BookOpen, Anchor } from "lucide-react";
import {
  Reveal,
  SplitText,
  Stagger,
  StaggerItem,
  EASE,
  useIsSmallScreen,
} from "@/components/motion-primitives";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────
   Kapitel — als Zeitstrahl, anklickbar. Kein Fliesstext.
   Inhalte hier oben aendern, sonst nichts.
   ──────────────────────────────────────────────────────────── */
const CHAPTERS = [
  {
    id: "origin",
    icon: Boxes,
    kicker: "2007",
    title: "Where it started",
    body: "My cousin, a mechanical engineer, installed SolidWorks on my computer and showed me how to build an object from nothing. I was ten. I've been making things in 3D since.",
  },
  {
    id: "photoshop",
    icon: Trophy,
    kicker: "2011",
    title: "First competition",
    body: "A design competition in Photoshop CS5. Fourteen entries, second place, and a Sony Alpha NEX-3 as the prize. The camera is still in use.",
  },
  {
    id: "study",
    icon: BookOpen,
    kicker: "Since 2022",
    title: "Media Technology, Hochschule Emden/Leer",
    body: "Bachelor's degree, expected October 2027. The programme covers 3D design, modelling and animation alongside camera, audio and post-production. I've taken the elective modules toward 3D and real-time wherever they were offered, and hold the Computer-Aided Media Production certificate.",
  },
  {
    id: "uni",
    icon: Boxes,
    kicker: "University work",
    title: "Projects on the course",
    body: "Future!comeback — a cinematic scene with two characters in a lab environment, where I handled modelling, rigging, UV mapping, texturing, lighting and rendering. Alongside that: stream overlays and 3D animations for a student e-sports event, a media installation project for a school in Sukuta, Gambia, and the audiovisual production of a graduation ceremony in a team of eight.",
  },
  {
    id: "work",
    icon: Anchor,
    kicker: "Hamburg",
    title: "Alongside the degree",
    body: "Werkstudent in media technology at a company in Harburg: planning and producing photo, video and audio content, keeping the technical side running, and supporting marketing campaigns. Freelance since 2024 — 3D assets, interactive websites and apps, posters and flyers for local events.",
  },
  {
    id: "outside",
    icon: Activity,
    kicker: "Outside the screen",
    title: "The rest",
    body: "Ten years of Taekwondo, four years as captain of my school's basketball team, three half marathons. I hike and camp when the weather allows, travel when I can, and produce and play techno — a hobby since Berlin, kept deliberately separate from the work.",
  },
];

const STATS = [
  { value: "2007", label: "First 3D software" },
  { value: "2027", label: "Expected graduation" },
  { value: "4", label: "Languages" },
  { value: "10", label: "Years Taekwondo" },
];

/* ────────────────────────────────────────────────────────────
   CountUp — zaehlt beim Sichtbarwerden hoch.
   ──────────────────────────────────────────────────────────── */
function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();
  const mv = useMotionValue(0);
  const [shown, setShown] = useState(value);

  const target = Number(value);
  const numeric = !Number.isNaN(target);

  useEffect(() => {
    if (!numeric || !inView) return;
    if (reduced) {
      setShown(value);
      return;
    }
    const controls = animate(mv, target, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setShown(String(Math.round(v))),
    });
    return () => controls.stop();
  }, [inView, numeric, target, value, mv, reduced]);

  useEffect(() => {
    if (!numeric) return;
    if (!inView) setShown("0");
  }, [inView, numeric]);

  return <span ref={ref}>{numeric ? shown : value}</span>;
}

/* ────────────────────────────────────────────────────────────
   ChapterBlock — ein Abschnitt des Zeitstrahls.
   ──────────────────────────────────────────────────────────── */
function ChapterBlock({
  chapter,
  index,
}: {
  chapter: (typeof CHAPTERS)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduced = useReducedMotion();
  const small = useIsSmallScreen();
  const Icon = chapter.icon;

  return (
    <div
      ref={ref}
      className="relative grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-3 pl-9 md:pl-14 py-8 md:py-12"
    >
      <motion.span
        initial={{ scale: reduced ? 1 : 0.4, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: reduced ? 0.2 : 0.6, ease: EASE }}
        className="absolute left-0 top-9 md:top-[3.4rem] z-10 flex items-center justify-center h-[15px] w-[15px] md:h-[19px] md:w-[19px] rounded-full bg-white text-black"
      >
        <Icon size={9} />
      </motion.span>

      <motion.div
        initial={{ opacity: 0, x: reduced || small ? 0 : -34, y: reduced ? 0 : 18 }}
        animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
        transition={{ duration: reduced ? 0.2 : 0.9, ease: EASE }}
        className="md:col-span-5"
      >
        <p className="text-[8px] uppercase tracking-[0.24em] text-white/30 mb-2">
          {chapter.kicker}
        </p>
        <h3
          className="font-display font-medium text-white leading-snug"
          style={{ fontSize: "clamp(1.15rem, 2vw, 1.6rem)" }}
        >
          {chapter.title}
        </h3>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: reduced || small ? 0 : 40, y: reduced ? 0 : 18 }}
        animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
        transition={{ duration: reduced ? 0.2 : 0.9, ease: EASE, delay: reduced ? 0 : 0.12 }}
        className="md:col-span-7"
      >
        <p className="text-sm md:text-[0.95rem] font-light leading-[1.95] text-white/50">
          {chapter.body}
        </p>
        <motion.span
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: reduced ? 0.2 : 1.1, ease: EASE, delay: reduced ? 0 : 0.3 }}
          className="mt-6 block h-px w-full max-w-md origin-left bg-white/[0.08]"
        />
      </motion.div>
    </div>
  );
}

export function AboutSection() {
  const portraitRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const small = useIsSmallScreen();

  const { scrollYProgress } = useScroll({
    target: portraitRef,
    offset: ["start end", "end start"],
  });
  const rawY = useTransform(
    scrollYProgress,
    [0, 1],
    reduced || small ? [0, 0] : [70, -70],
  );
  const py = useSpring(rawY, { stiffness: 100, damping: 30, mass: 0.5 });

  /* Fortschritt der Zeitstrahl-Linie */
  const { scrollYProgress: tlProgress } = useScroll({
    target: timelineRef,
    offset: ["start 65%", "end 65%"],
  });
  const lineProgress = useSpring(tlProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.35,
  });

  return (
    <section
      id="about"
      className="relative overflow-x-clip py-24 md:py-40 bg-[#050505] border-t border-white/[0.05]"
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-16">
        <Reveal direction="up">
          <p className="text-[8px] text-white/22 uppercase tracking-[0.28em] mb-10 md:mb-16">
            About
          </p>
        </Reveal>

        {/* ── Kopfzeile: Portrait + Statement ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 mb-20 md:mb-28">
          {/* Portrait */}
          <div ref={portraitRef} className="lg:col-span-5">
            <motion.div style={{ y: reduced ? 0 : py }}>
              <motion.div
                initial={{ opacity: 0, scale: reduced ? 1 : 1.04 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: reduced ? 0.2 : 1.2, ease: EASE }}
                className="relative overflow-hidden ring-1 ring-white/[0.08] group"
                style={{ aspectRatio: "4 / 5" }}
              >
                <img
                  src="/images/portrait.jpg"
                  alt="Issam Selmi"
                  className={cn(
                    "w-full h-full object-cover object-center",
                    "grayscale group-hover:grayscale-0",
                    "scale-100 group-hover:scale-[1.04]",
                    "transition-[filter,transform] duration-[900ms] ease-out",
                  )}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
                  <div>
                    <p className="font-display font-bold text-white text-lg leading-tight">
                      Issam Selmi
                    </p>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/50 mt-1">
                      3D &amp; Game Art · Media Technology
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Statement */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <blockquote
              className="font-display font-bold text-white leading-[1.15] mb-8"
              style={{
                fontSize: "clamp(1.5rem, 3.2vw, 2.6rem)",
                letterSpacing: "-0.015em",
              }}
            >
              <SplitText text="I build environments" />
              <br />
              <span className="text-white/35">
                <SplitText text="and characters in 3D." delay={0.22} />
              </span>
            </blockquote>

            <Reveal direction="up" delay={0.1}>
              <p className="text-sm font-light leading-[1.95] text-white/45 max-w-xl">
                Media Technology student at Hochschule Emden/Leer, based in
                Hamburg, where I also work as a Werkstudent in media
                technology. My focus is 3D — environments, characters, game
                assets, and the texturing and lighting that make them read.
                Alongside that: graphic design, and applications I design and
                build myself. I work in Arabic, German, English and French.
              </p>
            </Reveal>

            {/* Zahlen */}
            <Stagger
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-12 pt-10 border-t border-white/[0.07]"
              gap={0.08}
            >
              {STATS.map((s) => (
                <StaggerItem key={s.label}>
                  <p
                    className="font-display font-bold text-white leading-none tabular-nums"
                    style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)" }}
                  >
                    <CountUp value={s.value} />
                  </p>
                  <p className="mt-2 text-[8px] uppercase tracking-[0.2em] text-white/28">
                    {s.label}
                  </p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>

        {/* ── Zeitstrahl ── beim Scrollen, ohne Klick ── */}
        <Reveal direction="up">
          <p className="text-[8px] text-white/22 uppercase tracking-[0.28em] mb-12">
            Background
          </p>
        </Reveal>

        <div ref={timelineRef} className="relative">
          {/* Ruhende Linie */}
          <span
            aria-hidden="true"
            className="absolute left-[7px] md:left-[9px] top-2 bottom-2 w-px bg-white/[0.08]"
          />
          {/* Linie faellt mit dem Scrollen */}
          <motion.span
            aria-hidden="true"
            style={{ scaleY: lineProgress }}
            className="absolute left-[7px] md:left-[9px] top-2 bottom-2 w-px bg-white/45 origin-top"
          />

          <div className="flex flex-col">
            {CHAPTERS.map((c, i) => (
              <ChapterBlock key={c.id} chapter={c} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
