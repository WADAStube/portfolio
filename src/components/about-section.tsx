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
import { Boxes, GraduationCap, Plane, Disc3, Activity, BookOpen, Anchor } from "lucide-react";
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
    kicker: "2007 — Tunisia",
    title: "It started with one sentence",
    body: "My cousin, a mechanical engineer, installed SolidWorks on my computer and said: with this you can build things that don't exist yet. I was a kid. I didn't understand half the interface — but I understood that sentence, and I've been building ever since. Everything on this page traces back to that afternoon.",
  },
  {
    id: "start",
    icon: GraduationCap,
    kicker: "2015 — Tunisia",
    title: "I chose the long way on purpose",
    body: "Abitur done, university waiting. I decided the world came first. Not a gap year — a proper look at how people live, think and build in places that aren't yours. Best decision I've made.",
  },
  {
    id: "berlin",
    icon: Disc3,
    kicker: "2016 — Berlin, age 19",
    title: "Techno got me to Germany",
    body: "Three reasons brought me here: study, independence, and above all the music. Berlin was where techno came from, so Berlin is where I went. I learned the language, and in 2017 I played my first set. It stays a hobby by choice — the thing I do purely because I want to.",
  },
  {
    id: "road",
    icon: Plane,
    kicker: "2017 – 2022",
    title: "Four continents, eighteen countries",
    body: "Five years on the move, and I kept moving when most people stopped. Languages, kitchens, night buses, borders that opened for a week. What you bring back isn't photographs — it's the ability to read a room anywhere and start from scratch without flinching.",
  },
  {
    id: "body",
    icon: Activity,
    kicker: "Ten years and counting",
    title: "Discipline I can point to",
    body: "Ten years of Taekwondo. Four years as captain of my school's basketball team. Three half marathons. Camping and hiking whenever the weather allows. Show up, repeat the boring part, and one day the hard thing is easy — which is exactly how modelling and retopology work.",
  },
  {
    id: "study",
    icon: BookOpen,
    kicker: "2022 — Emden",
    title: "Media Technology, on my terms",
    body: "I started my Medientechnik degree when I was ready for it, not when it was expected. It's the field where 3D, game design, code and image share one room. Fifteen years after SolidWorks, I was finally studying the thing properly — and I knew exactly why I was there.",
  },
  {
    id: "hamburg",
    icon: Anchor,
    kicker: "Hamburg — today",
    title: "This is where I build",
    body: "Hamburg has red brick, water through the middle of it, harbour light, and a warmth Berlin never had. I moved here for the city and for a Werkstudent role in media technology, to learn the work from the inside. The travelling gave me everything I needed. Now I'm here, and I'm building.",
  },
];

const STATS = [
  { value: "2007", label: "First 3D software" },
  { value: "18", label: "Countries" },
  { value: "4", label: "Continents" },
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
   Erscheint beim Scrollen von selbst, nichts zum Anklicken.
   ──────────────────────────────────────────────────────────── */
function ChapterBlock({
  chapter,
  index,
}: {
  chapter: (typeof CHAPTERS)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.45 });
  const reduced = useReducedMotion();
  const Icon = chapter.icon;

  return (
    <div
      ref={ref}
      className="relative grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-3 pl-9 md:pl-14 py-8 md:py-12"
    >
      {/* Punkt auf der Linie */}
      <motion.span
        initial={{ scale: reduced ? 1 : 0.4, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: reduced ? 0.2 : 0.6, ease: EASE }}
        className="absolute left-0 top-9 md:top-[3.4rem] z-10 flex items-center justify-center h-[15px] w-[15px] md:h-[19px] md:w-[19px] rounded-full bg-white text-black"
      >
        <Icon size={9} />
      </motion.span>

      {/* Zeit + Titel */}
      <motion.div
        initial={{ opacity: 0, y: reduced ? 0 : 26 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: reduced ? 0.2 : 0.85, ease: EASE }}
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

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: reduced ? 0 : 26 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{
          duration: reduced ? 0.2 : 0.85,
          ease: EASE,
          delay: reduced ? 0 : 0.14,
        }}
        className="md:col-span-7"
      >
        <p className="text-sm md:text-[0.95rem] font-light leading-[1.95] text-white/50">
          {chapter.body}
        </p>
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
      className="relative py-24 md:py-40 bg-[#050505] border-t border-white/[0.05]"
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
              <SplitText text="I took the long way here." />
              <br />
              <span className="text-white/35">
                <SplitText text="It's exactly why I'm good at this." delay={0.22} />
              </span>
            </blockquote>

            <Reveal direction="up" delay={0.1}>
              <p className="text-sm font-light leading-[1.95] text-white/45 max-w-xl">
                29, Tunisian, based in Hamburg. I build in 3D — environments,
                characters, game assets, and the textures and layouts that
                make them read. It started with a piece of CAD software in
                2007 and never let go. Eighteen countries, ten years of
                martial arts and a decade behind the decks all feed the same
                work. I speak Arabic, German, English and French, and I'm
                at my best on projects that need all of it at once.
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
            The long version
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
