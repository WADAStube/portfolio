import { projectsData, type Project } from "@/data/projects";

/* ────────────────────────────────────────────────────────────
   PORTFOLIO-STRUKTUR

   projects.ts haelt die Inhalte der einzelnen Arbeiten. Diese
   Datei legt fest, wie sie geordnet werden:

   - vier Fachrichtungen, ein Projekt darf in mehreren stehen
   - Stand: fertig gezeigt, in Arbeit, in Ueberarbeitung
   - Adresse unter /projects/<slug>
   - Fallstudie fuer die wichtigen Projekte
   - weitere Arbeiten, zu denen es noch kein Bildmaterial gibt

   Alles, was hier steht, ist belegt: aus den Projektdaten, dem
   Lebenslauf oder den Projektberichten. Was nicht belegt ist,
   steht in OFFENE-PUNKTE.md und nicht auf der Seite.
   ──────────────────────────────────────────────────────────── */

export type FieldId = "software" | "engineering" | "3d" | "design";
export type Status = "complete" | "wip" | "soon";

export interface Bi {
  en: string;
  de: string;
}

export const FIELDS: { id: FieldId; label: Bi; sub: Bi }[] = [
  {
    id: "software",
    label: { en: "Software & Applications", de: "Software & Anwendungen" },
    sub: {
      en: "Apps and web applications, from the data model to the interface.",
      de: "Apps und Web-Anwendungen, vom Datenmodell bis zur Oberfläche.",
    },
  },
  {
    id: "engineering",
    label: { en: "Engineering & Real-Time", de: "Engineering & Echtzeit" },
    sub: {
      en: "Systems that have to run live: engine scenes, alert pipelines, measured budgets.",
      de: "Systeme, die live laufen müssen: Engine-Szenen, Alarmketten, gemessene Budgets.",
    },
  },
  {
    id: "3d",
    label: { en: "3D & Visualization", de: "3D & Visualisierung" },
    sub: {
      en: "Modelling, shading, lighting and rendering in Maya, Arnold and Unity.",
      de: "Modellierung, Shading, Licht und Rendering in Maya, Arnold und Unity.",
    },
  },
  {
    id: "design",
    label: { en: "Design & Media", de: "Gestaltung & Medien" },
    sub: {
      en: "Interface design, poster and print, camera and post-production.",
      de: "Oberflächen, Plakat und Druck, Kamera und Postproduktion.",
    },
  },
];

export const fieldLabel = (id: FieldId) =>
  FIELDS.find((f) => f.id === id)!.label;

/* ────────────────── Einordnung der Projekte ────────────────── */

interface Meta {
  slug: string;
  fields: FieldId[];
  status: Status;
  /** Titelbild der Karte. "contain" fuer Hochformate, die sonst
      beschnitten wuerden (Handy-Screens, Plakate). */
  cover?: { src: string; fit: "cover" | "contain" };
  /** Reihenfolge auf der Startseite; fehlt der Wert, steht das
      Projekt nur auf der Projektseite. */
  home?: number;
}

const META: Record<string, Meta> = {
  "poor-house": {
    slug: "lantern-island",
    fields: ["3d", "engineering"],
    status: "complete",
    cover: { src: "/images/projects/poor-house/hero-shaded.jpg", fit: "cover" },
    home: 1,
  },
  safemeet: {
    slug: "safemeet",
    fields: ["software", "engineering", "design"],
    status: "complete",
    cover: { src: "/images/projects/safemeet/01_startseite.jpg", fit: "contain" },
    home: 2,
  },
  "qrib-web": {
    slug: "qrib",
    fields: ["software", "design"],
    status: "complete",
    cover: { src: "/images/projects/qrib-web/01.jpg", fit: "cover" },
    home: 4,
  },
  "campus-quest": {
    slug: "campus-quest",
    fields: ["software", "design", "engineering"],
    status: "complete",
    cover: { src: "/images/projects/campus-quest/still-studio.jpg", fit: "cover" },
    home: 3,
  },
  "ki-lesebuch": {
    slug: "ki-lesebuch",
    fields: ["software"],
    status: "complete",
    cover: { src: "/images/projects/ki-lesebuch/01.jpg", fit: "cover" },
    home: 5,
  },
  "i-need-space": {
    slug: "i-need-space",
    fields: ["design"],
    status: "complete",
    cover: { src: "/images/projects/i-need-space/01.jpg", fit: "contain" },
    home: 6,
  },
  bloomest: {
    slug: "bloomest",
    fields: ["design"],
    status: "complete",
    cover: { src: "/images/projects/bloomest/01.jpg", fit: "contain" },
  },
  "asset-studies": { slug: "security-camera", fields: ["3d"], status: "soon" },
  "futuristic-bunker": { slug: "futuristic-bunker", fields: ["3d"], status: "soon" },
  "robot-study": { slug: "robot-study", fields: ["3d"], status: "soon" },
  apocalypse: { slug: "apocalypse", fields: ["3d"], status: "soon" },
  "character-studies": { slug: "character-studies", fields: ["3d"], status: "soon" },
  "isometric-room": { slug: "isometric-room", fields: ["3d"], status: "soon" },
  "motion-design": { slug: "motion-design", fields: ["design"], status: "soon" },
};

export interface Entry {
  project: Project;
  slug: string;
  fields: FieldId[];
  status: Status;
  cover?: { src: string; fit: "cover" | "contain" };
  home?: number;
}

/** Alle Projekte aus projects.ts mit ihrer Einordnung. Ein Projekt
    ohne Eintrag in META faellt nicht weg: es erscheint als
    "in Ueberarbeitung" unter 3D, damit nichts unbemerkt verschwindet. */
export const ENTRIES: Entry[] = projectsData.map((project) => {
  const m = META[project.id] ?? {
    slug: project.id,
    fields: ["3d"] as FieldId[],
    status: "soon" as Status,
  };
  /* Ohne festgelegtes Titelbild: erstes Bild, sonst die linke
     Seite des Vergleichs. Projekte ohne jedes Bild bleiben ohne. */
  const first = project.shots[0]?.src ?? project.compare?.before.src;
  const cover = m.cover ?? (first ? { src: first, fit: "cover" as const } : undefined);
  return { project, ...m, cover };
});

/** Fuer die Detailseite: ein Projekt, dessen Ausarbeitung noch
    folgt, zeigt dort trotzdem sein vorhandenes Bildmaterial. */
export const hasMedia = (p: Project) =>
  p.shots.length > 0 ||
  !!p.compare ||
  !!p.walkthrough?.length ||
  !!p.showpiece ||
  !!p.sequence;

export const entryBySlug = (slug: string) =>
  ENTRIES.find((e) => e.slug === slug || e.project.id === slug);

export const pathOf = (e: Entry) => `/projects/${e.slug}`;

/* ────────────────── Weitere Arbeiten ──────────────────
   Belegt durch Lebenslauf und Projektunterlagen, aber ohne
   Bildmaterial im Repository. Sie stehen als Zeilen auf der
   Projektseite, nicht als Karten.
   ──────────────────────────────────────────────────────────── */

export interface MinorWork {
  id: string;
  title: string;
  kind: Bi;
  body: Bi;
  tools: string[];
  fields: FieldId[];
  status: Status;
}

export const MINOR: MinorWork[] = [
  {
    id: "future-comeback",
    title: "Future!comeback",
    kind: { en: "3D character & environment", de: "3D-Charakter & Environment" },
    body: {
      en: "A cinematic scene with two characters in a lab. Modelling, rigging, UV mapping, texturing, lighting and rendering are mine; the assets are also tested in Unreal Engine for a game-ready workflow.",
      de: "Eine cinematische Szene mit zwei Charakteren in einem Labor. Modellierung, Rigging, UV-Mapping, Texturierung, Licht und Rendering liegen bei mir; die Assets werden zusätzlich in der Unreal Engine für einen Game-Ready-Workflow getestet.",
    },
    tools: ["Maya", "Substance Painter", "Arnold", "After Effects", "Unreal Engine"],
    fields: ["3d", "engineering"],
    status: "wip",
  },
  {
    id: "esports-planner",
    title: "E-Sports Event Planner",
    kind: { en: "Web application · group project", de: "Web-Anwendung · Gruppenprojekt" },
    body: {
      en: "A planning tool for a student e-sports event, built for a group of thirteen: a navigator through the planning sections, plan generation through a language model, role assignment, notes, PDF export, storage in the browser.",
      de: "Ein Planungswerkzeug für ein studentisches E-Sports-Event, gebaut für eine Gruppe von dreizehn: Navigation durch die Planungsbereiche, Planerstellung über ein Sprachmodell, Rollenverteilung, Notizen, PDF-Export, Speicherung im Browser.",
    },
    tools: ["React", "TypeScript", "Vite"],
    fields: ["software"],
    status: "complete",
  },
  {
    id: "esports-overlays",
    title: "E-Sports Event",
    kind: { en: "Graphics & overlay design", de: "Grafik & Overlay-Design" },
    body: {
      en: "Stream overlays, visual elements and 3D animations for the livestream of a student e-sports event, worked out with the event and streaming team.",
      de: "Stream-Overlays, visuelle Elemente und 3D-Animationen für den Livestream eines studentischen E-Sports-Events, abgestimmt mit dem Event- und Streaming-Team.",
    },
    tools: ["After Effects", "Maya"],
    fields: ["design", "3d"],
    status: "complete",
  },
  {
    id: "abschlussfeier",
    title: "Abschlussfeier",
    kind: { en: "Audiovisual production · team of eight", de: "Audiovisuelle Produktion · Team von acht" },
    body: {
      en: "Recording of a graduation ceremony. Camera set-up and camera operation were mine, plus support on lighting, audio and directing; post-production in Premiere Pro.",
      de: "Aufzeichnung einer Abschlussveranstaltung. Kameraaufbau und Kameraführung lagen bei mir, dazu Unterstützung bei Licht, Ton und Regie; Postproduktion in Premiere Pro.",
    },
    tools: ["Premiere Pro"],
    fields: ["design"],
    status: "complete",
  },
  {
    id: "gambia-insight",
    title: "Gambia Insight",
    kind: { en: "Media project · student team", de: "Medienprojekt · studentisches Team" },
    body: {
      en: "A media project accompanying a media installation at a school in Sukuta, Gambia, including a podcast produced by the team.",
      de: "Ein Medienprojekt zur Begleitung einer Medieninstallation an einer Schule in Sukuta in Gambia, einschließlich eines Podcasts, den das Team produziert hat.",
    },
    tools: [],
    fields: ["design"],
    status: "complete",
  },
  {
    id: "h5p-licht",
    title: "Grundbegriffe Licht",
    kind: { en: "Interactive learning course · H5P", de: "Interaktiver Lernkurs · H5P" },
    body: {
      en: "A frame-based learning course on the basic terms of light, built as an H5P course presentation with six content types and my own infographics.",
      de: "Ein Lernkurs zu den Grundbegriffen des Lichts, aufgebaut als H5P Course Presentation mit sechs Inhaltstypen und eigenen Infografiken.",
    },
    tools: ["H5P", "Lumi"],
    fields: ["design", "software"],
    status: "complete",
  },
];

/* ────────────────── Fallstudien ──────────────────
   Aufbau: Aufgabe, Ansatz, Umsetzung, Entscheidungen, Ergebnis.
   "learned" und "state" nur, wo es dazu eine Quelle gibt.
   ──────────────────────────────────────────────────────────── */

export interface CaseStudy {
  challenge: Bi;
  approach: Bi;
  implementation: Bi;
  decisions: Bi[];
  outcome: Bi;
  /** Mein Anteil */
  share: Bi;
  learned?: Bi;
  /** Ehrlicher Stand, wo ein Projekt nicht abgeschlossen ist */
  state?: Bi;
}

export const CASES: Record<string, CaseStudy> = {
  "poor-house": {
    challenge: {
      en: "A stylised environment that works twice: as a rendered still, and as the same scene running in real time in a game engine.",
      de: "Eine stilisierte Umgebung, die zweimal funktioniert: als gerendertes Standbild und als dieselbe Szene in Echtzeit in einer Game Engine.",
    },
    approach: {
      en: "Build the diorama in Maya and render it in Arnold with a cel-shaded look. Then rebuild it as a game-ready asset, move it into Unity 6, and turn it into something that can be played: a character who walks through the scene, picks things up and lights the lanterns.",
      de: "Das Diorama in Maya bauen und in Arnold mit Cel-Shading rendern. Danach als Game-Ready-Asset neu aufbauen, nach Unity 6 bringen und daraus etwas Spielbares machen: eine Figur, die sich durch die Szene bewegt, Dinge aufnimmt und die Laternen anzündet.",
    },
    implementation: {
      en: "Maya: box modelling, vegetation distributed procedurally with MASH, aiToon shading with per-material contour settings, colour management in ACEScg. Unity 6 (URP): Humanoid avatar, Animator with a 1D blend tree, CharacterController, the new Input System, and C# scripts for movement, picking up, aiming and throwing.",
      de: "Maya: Box-Modeling, Vegetation prozedural über MASH verteilt, aiToon-Shading mit Kontureinstellungen je Material, Farbmanagement in ACEScg. Unity 6 (URP): Humanoid-Avatar, Animator mit 1D-Blend-Tree, CharacterController, das neue Input System und C#-Skripte für Bewegung, Aufnehmen, Zielen und Werfen.",
    },
    decisions: [
      {
        en: "Cel shading instead of texture maps. In the engine the scene needs 30.4 MB of texture memory.",
        de: "Cel-Shading statt Texturkarten. In der Engine braucht die Szene 30,4 MB Texturspeicher.",
      },
      {
        en: "Vegetation density painted by hand. Even scatter reads as artificial.",
        de: "Dichte der Vegetation von Hand gemalt. Gleichmäßige Streuung wirkt künstlich.",
      },
      {
        en: "Object detection with Physics.OverlapSphere instead of a raycast, because the third-person camera looks at the character and the ray kept hitting her.",
        de: "Objekterkennung über Physics.OverlapSphere statt Raycast, weil die Third-Person-Kamera auf den Character blickt und der Strahl immer ihn traf.",
      },
      {
        en: "Scale corrected from a measurement (factor 42.5), for character and scene together.",
        de: "Skalierung aus einer Messung korrigiert (Faktor 42,5), für Character und Szene gemeinsam.",
      },
    ],
    outcome: {
      en: "Arnold stills and a turntable, and a playable game published on itch.io: eleven lanterns to light, glimmers to call and send out, a satchel and health. Read off the editor statistics: 6,063k triangles, 54 set-pass calls, 1,327 draw calls, 1,309 of them instanced. Crouch and slide are deferred.",
      de: "Arnold-Standbilder und ein Turntable, dazu ein spielbares Spiel auf itch.io: elf Laternen zum Anzünden, Glimmer zum Rufen und Losschicken, eine Tasche und Lebenspunkte. Aus der Editor-Statistik abgelesen: 6 063k Dreiecke, 54 Set-Pass-Calls, 1 327 Draw Calls, davon 1 309 instanziert. Ducken und Rutschen sind zurückgestellt.",
    },
    share: {
      en: "My own project, from modelling to the Unity port. The base tree models are licensed and were re-shaded.",
      de: "Eigenes Projekt, von der Modellierung bis zur Unity-Portierung. Die Basismodelle der Bäume sind lizenziert und wurden neu geshadet.",
    },
    learned: {
      en: "Narrow a fault down from logs and measured values before changing anything. All five engine problems were solved that way.",
      de: "Einen Fehler erst über Logs und Messwerte eingrenzen und dann ändern. Alle fünf Engine-Probleme wurden so gelöst.",
    },
  },

  safemeet: {
    challenge: {
      en: "Someone meeting a stranger, walking home or looking after a relative wants another person to know where they are, without permanent tracking. And an alarm has to reach the contacts even when the phone can no longer send it.",
      de: "Wer eine fremde Person trifft, nachts nach Hause geht oder auf Angehörige achtet, möchte, dass jemand weiß, wo er ist, ohne dauerhaft geortet zu werden. Und ein Alarm muss die Kontakte auch dann erreichen, wenn das Handy ihn nicht mehr senden kann.",
    },
    approach: {
      en: "One control: a circle. Tap starts a session, hold raises the alarm. During a session the app asks at intervals whether everything is fine, and a server keeps watching when the phone goes silent.",
      de: "Ein Bedienelement: ein Kreis. Tippen startet eine Sitzung, Halten löst den Alarm aus. Während der Sitzung fragt die App in Abständen nach, und ein Server wacht weiter, wenn das Handy verstummt.",
    },
    implementation: {
      en: "Flutter and Dart for the app, Firebase Auth and Firestore for accounts and data, a server-side watchdog for missed check-ins, alarm SMS through a provider with a fallback. On Android a foreground service keeps the session running with the screen locked. Contacts follow a session on a live page in the browser. The interface is available in eight languages.",
      de: "Flutter und Dart für die App, Firebase Auth und Firestore für Konten und Daten, ein serverseitiger Watchdog für ausbleibende Rückmeldungen, Alarm-SMS über einen Anbieter mit Ausweichanbieter. Auf Android hält ein Vordergrunddienst die Sitzung bei gesperrtem Bildschirm am Laufen. Kontakte verfolgen eine Sitzung über eine Live-Seite im Browser. Die Oberfläche gibt es in acht Sprachen.",
    },
    decisions: [
      {
        en: "Silence triggers the alarm, not a button. A missed check-in escalates on its own.",
        de: "Schweigen löst aus, nicht ein Knopf. Eine ausbleibende Rückmeldung eskaliert von selbst.",
      },
      {
        en: "Alarm in stages: unclear, query to the user, warning to the contacts, emergency. This is meant to cut false alarms. SOS and the duress PIN skip the stages.",
        de: "Alarm in Stufen: ungeklärt, Rückfrage an den Nutzer, Warnung an die Kontakte, Notfall. Das soll Fehlalarme verringern. SOS und Zwangs-PIN überspringen die Stufen.",
      },
      {
        en: "The duress PIN looks like a cancel and sends a silent alarm.",
        de: "Die Zwangs-PIN sieht aus wie ein Abbruch und sendet stillen Alarm.",
      },
      {
        en: "Safety, not surveillance: sharing is switched on by the user, saved places stay on the device.",
        de: "Sicherheit, keine Überwachung: Teilen schaltet der Nutzer selbst ein, gespeicherte Orte bleiben auf dem Gerät.",
      },
      {
        en: "No automatic emergency calls, and no model decides whether something is an emergency.",
        de: "Keine automatischen Notrufe, und kein Modell entscheidet, ob ein Notfall vorliegt.",
      },
    ],
    outcome: {
      en: "A working development version for Android with check-in, live session, staged alarm, family mode and the live page for contacts.",
      de: "Eine lauffähige Entwicklungsversion für Android mit Check-in, Live-Sitzung, gestuftem Alarm, Familienmodus und der Live-Seite für Kontakte.",
    },
    state: {
      en: "Not released. Tests so far ran in the emulator and on my own phone; the test plan on several real devices, the data-protection review and the store release are still open. The safety functions have not been independently verified.",
      de: "Nicht veröffentlicht. Getestet wurde bisher im Emulator und auf dem eigenen Handy; der Testplan auf mehreren echten Geräten, die Datenschutzprüfung und die Store-Freigabe stehen noch aus. Die Sicherheitsfunktionen sind nicht unabhängig geprüft.",
    },
    share: {
      en: "My own product: concept, interface design and development.",
      de: "Eigenprodukt: Konzept, Gestaltung der Oberfläche und Entwicklung.",
    },
  },

  "qrib-web": {
    challenge: {
      en: "A marketplace for services depends on trust between strangers. This one also has to work in three languages, one of them written right to left.",
      de: "Ein Marktplatz für Dienstleistungen hängt am Vertrauen zwischen Fremden. Dieser muss außerdem in drei Sprachen funktionieren, eine davon rechtsläufig.",
    },
    approach: {
      en: "The customer describes a problem and providers answer with a price. Reputation is one calculated score built from six rating dimensions. The platform is free for customers; providers pay credits per answer.",
      de: "Der Kunde beschreibt ein Problem, Anbieter antworten mit einem Preis. Reputation ist eine berechnete Zahl aus sechs Bewertungsdimensionen. Für Kunden ist die Plattform kostenlos; Anbieter zahlen Guthaben pro Antwort.",
    },
    implementation: {
      en: "The app in Flutter with Firebase behind it, with a customer side and a provider side. The public website: nineteen pages in plain HTML, CSS and JavaScript without a framework. Both in French, English and Arabic, with a mirrored layout for Arabic.",
      de: "Die App in Flutter mit Firebase dahinter, mit Kunden- und Anbieterseite. Der öffentliche Auftritt: neunzehn Seiten in reinem HTML, CSS und JavaScript ohne Framework. Beides auf Französisch, Englisch und Arabisch, für Arabisch mit gespiegeltem Layout.",
    },
    decisions: [
      {
        en: "The score cannot be bought; a subscription does not raise it.",
        de: "Der Score ist nicht käuflich; ein Abo hebt ihn nicht.",
      },
      {
        en: "Verification in levels, each stating what was checked.",
        de: "Verifizierung in Stufen, jede sagt, was geprüft wurde.",
      },
      {
        en: "The price range on a profile comes from completed jobs.",
        de: "Die Preisspanne im Profil stammt aus abgeschlossenen Aufträgen.",
      },
      {
        en: "No provider sees a request before the customer sends it.",
        de: "Kein Anbieter sieht eine Anfrage, bevor der Kunde sie abschickt.",
      },
      {
        en: "Credits can be bought with a kiosk card, for users without a bank card.",
        de: "Guthaben gibt es auch per Kiosk-Karte, für Nutzer ohne Bankkarte.",
      },
    ],
    outcome: {
      en: "Implemented: the app with both sides, and the website with nineteen pages in three languages.",
      de: "Umgesetzt: die App mit beiden Seiten und die Website mit neunzehn Seiten in drei Sprachen.",
    },
    share: {
      en: "Design and development of app and website.",
      de: "Gestaltung und Entwicklung von App und Website.",
    },
  },

  "campus-quest": {
    challenge: {
      en: "New media students meet the TV studio, the control room and the audio rooms all at once, with expensive equipment and little time to practise on it.",
      de: "Studierende treffen am Anfang auf Fernsehstudio, Bildregie und Aufnahmeräume gleichzeitig, auf teure Technik und wenig Zeit, sie zu üben.",
    },
    approach: {
      en: "Let them run the whole workflow once before they touch anything, inside 360° photographs of the real rooms. Two tasks in two buildings, and the player decides the order.",
      de: "Den ganzen Ablauf einmal durchspielen lassen, bevor jemand etwas anfasst, in 360°-Aufnahmen der echten Räume. Zwei Aufträge in zwei Gebäuden, die Reihenfolge bestimmt der Spieler.",
    },
    implementation: {
      en: "Built in PaneoVR, a node-based authoring tool: every scene is a panorama, every hotspot, quiz and condition a node. 59 scenes, 42 panoramas, more than 280 interactive elements and 22 state flags, without a line of code. Inventory, quizzes, checklists and hints are all graph logic.",
      de: "Gebaut in PaneoVR, einem knotenbasierten Autorenwerkzeug: Jede Szene ist ein Panorama, jeder Hotspot, jedes Quiz und jede Bedingung ein Knoten. 59 Szenen, 42 Panoramen, über 280 interaktive Elemente und 22 Zustandsmerker, ohne eine Zeile Code. Inventar, Quizfragen, Checklisten und Hinweise sind Logik im Graphen.",
    },
    decisions: [
      {
        en: "Free task order instead of a guided tour, although the tool is built for linear tours.",
        de: "Freie Reihenfolge statt geführter Rundgang, obwohl das Werkzeug für lineare Rundgänge gebaut ist.",
      },
      {
        en: "State changes happen only in one-time confirmation scenes. Rooms every route passes through read state, they never write it.",
        de: "Zustandsänderungen nur in einmaligen Bestätigungsszenen. Räume, durch die jeder Weg führt, lesen den Zustand, schreiben ihn aber nie.",
      },
      {
        en: "Game logic runs on progress flags alone; the inventory is a display layer and decides nothing.",
        de: "Die Spiellogik hängt allein an Fortschrittsmerkern; das Inventar ist Anzeige und entscheidet nichts.",
      },
      {
        en: "Three kinds of text with one job each: task, knowledge, checklist. Anything depending on progress belongs in a checklist, not a popup.",
        de: "Drei Textsorten mit je einer Aufgabe: Auftrag, Wissen, Checkliste. Was vom Fortschritt abhängt, gehört in die Checkliste, nicht in eine Einblendung.",
      },
    ],
    outcome: {
      en: "A playable game covering the camera setup, the vision mixer, the recording, the audio recording in the other building and the submission. Before each build the graph was checked against all reachable game states, around 2,500, for dead ends, lost progress and steps that could be skipped.",
      de: "Ein spielbares Spiel über Kameraaufbau, Bildregie, Aufnahme, Tonaufnahme im anderen Gebäude und Abgabe. Vor jedem Build wurde der Graph gegen alle erreichbaren Spielstände geprüft, rund 2 500, auf Sackgassen, verlorenen Fortschritt und überspringbare Schritte.",
    },
    share: {
      en: "Group project in the module Interaktive Medien 2. The team did concept, storyboard and the panorama shoots; the PaneoVR implementation and the game logic are mine.",
      de: "Gruppenarbeit im Modul Interaktive Medien 2. Konzept, Storyboard und die Panorama-Aufnahmen kommen aus dem Team; die Umsetzung in PaneoVR und die Spiellogik sind meine Arbeit.",
    },
    learned: {
      en: "The hard part was not the tool. It was designing states that survive any order of play — and that holds in any engine.",
      de: "Das Schwierige war nicht das Werkzeug, sondern Zustände zu entwerfen, die jede Reihenfolge überstehen. Das gilt in jeder Engine gleich.",
    },
  },

  "ki-lesebuch": {
    challenge: {
      en: "The module brief: design and build a complete digital product. The product chosen: learning a language by reading instead of by vocabulary lists.",
      de: "Die Aufgabe des Moduls: ein vollständiges digitales Produkt entwerfen und umsetzen. Das gewählte Produkt: eine Sprache über Lesen lernen statt über Vokabellisten.",
    },
    approach: {
      en: "Short stories generated for a chosen language and CEFR level. Every sentence opens its translation in place, a grammar panel breaks it into word class and tense, single words lead to synonyms and examples. A quiz mode sits next to it.",
      de: "Kurzgeschichten, erzeugt für eine gewählte Sprache und GER-Stufe. Jeder Satz öffnet seine Übersetzung an Ort und Stelle, eine Grammatiktafel zerlegt ihn in Wortart und Zeitform, einzelne Wörter führen zu Synonymen und Beispielen. Daneben ein Quizmodus.",
    },
    implementation: {
      en: "Front end in React, TypeScript, Vite and Tailwind. Back end in Express with Drizzle ORM on PostgreSQL. Stories come from a language model through its API. User accounts with sessions. Without a configured database the server falls back to in-memory storage, so the app still starts.",
      de: "Front-End in React, TypeScript, Vite und Tailwind. Back-End in Express mit Drizzle ORM auf PostgreSQL. Die Geschichten kommen von einem Sprachmodell über dessen API. Benutzerkonten mit Sitzungen. Ohne eingerichtete Datenbank weicht der Server auf Arbeitsspeicher aus, die Anwendung startet trotzdem.",
    },
    decisions: [
      {
        en: "The level steers vocabulary and sentence length of the generated story.",
        de: "Die Stufe steuert Wortschatz und Satzlänge der erzeugten Geschichte.",
      },
      {
        en: "Translation opens inside the text, so the reader does not switch between two texts.",
        de: "Die Übersetzung öffnet sich im Text, der Leser wechselt nicht zwischen zwei Texten.",
      },
      {
        en: "One decision per screen at the start; nothing to configure before the first story.",
        de: "Eine Entscheidung pro Bildschirm am Anfang; vor der ersten Geschichte ist nichts einzustellen.",
      },
    ],
    outcome: {
      en: "A working web application with accounts, story generation, grammar panel and quiz, handed in with documentation and presentation in the module Produktion Digitaler Medien.",
      de: "Eine lauffähige Webanwendung mit Konten, Geschichtenerzeugung, Grammatiktafel und Quiz, abgegeben mit Dokumentation und Präsentation im Modul Produktion Digitaler Medien.",
    },
    share: {
      en: "Individual work: design, front end and back end.",
      de: "Einzelarbeit: Gestaltung, Front-End und Back-End.",
    },
  },

  "i-need-space": {
    challenge: {
      en: "The assignment: trigger a defined emotion with a visual medium and justify the result in a report. Output print-ready in CMYK.",
      de: "Die Aufgabe: mit einem visuellen Medium eine festgelegte Emotion auslösen und das Ergebnis in einem Bericht begründen. Ausgabe druckreif in CMYK.",
    },
    approach: {
      en: "Emotion: lostness. A cinema poster with a single small astronaut drifting off centre against the curve of Earth, in a cold palette.",
      de: "Emotion: Verlorenheit. Ein Kinoplakat mit einem einzelnen kleinen Astronauten, der außermittig vor der Erdkrümmung treibt, in kalter Farbpalette.",
    },
    implementation: {
      en: "Composited in Photoshop from separate plates: Milky Way, Earth, astronaut, debris. Luminance mask for the cut-out, curves and layer masks for Earth, lighten blend mode for the debris. Converted to CMYK at 300 dpi.",
      de: "In Photoshop aus einzelnen Aufnahmen montiert: Milchstraße, Erde, Astronaut, Trümmer. Luminanzmaske zum Freistellen, Gradationskurve und Ebenenmasken für die Erde, Modus Aufhellen für die Trümmer. Konvertiert nach CMYK bei 300 dpi.",
    },
    decisions: [
      {
        en: "Astronaut made smaller and moved off centre. A large central figure reads as capable, not lost.",
        de: "Astronaut verkleinert und aus der Mitte gerückt. Eine große, zentrale Figur wirkt handlungsfähig, nicht verloren.",
      },
      {
        en: "Luminance mask instead of a path: on a black background it gives the cleanest edges.",
        de: "Luminanzmaske statt Pfad: Vor schwarzem Hintergrund gibt sie die saubersten Kanten.",
      },
    ],
    outcome: {
      en: "The poster in RGB and CMYK and a project report covering concept, execution and reflection.",
      de: "Das Plakat in RGB und CMYK und ein Projektbericht mit Konzeption, Umsetzung und Reflexion.",
    },
    share: {
      en: "Individual work in the modules Mediendesign and Computergrafik.",
      de: "Einzelarbeit in den Modulen Mediendesign und Computergrafik.",
    },
    learned: {
      en: "After the CMYK conversion the deep blue of Earth and the shadows shifted and had to be corrected by hand. The print colour space belongs at the start of the work, not the end.",
      de: "Nach der CMYK-Konvertierung hatten sich das tiefe Blau der Erde und die Schatten verschoben und mussten von Hand korrigiert werden. Der Druckfarbraum gehört an den Anfang der Arbeit, nicht ans Ende.",
    },
  },
};
