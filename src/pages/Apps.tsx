import { useEffect } from "react";
import { Navbar } from "@/components/navbar";
import {
  Grain,
  Cursor,
  PageHeader,
  ProjectFlow,
  OtherPages,
  ContactSection,
  SiteFooter,
} from "@/components/site-chrome";
import { projectsData } from "@/data/projects";
import { useLang, t } from "@/lib/lang";

/* ────────────────────────────────────────────────────────────
   Web- und App-Entwicklung.

   Eigene Seite, damit die Startseite reine 3D-Arbeit bleibt.
   Inhalte kommen wie ueberall aus projects.ts, gefiltert auf
   group: "apps".
   ──────────────────────────────────────────────────────────── */

export default function Apps() {
  const { lang } = useLang();
  const projects = projectsData.filter((p) => p.group === "apps");

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="bg-background min-h-screen text-foreground selection:bg-white/20">
      <Grain />
      <Cursor />
      <Navbar />

      <PageHeader
        kicker={t("navApps", lang)}
        title={t("groupApps", lang)}
        intro={
          lang === "de"
            ? "Produkte, die ich allein entworfen und gebaut habe — Gestaltung, Front-End und Back-End. Von der Lern-Anwendung mit eigener Datenbank bis zur mehrsprachigen Website mit rechtsläufigem Layout."
            : "Products I designed and built on my own — design, front end and back end. From a learning app with its own database to a multilingual site with a right-to-left layout."
        }
      />

      <ProjectFlow projects={projects} />

      <OtherPages exclude="apps" />
      <ContactSection />
      <SiteFooter />
    </div>
  );
}
