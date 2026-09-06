import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang, t } from "@/lib/lang";

const sectionIds = ["work", "about", "contact"];

const navLinks = [
  { key: "navWork" as const, href: "#work", id: "work" },
  { key: "navAbout" as const, href: "#about", id: "about" },
  { key: "navContact" as const, href: "#contact", id: "contact" },
];

export function Navbar() {
  const { lang, setLang } = useLang();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  /* Scroll progress bar */
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  /* Scroll state */
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Active section via IntersectionObserver */
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.25 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* Scroll progress line */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[1px] bg-primary z-[100] origin-left"
        style={{ scaleX }}
      />

      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b border-transparent",
          isScrolled ? "bg-background/85 backdrop-blur-md border-white/5 py-4" : "bg-transparent py-6"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">

          {/* Logo */}
          <a
            href="#top"
            className="flex items-center gap-3 z-50 group"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          >
            {/* WADAS-Monogramm */}
            <span className="relative inline-flex items-center justify-center h-7 w-7 shrink-0 border border-white/25 group-hover:border-white/60 transition-colors duration-300">
              <span className="font-display font-bold text-[11px] leading-none text-white/70 group-hover:text-white transition-colors duration-300">
                W
              </span>
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-xl font-display font-bold tracking-tight text-foreground">
                ISSAM<span className="text-muted-foreground group-hover:text-primary transition-colors duration-300"> SELMI</span>
              </span>
              <span className="text-[7px] uppercase tracking-[0.32em] text-white/25 group-hover:text-white/45 transition-colors duration-300 mt-1">
                WADAS
              </span>
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={t(link.key, lang)}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors duration-200 relative group",
                  activeSection === link.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={(e) => { e.preventDefault(); scrollTo(link.href); }}
              >
                {t(link.key, lang)}
                <span
                  className={cn(
                    "absolute -bottom-1 left-0 h-[1px] bg-primary transition-all duration-300",
                    activeSection === link.id ? "w-full" : "w-0 group-hover:w-full"
                  )}
                />
              </a>
            ))}

            {/* Availability dot */}
            <button
              type="button"
              onClick={() => setLang(lang === "de" ? "en" : "de")}
              aria-label="Language"
              className="hidden md:flex items-center gap-1 mr-5 text-[10px] uppercase tracking-[0.16em] text-white/30 hover:text-white/70 transition-colors duration-300"
            >
              <span className={lang === "en" ? "text-white/85" : undefined}>EN</span>
              <span className="text-white/20">/</span>
              <span className={lang === "de" ? "text-white/85" : undefined}>DE</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-muted-foreground/60 ml-2">
              <span className="relative flex h-[7px] w-[7px]">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50" />
                <span className="relative inline-flex rounded-full h-[7px] w-[7px] bg-green-500" />
              </span>
              {t("based", lang)}
            </div>
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden z-50 text-foreground p-2 -mr-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Mobile menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 bg-card/95 backdrop-blur-xl border-b border-white/5 p-6 flex flex-col gap-6 md:hidden shadow-2xl"
              >
                {navLinks.map((link, i) => (
                  <motion.a
                    key={t(link.key, lang)}
                    href={link.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-lg font-display font-medium text-foreground hover:text-primary transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      scrollTo(link.href);
                    }}
                  >
                    {t(link.key, lang)}
                  </motion.a>
                ))}
                <div className="flex items-center gap-2 text-xs text-muted-foreground/50 pt-2 border-t border-white/5">
                  <span className="h-[6px] w-[6px] rounded-full bg-green-500" />
                  {t("based", lang)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    </>
  );
}
