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
      ? "Issam Selmi: 3D Artist und Entwickler in Hamburg, Medientechnik an der Hochschule Emden/Leer. Werdegang, Arbeit, Ehrenamt und das Ziel eines eigenen Spiels."
      : "Issam Selmi: 3D artist and developer based in Hamburg, studying Media Technology at Hochschule Emden/Leer. Background, work, volunteering and the goal of building a game.",
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
