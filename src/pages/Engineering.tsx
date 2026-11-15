import { useEffect } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/navbar";
import {
  Grain,
  Cursor,
  PageHeader,
  ContactSection,
  SiteFooter,
  usePageMeta,
} from "@/components/site-chrome";
import { Reveal } from "@/components/motion-primitives";
import { FIELDS, type Bi, type FieldId } from "@/data/portfolio";
import { useLang } from "@/lib/lang";

/* ────────────────────────────────────────────────────────────
   Engineering & Expertise

   Vier getrennte Ebenen, damit nichts groesser aussieht, als es
   ist:
     1  was der Studiengang lehrt (Studienplan, kein Nachweis)
     2  welche Arbeiten auf dieser Seite aus Modulen stammen
     3  was in eigenen Projekten angewendet wurde, mit Beleg
     4  welche Werkzeuge dabei im Einsatz waren

   Jede Zeile unter 3 verweist auf ein Projekt. Steht etwas nicht
   in einem Projekt, steht es nicht hier.
   ──────────────────────────────────────────────────────────── */

const PILLARS: { title: Bi; items: Bi }[] = [
  {
    title: { en: "Mathematics and natural sciences", de: "Mathematisch-naturwissenschaftliche Grundlagen" },
    items: { en: "Mathematics, physics", de: "Mathematik, Physik" },
  },
  {
    title: { en: "Computer science", de: "Informatik" },
    items: {
      en: "Programming, internet fundamentals, computer graphics, authoring systems",
      de: "Programmieren, Internet-Grundlagen, Computergrafik, Autorensysteme",
    },
  },
  {
    title: { en: "Communications engineering", de: "Nachrichtentechnik" },
    items: {
      en: "Electrical engineering, digital signal processing, communications engineering",
      de: "Elektrotechnik, Digitale Signalverarbeitung, Nachrichtentechnik",
    },
  },
  {
    title: { en: "Studio and production", de: "Studio und Produktion" },
    items: { en: "Audio and video technology, media studies", de: "Audio- und Videotechnik, Medienwissenschaft" },
  },
];

const MODULES: { module: string; work: { title: string; to: string }[] }[] = [
  {
    module: "Computergrafik",
    work: [
      { title: "I Need Space", to: "/projects/i-need-space" },
      { title: "Lantern Island", to: "/projects/lantern-island" },
    ],
  },
  { module: "Mediendesign", work: [{ title: "I Need Space", to: "/projects/i-need-space" }] },
  { module: "Computeranimation", work: [{ title: "Lantern Island", to: "/projects/lantern-island" }] },
  { module: "Autorensysteme", work: [{ title: "Lantern Island", to: "/projects/lantern-island" }] },
  { module: "Produktion Digitaler Medien", work: [{ title: "KI Lesebuch", to: "/projects/ki-lesebuch" }] },
];

interface Applied {
  what: Bi;
  where: { title: string; to?: string }[];
}

const LI = { title: "Lantern Island", to: "/projects/lantern-island" };
const SM = { title: "SafeMeet", to: "/projects/safemeet" };
const QR = { title: "Qrib", to: "/projects/qrib" };
const KL = { title: "KI Lesebuch", to: "/projects/ki-lesebuch" };
const INS = { title: "I Need Space", to: "/projects/i-need-space" };
const BL = { title: "Bloomest", to: "/projects/bloomest" };

const APPLIED: Record<FieldId, Applied[]> = {
  software: [
    {
      what: {
        en: "Mobile apps in Flutter and Dart with Firebase Auth and Firestore",
        de: "Mobile Apps in Flutter und Dart mit Firebase Auth und Firestore",
      },
      where: [SM, QR],
    },
    {
      what: {
        en: "Web front ends in React, TypeScript, Vite and Tailwind",
        de: "Web-Front-Ends in React, TypeScript, Vite und Tailwind",
      },
      where: [KL, { title: "E-Sports Event Planner" }, { title: "issamselmi.de" }],
    },
    {
      what: {
        en: "Back end in Express with Drizzle ORM on PostgreSQL, accounts and sessions",
        de: "Back-End in Express mit Drizzle ORM auf PostgreSQL, Konten und Sitzungen",
      },
      where: [KL],
    },
    {
      what: {
        en: "Static site in plain HTML, CSS and JavaScript, three languages, right-to-left layout",
        de: "Statische Website in reinem HTML, CSS und JavaScript, dreisprachig, rechtsläufiges Layout",
      },
      where: [QR],
    },
    {
      what: {
        en: "Calling a language model through its API",
        de: "Anbindung eines Sprachmodells über dessen API",
      },
      where: [KL, { title: "E-Sports Event Planner" }],
    },
  ],
  engineering: [
    {
      what: {
        en: "Unity 6 (URP): Humanoid avatar, Animator blend tree, CharacterController, Input System, C# scripts",
        de: "Unity 6 (URP): Humanoid-Avatar, Animator mit Blend-Tree, CharacterController, Input System, C#-Skripte",
      },
      where: [LI],
    },
    {
      what: {
        en: "Reading a frame: Frame Debugger passes, draw calls, instancing, texture memory",
        de: "Einen Frame lesen: Passes im Frame Debugger, Draw Calls, Instancing, Texturspeicher",
      },
      where: [LI],
    },
    {
      what: {
        en: "Narrowing faults down from logs and measured values",
        de: "Fehler über Logs und Messwerte eingrenzen",
      },
      where: [LI],
    },
    {
      what: {
        en: "Server-side watchdog, Android foreground service, alarm SMS with a fallback provider",
        de: "Serverseitiger Watchdog, Android-Vordergrunddienst, Alarm-SMS mit Ausweichanbieter",
      },
      where: [SM],
    },
  ],
  "3d": [
    {
      what: {
        en: "Modelling, UV mapping, texturing, lighting and rendering in Maya, Substance Painter and Arnold",
        de: "Modellierung, UV-Mapping, Texturierung, Licht und Rendering in Maya, Substance Painter und Arnold",
      },
      where: [LI, { title: "Future!comeback" }],
    },
    {
      what: {
        en: "Procedural distribution with MASH, toon shading with aiToon, colour management in ACEScg",
        de: "Prozedurale Verteilung mit MASH, Toon-Shading mit aiToon, Farbmanagement in ACEScg",
      },
      where: [LI],
    },
    {
      what: {
        en: "Rebuilding a rendered scene as a game-ready asset",
        de: "Eine gerenderte Szene als Game-Ready-Asset neu aufbauen",
      },
      where: [LI],
    },
    {
      what: { en: "Hair and fur with XGen", de: "Haare und Fell mit XGen" },
      where: [{ title: "Character Studies", to: "/projects/character-studies" }],
    },
  ],
  design: [
    {
      what: {
        en: "Compositing and prepress in Photoshop: masks, curves, CMYK at 300 dpi",
        de: "Compositing und Druckvorstufe in Photoshop: Masken, Gradationskurven, CMYK bei 300 dpi",
      },
      where: [INS],
    },
    {
      what: {
        en: "A poster system for a client, in three formats and three languages",
        de: "Ein Plakatsystem für einen Kunden, in drei Formaten und drei Sprachen",
      },
      where: [BL],
    },
    {
      what: { en: "Interface design for mobile apps", de: "Oberflächengestaltung für mobile Apps" },
      where: [SM, QR],
    },
    {
      what: {
        en: "Camera work and post-production in Premiere Pro",
        de: "Kameraführung und Postproduktion in Premiere Pro",
      },
      where: [{ title: "Abschlussfeier" }],
    },
  ],
};

const TOOLS: { group: Bi; items: string[] }[] = [
  {
    group: { en: "Languages and frameworks", de: "Sprachen und Frameworks" },
    items: ["C#", "Dart · Flutter", "TypeScript · React", "HTML · CSS · JavaScript", "Express.js", "PostgreSQL · Drizzle ORM", "Firebase · Firestore"],
  },
  {
    group: { en: "Engines", de: "Engines" },
    items: ["Unity 6 · URP", "Unreal Engine"],
  },
  {
    group: { en: "3D", de: "3D" },
    items: ["Autodesk Maya", "Arnold", "Substance Painter", "XGen", "MASH"],
  },
  {
    group: { en: "Image, layout, video", de: "Bild, Satz, Video" },
    items: ["Photoshop", "Illustrator", "InDesign", "After Effects", "Premiere Pro"],
  },
];

function Block({
  n,
  title,
  note,
  children,
}: {
  n: string;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-white/[0.05] py-16 md:py-24">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-x-16 gap-y-8">
        <Reveal direction="up" className="lg:col-span-4">
          <p className="font-mono text-[10px] text-white/25 tabular-nums mb-4">{n}</p>
          <h2
            className="font-display font-bold text-white leading-[1.08]"
            style={{ fontSize: "clamp(1.5rem, 2.6vw, 2.2rem)", letterSpacing: "-0.02em" }}
          >
            {title}
          </h2>
          {note && (
            <p className="mt-4 text-[12px] font-light leading-[1.8] text-white/40 max-w-sm">
              {note}
            </p>
          )}
        </Reveal>
        <div className="lg:col-span-8">{children}</div>
      </div>
    </section>
  );
}

export default function Engineering() {
  const { lang } = useLang();
  const de = lang === "de";

  usePageMeta(
    "Engineering & Expertise",
    de
      ? "Medientechnik (B.Eng., angestrebt) an der Hochschule Emden/Leer: Studieninhalte, angewandtes Wissen und Werkzeuge von Issam Selmi."
      : "Media Technology (B.Eng., in progress) at Hochschule Emden/Leer: programme content, applied knowledge and tools of Issam Selmi.",
  );

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="bg-background min-h-screen text-foreground selection:bg-white/20">
      <Grain />
      <Cursor />
      <Navbar />

      <PageHeader
        kicker="Engineering & Expertise"
        title={de ? "Medientechnik, Bachelor of Engineering" : "Media Technology, Bachelor of Engineering"}
        intro={
          de
            ? "Ich studiere Medientechnik an der Hochschule Emden/Leer, Abschlussziel Bachelor of Engineering. Diese Seite hält auseinander, was der Studiengang lehrt, was ich davon in Projekten angewendet habe und womit ich arbeite."
            : "I study Media Technology at Hochschule Emden/Leer, working towards a Bachelor of Engineering. This page keeps apart what the programme teaches, what I have applied in projects, and what I work with."
        }
      />

      <Block
        n="01"
        title={de ? "Inhalte des Studiengangs" : "Programme content"}
        note={
          de
            ? "Aufbau laut Studienplan. Das ist Lehrinhalt, kein Nachweis einzelner Leistungen."
            : "Structure according to the curriculum. This is taught content, not a record of individual grades."
        }
      >
        <dl className="border-t border-white/[0.07]">
          {PILLARS.map((p) => (
            <div
              key={p.title.en}
              className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-1 py-5 border-b border-white/[0.07]"
            >
              <dt className="md:col-span-5 font-display font-medium text-white/85">{p.title[lang]}</dt>
              <dd className="md:col-span-7 text-sm font-light leading-[1.8] text-white/50">{p.items[lang]}</dd>
            </div>
          ))}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-1 py-5 border-b border-white/[0.07]">
            <dt className="md:col-span-5 font-display font-medium text-white/85">
              {de ? "Vertiefung" : "Specialisation"}
            </dt>
            <dd className="md:col-span-7 text-sm font-light leading-[1.8] text-white/50">
              {de
                ? "Zertifikat Computer-Aided Media Production. Drei von vier Modulen abgeschlossen."
                : "Certificate in Computer-Aided Media Production. Three of four modules completed."}
            </dd>
          </div>
        </dl>
      </Block>

      <Block
        n="02"
        title={de ? "Aus Modulen entstanden" : "Work out of modules"}
        note={
          de
            ? "Module, zu denen auf dieser Seite eine Arbeit steht."
            : "Modules that have a piece of work on this site."
        }
      >
        <ul className="border-t border-white/[0.07]">
          {MODULES.map((m) => (
            <li
              key={m.module}
              className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-1 py-5 border-b border-white/[0.07]"
            >
              <span className="md:col-span-5 font-display font-medium text-white/85" lang="de">
                {m.module}
              </span>
              <span className="md:col-span-7 flex flex-wrap gap-x-6 gap-y-1">
                {m.work.map((w) => (
                  <Link key={w.to} href={w.to}>
                    <a className="text-sm font-light text-white/60 hover:text-white underline decoration-white/20 underline-offset-4 transition-colors duration-300">
                      {w.title}
                    </a>
                  </Link>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </Block>

      <Block
        n="03"
        title={de ? "In Projekten angewendet" : "Applied in projects"}
        note={
          de
            ? "Jede Zeile nennt das Projekt, in dem sie nachzusehen ist."
            : "Each line names the project where it can be checked."
        }
      >
        <div className="space-y-12">
          {FIELDS.map((f) => (
            <div key={f.id}>
              <h3 className="text-[10px] uppercase tracking-[0.24em] text-white/40 mb-4">
                {f.label[lang]}
              </h3>
              <ul className="border-t border-white/[0.07]">
                {APPLIED[f.id].map((a) => (
                  <li
                    key={a.what.en}
                    className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-2 py-4 border-b border-white/[0.07]"
                  >
                    <span className="md:col-span-8 text-sm font-light leading-[1.75] text-white/70">
                      {a.what[lang]}
                    </span>
                    <span className="md:col-span-4 flex flex-wrap gap-x-4 gap-y-1 md:justify-end">
                      {a.where.map((w) =>
                        w.to ? (
                          <Link key={w.title} href={w.to}>
                            <a className="text-[11px] text-white/50 hover:text-white underline decoration-white/20 underline-offset-4 transition-colors duration-300">
                              {w.title}
                            </a>
                          </Link>
                        ) : (
                          <span key={w.title} className="text-[11px] text-white/35">
                            {w.title}
                          </span>
                        ),
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Block>

      <Block
        n="04"
        title={de ? "Werkzeuge" : "Tools"}
        note={
          de
            ? "Womit die Projekte auf dieser Seite gebaut wurden. Unreal Engine bisher nur für Tests in Future!comeback."
            : "What the projects on this site were built with. Unreal Engine so far only for tests in Future!comeback."
        }
      >
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-10">
          {TOOLS.map((g) => (
            <div key={g.group.en}>
              <dt className="text-[10px] uppercase tracking-[0.24em] text-white/40 mb-4">{g.group[lang]}</dt>
              <dd>
                <ul className="space-y-2">
                  {g.items.map((i) => (
                    <li key={i} className="text-sm font-light text-white/70">
                      {i}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </Block>

      <Block n="05" title={de ? "Sprachen" : "Languages"}>
        <dl className="border-t border-white/[0.07]">
          {[
            ["Arabisch", "Arabic", "Muttersprache", "native"],
            ["Deutsch", "German", "fließend", "fluent"],
            ["Englisch", "English", "fließend", "fluent"],
            ["Französisch", "French", "fließend", "fluent"],
          ].map(([d, e, ld, le]) => (
            <div key={e} className="flex items-baseline justify-between gap-8 py-4 border-b border-white/[0.07]">
              <dt className="font-display font-medium text-white/85">{de ? d : e}</dt>
              <dd className="text-sm font-light text-white/50">{de ? ld : le}</dd>
            </div>
          ))}
        </dl>
      </Block>

      <ContactSection />
      <SiteFooter />
    </div>
  );
}
