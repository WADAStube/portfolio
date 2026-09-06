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
  navWork: { en: "Selected Work", de: "Projekte" },
  navAbout: { en: "About", de: "Über mich" },
  navContact: { en: "Contact", de: "Kontakt" },
  based: { en: "Based in Hamburg", de: "Ansässig in Hamburg" },
  portfolioYear: { en: "Portfolio 2026", de: "Portfolio 2026" },
  role: { en: "3D & Game Art", de: "3D & Game Art" },
  roleSub: { en: "Media Technology", de: "Medientechnik" },
  viewWork: { en: "View work", de: "Projekte ansehen" },
  selectedWork: { en: "Selected Work", de: "Ausgewählte Arbeiten" },
  portfolio: { en: "Portfolio", de: "Portfolio" },
  projects: { en: "Projects", de: "Projekte" },
  project: { en: "Project", de: "Projekt" },
  comingSoon: { en: "Coming soon", de: "In Arbeit" },
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
} as const;

export function t(key: keyof typeof UI, lang: Lang) {
  return UI[key][lang];
}
