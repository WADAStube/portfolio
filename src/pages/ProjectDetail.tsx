import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { Navbar } from "@/components/navbar";
import {
  Grain,
  Cursor,
  ContactSection,
  SiteFooter,
  StatusBadge,
  usePageMeta,
} from "@/components/site-chrome";
import { ProjectShowcase } from "@/components/project-showcase";
import { CaseStudy } from "@/components/case-study";
import { Lightbox } from "@/components/lightbox";
import NotFound from "@/pages/not-found";
import {
  CASES,
  ENTRIES,
  entryBySlug,
  fieldLabel,
  hasMedia,
  pathOf,
} from "@/data/portfolio";
import { useLang, pick, t } from "@/lib/lang";

/* ────────────────────────────────────────────────────────────
   Detailseite eines Projekts: /projects/<slug>

   Zeigt die bestehende Projektdarstellung unveraendert und setzt
   die Fallstudie zwischen Einleitung und Aufschluesselung.
   ──────────────────────────────────────────────────────────── */

export default function ProjectDetail() {
  const [, params] = useRoute("/projects/:slug");
  const { lang } = useLang();
  const entry = entryBySlug(params?.slug ?? "");
  const [shot, setShot] = useState<number | null>(null);

  const p = entry?.project;
  usePageMeta(
    p?.title ?? "404",
    p ? pick(p.description, p.de?.description, lang) : undefined,
  );

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setShot(null);
  }, [params?.slug]);

  if (!entry || !p || !(entry.status === "complete" || hasMedia(p))) {
    return <NotFound />;
  }

  /* Naechstes Projekt, das eine Detailseite hat */
  const open = ENTRIES.filter((e) => e.status === "complete" || hasMedia(e.project));
  const next = open[(open.indexOf(entry) + 1) % open.length];
  const study = CASES[p.id];

  return (
    <div className="bg-background min-h-screen text-foreground selection:bg-white/20">
      <Grain />
      <Cursor />
      <Navbar />

      <main>
        <div className="pt-28 md:pt-32 pb-8 md:pb-10">
          <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-16 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link href="/projects">
              <a className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-white/45 hover:text-white transition-colors duration-300">
                <span aria-hidden="true">←</span>
                {t("back", lang)}
              </a>
            </Link>
            <h1 className="sr-only">{p.title}</h1>
            <p className="text-[10px] tracking-[0.06em] text-white/35">
              {entry.fields.map((f) => fieldLabel(f)[lang]).join("  ·  ")}
            </p>
            <StatusBadge status={entry.status} className="md:ml-auto" />
          </div>
        </div>

        <ProjectShowcase
          key={p.id}
          project={{ ...p, comingSoon: false }}
          index={0}
          total={1}
          onOpenShot={(_, i) => setShot(i)}
          afterIntro={study ? <CaseStudy data={study} invert={!!p.invert} /> : undefined}
        />

        <section className="border-t border-white/[0.05]">
          <Link href={pathOf(next)}>
            <a className="group block max-w-[1600px] mx-auto px-6 md:px-10 lg:px-16 py-14 md:py-20">
              <p className="text-[9px] uppercase tracking-[0.28em] text-white/30 mb-4">
                {t("next", lang)}
              </p>
              <p
                className="font-display font-bold text-white/70 group-hover:text-white transition-colors duration-300 leading-none"
                style={{ fontSize: "clamp(1.8rem, 5vw, 4rem)", letterSpacing: "-0.02em" }}
              >
                {next.project.title} <span aria-hidden="true">→</span>
              </p>
            </a>
          </Link>
        </section>
      </main>

      <ContactSection />
      <SiteFooter />

      <Lightbox
        project={shot === null ? null : p}
        startIndex={shot ?? 0}
        onClose={() => setShot(null)}
      />
    </div>
  );
}
