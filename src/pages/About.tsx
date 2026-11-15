import { useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { AboutSection } from "@/components/about-section";
import {
  Grain,
  Cursor,
  ContactSection,
  SiteFooter,
  usePageMeta,
} from "@/components/site-chrome";
import { useLang, t } from "@/lib/lang";

/* Ueber mich als eigene Seite — von jeder der drei
   Arbeitsseiten aus erreichbar, ohne sie zu verlaengern. */

export default function About() {
  const { lang } = useLang();
  usePageMeta(
    t("about", lang),
    lang === "de"
      ? "Issam Selmi: Medientechnik-Student in Hamburg. Werdegang, Arbeit, Ehrenamt und Sprachen."
      : "Issam Selmi: Media Technology student in Hamburg. Background, work, volunteering and languages.",
  );
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="bg-background min-h-screen text-foreground selection:bg-white/20">
      <Grain />
      <Cursor />
      <Navbar />

      <div className="pt-20">
        <AboutSection />
      </div>

      <ContactSection />
      <SiteFooter />
    </div>
  );
}
