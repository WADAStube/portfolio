import { useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { AboutSection } from "@/components/about-section";
import {
  Grain,
  Cursor,
  ContactSection,
  SiteFooter,
} from "@/components/site-chrome";

/* Ueber mich als eigene Seite — von jeder der drei
   Arbeitsseiten aus erreichbar, ohne sie zu verlaengern. */

export default function About() {
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
