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
  AnimatePresence,
} from "framer-motion";
import { Boxes, GraduationCap, Plane, Disc3, Activity, BookOpen, Anchor } from "lucide-react";
import {
  Reveal,
  Stagger,
  StaggerItem,
  SplitText,
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
    title: "A cousin, a CD, and SolidWorks",
    body: "My cousin was a mechanical engineer. One afternoon he installed SolidWorks on my computer and said: with this you can build objects that don't exist yet. I was a kid. I didn't understand half the interface, but I understood that sentence completely — and I've been chasing it ever since. Everything on this page started that day.",
  },
  {
    id: "start",
    icon: GraduationCap,
    kicker: "2015 — Tunisia",
    title: "Abitur, and then a decision",
    body: "I finished school and everyone assumed university would start the following autumn. I didn't want to walk out of one classroom straight into the next without having seen anything of the world first. So I decided to wait — not for a summer, but for as long as it took.",
  },
  {
    id: "berlin",
    icon: Disc3,
    kicker: "2016 — Berlin, age 19",
    title: "Germany, starting with the language",
    body: "I came for three reasons: to study, to grow up a bit, and — the strongest pull of the three — for techno. Berlin was where that music came from. The first job was learning German properly. In 2017 I played my first set. I've kept it a hobby on purpose; it's the thing I do because I want to, not because it has to pay.",
  },
  {
    id: "road",
    icon: Plane,
    kicker: "2017 – 2022",
    title: "Four continents, eighteen countries",
    body: "Five years mostly on the move. Covid was supposed to end that, and for most people it did — I just kept finding a way. A flight that still ran, a car, a border that happened to be open that week. Languages, kitchens, night buses, people who see the world at a completely different angle than you do. I wasn't collecting stamps. I was collecting perspectives, and that's the part you can't learn from a screen.",
  },
  {
    id: "body",
    icon: Activity,
    kicker: "Ten years and counting",
    title: "Sport kept the structure",
    body: "Ten years of Taekwondo, four years as captain of my school's basketball team, three half marathons so far. Camping and hiking whenever the weather allows. All of it teaches the same lesson: show up, repeat the boring part, and one day the hard thing is easy. That transfers straight into modelling and retopology.",
  },
  {
    id: "study",
    icon: BookOpen,
    kicker: "2022 — Emden",
    title: "Media Technology, finally",
    body: "When the pandemic finally loosened its grip, something had settled. I'd seen what I wanted to see and I was ready to sit still and get good at something. Medientechnik in Emden was the answer — the degree where 3D, game design, code and image all live in the same room. Fifteen years after SolidWorks, I was finally studying the thing properly.",
  },
  {
    id: "hamburg",
    icon: Anchor,
    kicker: "Hamburg — today",
    title: "The city I'm staying in",
    body: "Four months ago I moved to Hamburg. Partly for the city — red brick, water running through the middle of it, harbour light, and a warmth Berlin never quite had. Partly because most of what's left of my degree is project work I can do from anywhere. And partly because I started here as a Werkstudent in media technology: I wanted to find out what the job actually feels like from the inside, not just from a syllabus. I've grown calmer over the years, and this is where I'd like to stay.",
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

export function AboutSection() {
  const [active, setActive] = useState<string>(CHAPTERS[0].id);
  const portraitRef = useRef<HTMLDivElement>(null);
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

  const current = CHAPTERS.find((c) => c.id === active) ?? CHAPTERS[0];

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
              <SplitText text="Some people say I lost those years." />
              <br />
              <span className="text-white/35">
                <SplitText text="I think I gained a life." delay={0.22} />
              </span>
            </blockquote>

            <Reveal direction="up" delay={0.1}>
              <p className="text-sm font-light leading-[1.95] text-white/45 max-w-xl">
                29, Tunisian, in Germany since 2016 — Berlin first, Hamburg
                now. I build things in 3D: environments, characters, game
                assets, and the textures and layouts that make them read.
                It started with a piece of CAD software in 2007 and it has
                never really let go. Everything else — the travelling, the
                martial arts, the records — is what I brought back to it.
                I work in four languages: Arabic, German, English, French.
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

        {/* ── Kapitel ── */}
        <Reveal direction="up">
          <p className="text-[8px] text-white/22 uppercase tracking-[0.28em] mb-8">
            The long version
          </p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          {/* Auswahl */}
          <div className="lg:col-span-5">
            <Stagger className="relative flex flex-col" gap={0.06}>
              {/* Zeitstrahl */}
              <span
                aria-hidden="true"
                className="absolute left-[7px] top-3 bottom-3 w-px bg-white/[0.09]"
              />
              {CHAPTERS.map((c) => {
                const on = c.id === active;
                const Icon = c.icon;
                return (
                  <StaggerItem key={c.id}>
                    <button
                      onClick={() => setActive(c.id)}
                      className={cn(
                        "group relative w-full flex items-center gap-5 py-5 pl-0 text-left transition-colors duration-300",
                        on ? "text-white" : "text-white/40 hover:text-white/75",
                      )}
                    >
                      <span
                        className={cn(
                          "relative z-10 shrink-0 flex items-center justify-center",
                          "h-[15px] w-[15px] rounded-full transition-all duration-400",
                          on
                            ? "bg-white text-black scale-[1.5]"
                            : "bg-[#0d0d0d] ring-1 ring-white/15 text-white/35",
                        )}
                      >
                        <Icon size={on ? 8 : 9} />
                      </span>
                      <span className="min-w-0 pl-1">
                        <span className="block text-[8px] uppercase tracking-[0.22em] text-white/25 mb-1.5">
                          {c.kicker}
                        </span>
                        <span className="block font-display font-medium text-base md:text-lg leading-snug">
                          {c.title}
                        </span>
                      </span>
                    </button>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </div>

          {/* Inhalt */}
          <div className="lg:col-span-7 lg:pt-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: reduced ? 0 : 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduced ? 0 : -12 }}
                transition={{ duration: reduced ? 0.15 : 0.5, ease: EASE }}
              >
                <p
                  className="font-light text-white/55 leading-[1.95]"
                  style={{ fontSize: "clamp(0.95rem, 1.3vw, 1.1rem)" }}
                >
                  {current.body}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
