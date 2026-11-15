import { Reveal } from "@/components/motion-primitives";
import type { CaseStudy as Case, Bi } from "@/data/portfolio";
import { cn } from "@/lib/utils";
import { useLang, t } from "@/lib/lang";

/* ────────────────────────────────────────────────────────────
   Fallstudie eines Projekts.

   Fester Aufbau, damit jede Arbeit gleich gelesen werden kann:
   Aufgabe, Ansatz, Umsetzung, Entscheidungen, Ergebnis, Anteil.
   "Stand" und "Gelernt" erscheinen nur, wenn es dazu Angaben gibt.
   Die Texte liegen in data/portfolio.ts.
   ──────────────────────────────────────────────────────────── */

export function CaseStudy({ data, invert }: { data: Case; invert?: boolean }) {
  const { lang } = useLang();
  const tx = (b: Bi) => b[lang];

  const line = invert ? "border-black/10" : "border-white/[0.07]";
  const label = invert ? "text-black/45" : "text-white/35";
  const body = invert ? "text-black/75" : "text-white/60";
  const strong = invert ? "text-black" : "text-white/85";

  const Row = ({
    name,
    children,
  }: {
    name: string;
    children: React.ReactNode;
  }) => (
    <div className={cn("grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-3 py-7 md:py-9 border-t", line)}>
      <h3 className={cn("md:col-span-3 text-[10px] uppercase tracking-[0.24em] pt-1", label)}>
        {name}
      </h3>
      <div className={cn("md:col-span-9 max-w-3xl text-sm md:text-[0.95rem] font-light leading-[1.9]", body)}>
        {children}
      </div>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-16 mt-20 md:mt-28">
      <Reveal direction="up" duration={0.85}>
        <div className="flex items-center gap-5 mb-8">
          <span className={cn("h-px w-10 shrink-0", invert ? "bg-black/25" : "bg-white/20")} />
          <h2 className={cn("text-[9px] uppercase tracking-[0.3em]", label)}>
            {t("caseStudy", lang)}
          </h2>
          <span className={cn("h-px flex-1", invert ? "bg-black/10" : "bg-white/[0.07]")} />
        </div>
      </Reveal>

      <Reveal direction="up" duration={0.9}>
        <div className={cn("border-b", line)}>
          <Row name={t("csChallenge", lang)}>
            <p className={strong}>{tx(data.challenge)}</p>
          </Row>
          <Row name={t("csApproach", lang)}>
            <p>{tx(data.approach)}</p>
          </Row>
          <Row name={t("csImplementation", lang)}>
            <p>{tx(data.implementation)}</p>
          </Row>
          <Row name={t("csDecisions", lang)}>
            <ul className="space-y-3">
              {data.decisions.map((d, i) => (
                <li key={i} className="flex gap-4">
                  <span className={cn("font-mono text-[10px] tabular-nums pt-[0.35rem] shrink-0", label)}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{tx(d)}</span>
                </li>
              ))}
            </ul>
          </Row>
          <Row name={t("csOutcome", lang)}>
            <p>{tx(data.outcome)}</p>
          </Row>
          {data.state && (
            <Row name={t("csState", lang)}>
              <p className={strong}>{tx(data.state)}</p>
            </Row>
          )}
          <Row name={t("csShare", lang)}>
            <p>{tx(data.share)}</p>
          </Row>
          {data.learned && (
            <Row name={t("csLearned", lang)}>
              <p>{tx(data.learned)}</p>
            </Row>
          )}
        </div>
      </Reveal>
    </div>
  );
}
