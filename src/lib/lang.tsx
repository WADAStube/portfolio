import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "de";

/* ────────────────────────────────────────────────────────────
   Sprachumschaltung

   Die gewaehlte Sprache liegt im localStorage, damit sie beim
   naechsten Besuch erhalten bleibt. Ohne gespeicherte Wahl
   entscheidet die Browsersprache: Deutsch fuer deutsche
   Browser, sonst Englisch.
   ──────────────────────────────────────────────────────────── */

const KEY = "wadas-lang";

function initial(): Lang {
  if (typeof window === "undefined") return "en";
  const saved = window.localStorage.getItem(KEY);
  if (saved === "de" || saved === "en") return saved;
  return navigator.language?.toLowerCase().startsWith("de") ? "de" : "en";
}

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "en",
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    setLangState(initial());
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(KEY, l);
    } catch {
      /* privater Modus — dann eben nur fuer diese Sitzung */
    }
  }, []);

  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export function useLang() {
  return useContext(Ctx);
}

/** Waehlt aus einem Paar { en, de } den passenden Text. */
export function pick<T>(en: T, de: T | undefined, lang: Lang): T {
  return lang === "de" && de !== undefined ? de : en;
}

/* ── Feste Beschriftungen der Oberflaeche ── */
export const UI = {
  navWork: { en: "3D & Game Art", de: "3D & Game Art" },
  navAbout: { en: "About", de: "Über mich" },
  navContact: { en: "Contact", de: "Kontakt" },
  based: { en: "Based in Hamburg", de: "Ansässig in Hamburg" },
  portfolioYear: { en: "Portfolio 2026", de: "Portfolio 2026" },
  role: { en: "Media Technology Engineering", de: "Medientechnik · Ingenieurstudium" },
  roleSub: {
    en: "Software Development · Interactive Systems · 3D Visualization · Digital Media",
    de: "Softwareentwicklung · Interaktive Systeme · 3D-Visualisierung · Digitale Medien",
  },
  heroLine: {
    en: "B.Eng. student at Hochschule Emden/Leer. I build apps and web applications, real-time scenes in Unity, and 3D.",
    de: "B.Eng.-Student an der Hochschule Emden/Leer. Ich baue Apps und Web-Anwendungen, Echtzeit-Szenen in Unity und 3D.",
  },
  navProjects: { en: "Projects", de: "Projekte" },
  navEngineering: { en: "Engineering", de: "Engineering" },
  allProjects: { en: "All projects", de: "Alle Projekte" },
  all: { en: "All", de: "Alle" },
  openProject: { en: "Open project", de: "Projekt öffnen" },
  stComplete: { en: "Shown in full", de: "Vollständig gezeigt" },
  stWip: { en: "Work in progress", de: "In Arbeit" },
  stSoon: { en: "Coming soon", de: "Folgt" },
  furtherWork: { en: "Further work", de: "Weitere Arbeiten" },
  furtherWorkNote: {
    en: "Documented in CV and project files. Images and write-ups follow.",
    de: "Belegt durch Lebenslauf und Projektunterlagen. Bilder und Ausarbeitung folgen.",
  },
  caseStudy: { en: "Case study", de: "Fallstudie" },
  csChallenge: { en: "Challenge", de: "Aufgabe" },
  csApproach: { en: "My approach", de: "Mein Ansatz" },
  csImplementation: { en: "Technical implementation", de: "Technische Umsetzung" },
  csDecisions: { en: "Key decisions", de: "Entscheidungen" },
  csOutcome: { en: "Outcome", de: "Ergebnis" },
  csShare: { en: "My part", de: "Mein Anteil" },
  csLearned: { en: "What I learned", de: "Was ich gelernt habe" },
  csState: { en: "Current state", de: "Aktueller Stand" },
  back: { en: "All projects", de: "Alle Projekte" },
  next: { en: "Next project", de: "Nächstes Projekt" },
  seeking: {
    en: "Looking for a mandatory internship (Pflichtpraktikum) as part of the degree. Open to a working-student position. Hamburg.",
    de: "Ich suche ein Pflichtpraktikum im Rahmen des Studiums und bin offen für eine Werkstudentenstelle. Hamburg.",
  },
  viewWork: { en: "View work", de: "Projekte ansehen" },
  selectedWork: { en: "Selected Work", de: "Ausgewählte Arbeiten" },
  portfolio: { en: "Portfolio", de: "Portfolio" },
  projects: { en: "Projects", de: "Projekte" },
  project: { en: "Project", de: "Projekt" },
  comingSoon: { en: "Coming soon", de: "Folgt" },
  /* Die zwei Bereiche der Werkuebersicht */
  group3d: { en: "3D & Game Art", de: "3D & Game Art" },
  group3dSub: {
    en: "Environments, assets and characters — Maya, Unity, Substance Painter",
    de: "Umgebungen, Assets und Charaktere in Maya, Unity und Substance Painter",
  },
  groupApps: { en: "Web & App Development", de: "Web- und App-Entwicklung" },
  groupAppsSub: {
    en: "Products designed and built end to end — front end, back end, and the app itself.",
    de: "Produkte von der ersten Skizze bis zur fertigen Fassung: Gestaltung, Front-End, Back-End und die App selbst.",
  },
  groupDesign: { en: "Design & Coursework", de: "Gestaltung & Studium" },
  groupDesignSub: {
    en: "Poster and print design, motion, and work out of the modules of the degree.",
    de: "Plakat und Druck, Motion Design und Arbeiten, die aus den Modulen des Studiums entstanden sind.",
  },
  moreWork: { en: "More work", de: "Weitere Arbeiten" },
  clickThrough: { en: "Click through", de: "Durchklicken" },
  walkthrough: { en: "Walkthrough", de: "Ablauf" },
  walkthroughNote: {
    en: "Click the right side to go forward, the left to go back. Arrow keys and swipe work too.",
    de: "Ein Klick rechts führt weiter, einer links zurück. Pfeiltasten und Wischen gehen genauso.",
  },
  liveSite: { en: "Open the live site", de: "Zur Live-Seite" },
  navApps: { en: "Apps", de: "Apps" },
  navDesign: { en: "Design", de: "Design" },

  /* Beschriftungen fuer die Modul-Herkunft einer Arbeit */
  module: { en: "Module", de: "Modul" },
  brief: { en: "Brief", de: "Aufgabenstellung" },
  client: { en: "Client", de: "Auftraggeber" },
  software: { en: "Software", de: "Software" },
  year: { en: "Year", de: "Jahr" },
  breakdown: { en: "Breakdown", de: "Entstehung" },
  breakdownTitle: { en: "How it was built", de: "Wie es entstanden ist" },
  dragCompare: { en: "Drag to compare", de: "Ziehen zum Vergleichen" },
  viewFull: { en: "View full", de: "Vergrößern" },
  enlarge: { en: "Enlarge", de: "Vergrößern" },
  sourceMaterial: { en: "Source material", de: "Quellmaterial" },
  about: { en: "About", de: "Über mich" },
  background: { en: "Background", de: "Werdegang" },
  contact: { en: "Contact", de: "Kontakt" },
  letsWork: { en: "Let's work", de: "Arbeiten wir" },
  together: { en: "together.", de: "zusammen." },
  downloadCV: { en: "Download CV", de: "Lebenslauf laden" },
  swipe: { en: "Swipe", de: "Wischen" },
  scrollRotate: { en: "Hover to rotate", de: "Mauszeiger dreht" },
  theory: { en: "Theory in practice", de: "Theorie in der Anwendung" },
  theoryTitle: {
    en: "What the coursework brought in",
    de: "Was aus dem Studium ins Projekt floss",
  },
  theoryIntro: {
    en: "A 3D project looks like software work. The decisions that actually shape the image are not software decisions — they are the same ones made on a film set, in a photo studio or in stage lighting. These come from lighting, computer graphics and studio technology.",
    de: "Von außen sieht ein 3D-Projekt nach reiner Softwarearbeit aus. Worüber die Bildwirkung entscheidet, hat mit Software aber wenig zu tun: Es sind dieselben Fragen, die am Filmset, im Fotostudio und an der Bühnenbeleuchtung gestellt werden. Die hier stammen aus Lichttechnik, Computergrafik und Studiotechnik.",
  },
} as const;

export function t(key: keyof typeof UI, lang: Lang) {
  return UI[key][lang];
}
