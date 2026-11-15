import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { Link } from "wouter";
import {
  Reveal,
  SplitText,
  Magnetic,
  EASE,
} from "@/components/motion-primitives";
import type { Status } from "@/data/portfolio";
import { cn } from "@/lib/utils";
import { useLang, t } from "@/lib/lang";

/* ────────────────────────────────────────────────────────────
   Gemeinsame Bausteine aller Seiten.

   Kontaktblock, Fussleiste, Rauschen, Mauszeiger, Seitenkopf,
   Seitentitel und die Markierung fuer den Stand eines Projekts.
   ──────────────────────────────────────────────────────────── */

/* Setzt Titel und Beschreibung der Seite. Die Seite ist eine
   Single-Page-App; ohne das stuende auf jeder Adresse derselbe
   Titel im Tab und im Verlauf. */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = `${title} · Issam Selmi`;
    if (description) {
      document
        .querySelector('meta[name="description"]')
        ?.setAttribute("content", description);
    }
  }, [title, description]);
}

/* Stand eines Projekts. Farbe allein traegt die Aussage nicht,
   der Text steht immer dabei. */
export function StatusBadge({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  const { lang } = useLang();
  const key = status === "complete" ? "stComplete" : status === "wip" ? "stWip" : "stSoon";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-white/45",
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "complete"
            ? "bg-white/70"
            : status === "wip"
              ? "bg-amber-400/80"
              : "border border-white/40",
        )}
      />
      {t(key, lang)}
    </span>
  );
}

export const CV_FILE: string | null = "/Issam-Selmi-CV.pdf";

export const Grain = () => <div aria-hidden="true" className="grain" />;

/* Ueberschrift faehrt beim Hereinscrollen waagerecht auf Breite */
export function StretchOnScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 95%", "start 45%"],
  });
  const raw = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const scaleX = useSpring(raw, { stiffness: 140, damping: 26, mass: 0.4 });

  return (
    <div ref={ref}>
      <motion.div
        style={{ scaleX: reduced ? 1 : scaleX, originX: 0 }}
        className="will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ────────────────── Kopf einer Unterseite ────────────────── */

export function PageHeader({
  kicker,
  title,
  intro,
  children,
}: {
  kicker: string;
  title: string;
  intro: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative pt-36 md:pt-48 pb-16 md:pb-24 border-b border-white/[0.05]">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-16">
        <Reveal direction="up" duration={0.85}>
          <div className="flex items-center gap-5 mb-10">
            <span className="h-px w-10 bg-white/20 shrink-0" />
            <span className="text-[9px] uppercase tracking-[0.3em] text-white/35">
              {kicker}
            </span>
            <span className="h-px flex-1 bg-white/[0.07]" />
          </div>
        </Reveal>

        {/* Ohne SplitText: die wortweise Blende arbeitet mit
            overflow:hidden je Wort. Bei enger Zeilenhoehe und
            noch nicht geladener Schrift werden Oberlaengen
            abgeschnitten — auf einer Seitenueberschrift, die
            sofort oben steht, ist das Risiko es nicht wert. */}
        <Reveal direction="up" duration={0.95}>
          <h1
            className="font-display font-bold text-white leading-[1.02]"
            style={{
              fontSize: "clamp(2.4rem, 7vw, 6rem)",
              letterSpacing: "-0.03em",
            }}
          >
            {title}
          </h1>
        </Reveal>

        <Reveal direction="up" delay={0.12} duration={0.9}>
          <p className="mt-8 text-base md:text-lg font-light leading-[1.85] text-white/45 max-w-2xl">
            {intro}
          </p>
        </Reveal>

        {children}
      </div>
    </section>
  );
}

/* ────────────────── Kontakt ────────────────── */

export function ContactSection() {
  const { lang } = useLang();

  return (
    <section
      id="contact"
      className="relative py-32 md:py-56 overflow-hidden border-t border-white/[0.05]"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-[#0a0a0a]" />

      <div className="relative max-w-[1600px] mx-auto px-6 md:px-10 lg:px-16">
        <Reveal direction="up">
          <p className="text-[8px] text-white/22 uppercase tracking-[0.28em] mb-14">
            {t("contact", lang)}
          </p>
        </Reveal>

        <StretchOnScroll>
          <h2
            className="font-display font-bold text-white leading-[0.9] mb-16"
            style={{ fontSize: "clamp(3rem, 10vw, 11rem)", letterSpacing: "-0.02em" }}
          >
            <SplitText key={lang + "c"} text={t("letsWork", lang)} />
            <br />
            <span className="text-white/22">
              <SplitText key={lang + "d"} text={t("together", lang)} delay={0.15} />
            </span>
          </h2>
        </StretchOnScroll>

        <Reveal direction="up">
          <p className="max-w-xl text-sm md:text-base font-light leading-[1.85] text-white/50 mb-10">
            {t("seeking", lang)}
          </p>
        </Reveal>

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
              <Magnetic strength={0.3} radius={110}>
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
                    {t("downloadCV", lang)}
                  </span>
                </motion.a>
              </Magnetic>
            </div>
          )}

          <div className="w-full h-px bg-white/[0.07] mb-16" />

          <div className="flex flex-wrap items-center gap-10">
            {[
              {
                label: "Instagram",
                href: "https://www.instagram.com/issam_selmy",
              },
              {
                label: "LinkedIn",
                href: "https://www.linkedin.com/in/issam-selmi-6253241b9",
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
  );
}

/* ────────────────── Fussleiste ────────────────── */

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.05] py-6">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-16 flex items-center justify-between">
        <p className="flex items-center gap-2.5 text-[9px] text-white/18 uppercase tracking-widest">
          <span className="inline-flex items-center justify-center h-4 w-4 border border-white/20 text-[7px] font-display font-bold text-white/40">
            W
          </span>
          © {new Date().getFullYear()} Issam Selmi · WADAS
        </p>
        <p className="text-[9px] text-white/14 uppercase tracking-wider">
          Media Technology Engineering · Hamburg
        </p>
      </div>
    </footer>
  );
}

/* ────────────────── Mauszeiger ────────────────── */

export function Cursor() {
  const dx = useMotionValue(-100);
  const dy = useMotionValue(-100);
  const rx = useMotionValue(-100);
  const ry = useMotionValue(-100);
  const sx = useSpring(rx, { stiffness: 200, damping: 22 });
  const sy = useSpring(ry, { stiffness: 200, damping: 22 });
  const [expanded, setExpanded] = useState(false);
  const [ready, setReady] = useState(false);

  /* Auf Touch-Geraeten komplett deaktiviert */
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
