import { Reveal } from "@/components/motion-primitives";
import { Disclosure } from "@/components/site-chrome";
import type { CaseStudy as Case, Bi } from "@/data/portfolio";
import { cn } from "@/lib/utils";
import { useLang, t } from "@/lib/lang";

/* ────────────────────────────────────────────────────────────
   Fallstudie eines Projekts.

   Zwei Ebenen, damit beide Leser bedient sind:

   Oben "Auf einen Blick" — Problem, meine Rolle, Technologien,
   Ergebnis. Vier Zeilen, in zehn Sekunden gelesen.

   Darunter aufklappbar die ausfuehrliche Fassung: Ansatz,
   technische Umsetzung, Entscheidungen, Ergebnis, Stand,
   Anteil, Gelerntes. Nichts geht verloren, es steht nur nicht
   mehr im Weg.
   ──────────────────────────────────────────────────────────── */

export function CaseStudy({
  data,
  tools,
  invert,
}: {
  data: Case;
  /** Technologien — kommen aus den Projektdaten */
  tools?: string[];
  invert?: boolean;
}) {
  const { lang } = useLang();
  const tx = (b: Bi) => b[lang];

  const line = invert ? "border-black/10" : "border-white/[0.09]";
  const label = invert ? "text-black/55" : "text-white/50";
  const body = invert ? "text-black/75" : "text-white/70";
  const strong = invert ? "text-black" : "text-white/85";

  /* ── Auf einen Blick ── */
  const Cell = ({
    name,
    children,
    last,
  }: {
    name: string;
    children: React.ReactNode;
    last?: boolean;
  }) => (
    <div
      className={cn(
        "border-t pt-5 md:pt-6",
        line,
        !last && "pb-6 md:pb-0",
      )}
    >
      <p className={cn("mb-3 text-[9px] uppercase tracking-[0.24em]", label)}>{name}</p>
      {children}
    </div>
  );

  /* ── Zeile der ausfuehrlichen Fassung ── */
  const Row = ({
    name,
    children,
  }: {
    name: string;
    children: React.ReactNode;
  }) => (
    <div className={cn("grid grid-cols-1 gap-x-10 gap-y-3 border-t py-7 md:grid-cols-12 md:py-9", line)}>
      <h3 className={cn("pt-1 text-[10px] uppercase tracking-[0.24em] md:col-span-3", label)}>
        {name}
      </h3>
      <div
        className={cn(
          "max-w-3xl text-sm font-light leading-[1.9] md:col-span-9 md:text-[0.95rem]",
          body,
        )}
      >
        {children}
      </div>
    </div>
  );

  return (
    <div className="mx-auto mt-20 max-w-[1600px] px-6 md:mt-28 md:px-10 lg:px-16">
      <Reveal direction="up" duration={0.85}>
        <div className="mb-8 flex items-center gap-5">
          <span className={cn("h-px w-10 shrink-0", invert ? "bg-black/25" : "bg-white/25")} />
          <h2 className={cn("text-[9px] uppercase tracking-[0.3em]", label)}>
            {t("csAtAGlance", lang)}
          </h2>
          <span className={cn("h-px flex-1", invert ? "bg-black/10" : "bg-white/[0.09]")} />
        </div>
      </Reveal>

      <Reveal direction="up" duration={0.9}>
        <div className="grid grid-cols-1 gap-x-10 md:grid-cols-2 lg:grid-cols-4">
          <Cell name={t("csProblem", lang)}>
            <p className={cn("max-w-sm text-[13.5px] font-light leading-[1.8]", strong)}>
              {tx(data.summary.problem)}
            </p>
          </Cell>

          <Cell name={t("csRole", lang)}>
            <p className={cn("max-w-sm text-[13.5px] font-light leading-[1.8]", body)}>
              {tx(data.summary.role)}
            </p>
          </Cell>

          <Cell name={t("csTech", lang)}>
            {tools?.length ? (
              <ul className="flex flex-wrap gap-1.5">
                {tools.map((tool) => (
                  <li
                    key={tool}
                    className={cn(
                      "border px-2.5 py-1.5 font-mono text-[10px] tracking-[0.04em]",
                      invert
                        ? "border-black/20 text-black/75"
                        : "border-white/20 text-white/75",
                    )}
                  >
                    {tool}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={cn("text-[13.5px] font-light", body)}>—</p>
            )}
          </Cell>

          <Cell name={t("csResult", lang)} last>
            <p className={cn("max-w-sm text-[13.5px] font-light leading-[1.8]", strong)}>
              {tx(data.summary.result)}
            </p>
          </Cell>
        </div>
      </Reveal>

      <Reveal direction="up" duration={0.9}>
        <Disclosure
          label={t("csFull", lang)}
          hint={t("csFullHint", lang)}
          invert={invert}
          className="mt-14 md:mt-20"
        >
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
                    <span className={cn("shrink-0 pt-[0.35rem] font-mono text-[10px] tabular-nums", label)}>
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
        </Disclosure>
      </Reveal>
    </div>
  );
}
