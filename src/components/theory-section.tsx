import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { EASE, useIsSmallScreen } from "@/components/motion-primitives";
import { useLang, t } from "@/lib/lang";

export interface TheoryModule {
  module: string;
  moduleDe?: string;
  items: {
    title: string;
    titleDe?: string;
    body: string;
    bodyDe?: string;
  }[];
}

/* ────────────────────────────────────────────────────────────
   TheorySection

   Verbindet die Module aus dem Studium mit den Entscheidungen
   im Projekt. Bewusst ruhig gesetzt: Modulname als Marke,
   darunter die einzelnen Punkte in zwei Spalten.
   ──────────────────────────────────────────────────────────── */

function Item({
  item,
  index,
}: {
  item: TheoryModule["items"][number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduced = useReducedMotion();
  const small = useIsSmallScreen();
  const { lang } = useLang();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: reduced ? 0 : 22, x: reduced || small ? 0 : 18 }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{
        duration: reduced ? 0.2 : 0.9,
        ease: EASE,
        delay: reduced ? 0 : index * 0.07,
      }}
      className="border-t border-white/[0.07] pt-5"
    >
      <h4 className="font-display font-medium text-white/85 text-[0.95rem] leading-snug mb-2.5">
        {lang === "de" && item.titleDe ? item.titleDe : item.title}
      </h4>
      <p className="text-[13px] font-light leading-[1.85] text-white/45">
        {lang === "de" && item.bodyDe ? item.bodyDe : item.body}
      </p>
    </motion.div>
  );
}

export function TheorySection({ modules }: { modules: TheoryModule[] }) {
  const { lang } = useLang();
  const reduced = useReducedMotion();

  return (
    <div className="max-w-[1760px] mx-auto px-6 md:px-10 lg:px-12 py-20 md:py-28">
      <motion.div
        initial={{ opacity: 0, y: reduced ? 0 : 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: reduced ? 0.2 : 0.9, ease: EASE }}
        className="mb-14 md:mb-20 max-w-2xl"
      >
        <p className="text-[8px] uppercase tracking-[0.28em] text-white/22 mb-4">
          {t("theory", lang)}
        </p>
        <h3
          className="font-display font-bold text-white leading-none mb-6"
          style={{ fontSize: "clamp(1.6rem, 4vw, 3rem)", letterSpacing: "-0.02em" }}
        >
          {t("theoryTitle", lang)}
        </h3>
        <p className="text-sm md:text-base font-light leading-[1.9] text-white/45">
          {t("theoryIntro", lang)}
        </p>
      </motion.div>

      <div className="space-y-16 md:space-y-24">
        {modules.map((m) => (
          <div key={m.module}>
            <div className="flex items-center gap-5 mb-8">
              <span className="text-[9px] uppercase tracking-[0.28em] text-white/40 shrink-0">
                {lang === "de" && m.moduleDe ? m.moduleDe : m.module}
              </span>
              <span className="h-px flex-1 bg-white/[0.07]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-10 xl:gap-x-14 gap-y-10">
              {m.items.map((it, i) => (
                <Item key={it.title} item={it} index={i} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
