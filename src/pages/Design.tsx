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
   Gestaltung und Studium.

   Plakat, Print, Motion und Arbeiten aus den Modulen. Inhalte
   kommen aus projects.ts, gefiltert auf group: "design".
   ──────────────────────────────────────────────────────────── */

export default function Design() {
  const { lang } = useLang();
  const projects = projectsData.filter((p) => p.group === "design");

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="bg-background min-h-screen text-foreground selection:bg-white/20">
      <Grain />
      <Cursor />
      <Navbar />

      <PageHeader
        kicker={t("navDesign", lang)}
        title={t("groupDesign", lang)}
        intro={
          lang === "de"
            ? "Gestaltung außerhalb von 3D: Plakat und Druck, Motion Design und Arbeiten aus den Modulen des Studiums. Bei jedem Projekt steht dabei, aus welchem Modul und welcher Aufgabe es kam — oder für wen es entstanden ist."
            : "Design outside 3D: poster and print, motion, and work out of the modules of the degree. Each project names either the module and its brief, or the client."
        }
        area="design"
      />

      <ProjectFlow projects={projects} />

      <OtherPages exclude="design" />
      <ContactSection />
      <SiteFooter />
    </div>
  );
}
