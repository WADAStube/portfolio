import { useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Navbar } from "@/components/navbar";
import {
  Grain,
  Cursor,
  PageHeader,
  ContactSection,
  SiteFooter,
  StatusBadge,
  usePageMeta,
} from "@/components/site-chrome";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/motion-primitives";
import {
  ENTRIES,
  FIELDS,
  MINOR,
  fieldLabel,
  type FieldId,
} from "@/data/portfolio";
import { cn } from "@/lib/utils";
import { useLang, t } from "@/lib/lang";

/* ────────────────────────────────────────────────────────────
   Alle Projekte, nach Fachrichtung filterbar.

   Der Filter steht in der Adresse (?focus=software), damit ein
   Link direkt auf eine Sicht zeigen kann, zum Beispiel aus einer
   Bewerbung heraus. Ein Projekt kann in mehreren Sichten stehen.
   ──────────────────────────────────────────────────────────── */

const isField = (v: string | null): v is FieldId =>
  !!v && FIELDS.some((f) => f.id === v);

/* Reihenfolge: vollstaendig gezeigte zuerst, dann in Arbeit, dann
   der Rest. Innerhalb bleibt die Reihenfolge aus den Daten. */
const ORDER = { complete: 0, wip: 1, soon: 2 } as const;

export default function Projects() {
  const { lang } = useLang();
  const search = useSearch();
  const [, navigate] = useLocation();
  const raw = new URLSearchParams(search).get("focus");
  const focus: FieldId | null = isField(raw) ? raw : null;

  usePageMeta(
    t("navProjects", lang),
    lang === "de"
      ? "Projekte von Issam Selmi: Software und Anwendungen, Echtzeit, 3D und Gestaltung."
      : "Projects by Issam Selmi: software and applications, real-time, 3D and design.",
  );

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const setFocus = (f: FieldId | null) =>
    navigate(f ? `/projects?focus=${f}` : "/projects", { replace: true });

  /* Erst die ausgewaehlten Arbeiten in ihrer Reihenfolge, dann
     der Rest nach Stand. Sonst stehen die Software-Projekte
     hinter einer Reihe aelterer 3D-Studien. */
  const entries = ENTRIES.filter((e) => !focus || e.fields.includes(focus))
    .map((e, i) => ({ e, i }))
    .sort(
      (a, b) =>
        (a.e.home ?? 99) - (b.e.home ?? 99) ||
        ORDER[a.e.status] - ORDER[b.e.status] ||
        a.i - b.i,
    )
    .map((x) => x.e);
  const minor = MINOR.filter((m) => !focus || m.fields.includes(focus));

  const chips: { id: FieldId | null; label: string; n: number }[] = [
    { id: null, label: t("all", lang), n: ENTRIES.length + MINOR.length },
    ...FIELDS.map((f) => ({
      id: f.id,
      label: f.label[lang],
      n:
        ENTRIES.filter((e) => e.fields.includes(f.id)).length +
        MINOR.filter((m) => m.fields.includes(f.id)).length,
    })),
  ];

  return (
    <div className="bg-background min-h-screen text-foreground selection:bg-white/20">
      <Grain />
      <Cursor />
      <Navbar />

      <PageHeader
        kicker={t("navProjects", lang)}
        title={focus ? fieldLabel(focus)[lang] : t("allProjects", lang)}
        intro={
          focus
            ? FIELDS.find((f) => f.id === focus)!.sub[lang]
            : lang === "de"
              ? "Alles auf einer Seite. Die Filter zeigen dieselben Arbeiten aus vier Richtungen; ein Projekt kann in mehreren stehen."
              : "Everything on one page. The filters show the same work from four directions; a project can sit in more than one."
        }
      >
        <div
          role="group"
          aria-label={lang === "de" ? "Projekte filtern" : "Filter projects"}
          className="mt-10 flex flex-wrap gap-2"
        >
          {chips.map((c) => {
            const active = c.id === focus;
            return (
              <button
                key={c.id ?? "all"}
                type="button"
                aria-pressed={active}
                onClick={() => setFocus(c.id)}
                className={cn(
                  "border px-4 py-2.5 text-[10px] uppercase tracking-[0.18em] transition-colors duration-300",
                  "focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/60",
                  active
                    ? "border-white/60 bg-white text-black"
                    : "border-white/[0.12] text-white/65 hover:text-white hover:border-white/35",
                )}
              >
                {c.label}
                <span className={cn("ml-2 font-mono tabular-nums", active ? "text-black/50" : "text-white/45")}>
                  {c.n}
                </span>
              </button>
            );
          })}
        </div>
      </PageHeader>

      <section className="py-16 md:py-24">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 md:gap-x-10 md:gap-y-20">
            {entries.map((e, i) => (
              <ProjectCard key={e.project.id} entry={e} eager={i < 3} />
            ))}
          </div>
        </div>
      </section>

      {minor.length > 0 && (
        <section className="border-t border-white/[0.05] py-16 md:py-24">
          <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-16">
            <Reveal direction="up">
              <h2 className="font-display font-medium text-white/85 text-lg md:text-xl mb-2">
                {t("furtherWork", lang)}
              </h2>
              <p className="text-[11px] font-light text-white/52 mb-8 max-w-xl">
                {t("furtherWorkNote", lang)}
              </p>
            </Reveal>
            <ul className="border-t border-white/[0.07]">
              {minor.map((m) => (
                <li
                  key={m.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-3 py-7 border-b border-white/[0.07]"
                >
                  <div className="md:col-span-4">
                    <h3 className="font-display font-medium text-white/85 text-lg md:text-xl leading-tight">
                      {m.title}
                    </h3>
                    <p className="mt-1.5 text-[10px] uppercase tracking-[0.2em] text-white/52">
                      {m.kind[lang]}
                    </p>
                    {m.status === "wip" && <StatusBadge status="wip" className="mt-4" />}
                  </div>
                  <div className="md:col-span-8">
                    <p className="text-sm font-light leading-[1.85] text-white/65 max-w-2xl">
                      {m.body[lang]}
                    </p>
                    <p className="mt-3 text-[10px] tracking-[0.06em] text-white/48">
                      {m.fields.map((f) => fieldLabel(f)[lang]).join("  ·  ")}
                    </p>
                    {m.tools.length > 0 && (
                      <p className="mt-1.5 font-mono text-[10px] text-white/45">
                        {m.tools.join(" / ")}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <ContactSection />
      <SiteFooter />
    </div>
  );
}
