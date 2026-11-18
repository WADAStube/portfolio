import {
  Reveal,
  Stagger,
  StaggerItem,
} from "@/components/motion-primitives";
import type { PanoScene } from "@/components/panorama";
import { Disclosure } from "@/components/site-chrome";
import { cn } from "@/lib/utils";
import { useLang, t } from "@/lib/lang";

/* ────────────────────────────────────────────────────────────
   CAMPUS QUEST — Aufbau des Spiels

   Was im Projekttext keinen Platz hat: der Ablauf mit seinen
   zwei Strängen, der Umfang des PaneoVR-Graphen, die drei
   Probleme, die freie Reihenfolge mit sich bringt, und die
   drei Textsorten im Spiel.

   Alle Angaben stammen aus den Projektunterlagen. Die Tafeln
   unter "Drei Arten von Text" stehen so im Spiel, auf Deutsch.
   ──────────────────────────────────────────────────────────── */

const BASE = "/images/projects/campus-quest";

type Bi = { en: string; de: string };

/* ── Ablauf ── */
const TRACKS: { label: Bi; where: Bi; steps: { title: Bi; sub: Bi }[] }[] = [
  {
    label: { en: "Video track", de: "Strang Video" },
    where: { en: "Studio G28", de: "Studio G28" },
    steps: [
      {
        title: { en: "SD card", de: "SD-Karte" },
        sub: { en: "from the sound control room", de: "aus der Tonregie" },
      },
      {
        title: { en: "Camera setup", de: "Kamera aufbauen" },
        sub: { en: "seven guided steps", de: "sieben angeleitete Schritte" },
      },
      {
        title: { en: "Vision mixer", de: "Bildregie" },
        sub: { en: "quiz, then brightness", de: "Quiz, dann Helligkeit" },
      },
      {
        title: { en: "Record", de: "Aufnahme" },
        sub: { en: "take the card, clean up", de: "Karte mitnehmen, aufräumen" },
      },
    ],
  },
  {
    label: { en: "Audio track", de: "Strang Ton" },
    where: { en: "E building", de: "E-Gebäude" },
    steps: [
      {
        title: { en: "USB stick", de: "USB-Stick" },
        sub: { en: "from room E114", de: "aus Raum E114" },
      },
      {
        title: { en: "Audio cable", de: "Audiokabel" },
        sub: { en: "quiz in E115", de: "Quiz in E115" },
      },
      {
        title: { en: "Microphone", de: "Mikrofon" },
        sub: { en: "from the mixing room", de: "aus dem Mischraum" },
      },
      {
        title: { en: "Record", de: "Aufnahme" },
        sub: { en: "quiz, then record", de: "Quiz, dann aufnehmen" },
      },
    ],
  },
];

/* ── Umfang ── */
const NUMBERS: { n: string; label: Bi }[] = [
  { n: "59", label: { en: "scenes", de: "Szenen" } },
  { n: "42", label: { en: "360° panoramas", de: "360°-Panoramen" } },
  { n: "280+", label: { en: "interactive elements", de: "interaktive Elemente" } },
  { n: "22", label: { en: "state flags", de: "Zustandsmerker" } },
];

/* ── Die drei Probleme der freien Reihenfolge ── */
const PROBLEMS: { title: Bi; body: Bi; fix: Bi }[] = [
  {
    title: {
      en: "Progress disappeared on the way back",
      de: "Fortschritt verschwand auf dem Rückweg",
    },
    body: {
      en: "Players set up the camera, went to fetch the SD card and came back to an empty studio. PaneoVR resets a condition when you enter a scene that sets it, and the hub rooms every route passes through were setting conditions.",
      de: "Die Kamera stand, dann ging es die SD-Karte holen, und zurück im Studio war alles wieder abgebaut. PaneoVR setzt eine Bedingung zurück, sobald man eine Szene betritt, die sie setzt — und genau das taten die Durchgangsräume, durch die jeder Weg führt.",
    },
    fix: {
      en: "Every state change now happens in a one-time confirmation scene. Hub rooms only read state, they never write it, so progress survives any route.",
      de: "Jede Zustandsänderung läuft jetzt über eine einmalige Bestätigungsszene. Durchgangsräume lesen den Zustand nur noch, sie schreiben ihn nicht. Damit übersteht der Fortschritt jeden Weg.",
    },
  },
  {
    title: {
      en: "A failed check wiped the inventory",
      de: "Eine fehlgeschlagene Prüfung leerte das Inventar",
    },
    body: {
      en: "Trying to record audio with one item missing emptied the whole inventory, including the SD card from the other building. The game then believed nothing had been done.",
      de: "Fehlte beim Aufnehmen ein Gegenstand, war danach das ganze Inventar leer, auch die SD-Karte aus dem anderen Gebäude. Für das Spiel war damit nichts mehr erledigt.",
    },
    fix: {
      en: "Game logic runs on progress flags only. The inventory became a pure display layer: items appear when collected and disappear when used, but the game never decides anything based on them.",
      de: "Die Spiellogik hängt nur noch an den Fortschrittsmerkern. Das Inventar ist reine Anzeige: Gegenstände erscheinen beim Aufnehmen und verschwinden beim Benutzen, entschieden wird darüber nichts.",
    },
  },
  {
    title: {
      en: "Hints showed up at the wrong time",
      de: "Hinweise kamen zum falschen Zeitpunkt",
    },
    body: {
      en: "Visibility rules worked on hotspots and quizzes, but popups ignored them. Players read “connect the cable” before they had a camera.",
      de: "Sichtbarkeitsregeln galten für Hotspots und Quizfragen, für Einblendungen aber nicht. So stand „Kabel anschließen“ auf dem Bildschirm, bevor überhaupt eine Kamera da war.",
    },
    fix: {
      en: "Popups only appear in scenes where their message is always true. Everything that depends on progress moved to checklists and task boards that update with the game state.",
      de: "Einblendungen erscheinen nur noch dort, wo ihre Aussage immer stimmt. Alles, was vom Fortschritt abhängt, steht in Checklisten und Auftragstafeln, die sich mit dem Spielstand ändern.",
    },
  },
];

/* ── Die drei Textsorten ── */
const KINDS: { kind: Bi; note: Bi }[] = [
  {
    kind: { en: "Task", de: "Auftrag" },
    note: {
      en: "What to do next, as short numbered steps.",
      de: "Was als Nächstes dran ist, in kurzen nummerierten Schritten.",
    },
  },
  {
    kind: { en: "Knowledge", de: "Wissen" },
    note: {
      en: "Optional, collapsed by default, placed where it is needed.",
      de: "Freiwillig, zugeklappt, und genau dort, wo es gebraucht wird.",
    },
  },
  {
    kind: { en: "Checklist", de: "Checkliste" },
    note: {
      en: "The player's progress, the same in every room.",
      de: "Der Stand der Dinge, in jedem Raum derselbe.",
    },
  },
];

/* ── Raumbilder ── */
const ROOMS: { src: string; cap: Bi }[] = [
  {
    src: `${BASE}/still-studio.jpg`,
    cap: {
      en: "Studio G28 — camera, talent and monitor",
      de: "Studio G28 — Kamera, Puppe und Monitor",
    },
  },
  {
    src: `${BASE}/still-control.jpg`,
    cap: {
      en: "The control room — vision mixer and programme monitor",
      de: "Die Bildregie — Bildmischer und Programm-Monitor",
    },
  },
  {
    src: `${BASE}/still-audio.jpg`,
    cap: {
      en: "Audio room E115 — the recording desk",
      de: "Aufnahmeraum E115 — der Aufnahmeplatz",
    },
  },
];

/* ── Bausteine ── */

function Head({
  kicker,
  title,
  intro,
}: {
  kicker: string;
  title: string;
  intro?: string;
}) {
  return (
    <Reveal direction="up" duration={0.9}>
      <p className="text-[8px] uppercase tracking-[0.28em] text-white/45 mb-4">{kicker}</p>
      <h3
        className="font-display font-bold text-white leading-none mb-6"
        style={{ fontSize: "clamp(1.6rem, 4vw, 3rem)", letterSpacing: "-0.02em" }}
      >
        {title}
      </h3>
      {intro && (
        <p className="text-sm md:text-base font-light leading-[1.9] text-white/62 max-w-2xl">
          {intro}
        </p>
      )}
    </Reveal>
  );
}

function Board({ children }: { children: React.ReactNode }) {
  return (
    <div
      lang="de"
      className="flex-1 border border-white/[0.1] bg-white/[0.02] p-5 text-[12.5px] font-light leading-[1.8] text-white/70"
    >
      {children}
    </div>
  );
}

export function CampusQuestSection() {
  const { lang } = useLang();
  const de = lang === "de";
  const tx = (b: Bi) => b[lang];

  return (
    <div className="relative border-t border-white/[0.05] pt-24 md:pt-36">
      {/* ── Wer was gemacht hat ── */}
      <div className="max-w-[1760px] mx-auto px-6 md:px-10 lg:px-12">
        <Head
          kicker={de ? "Gruppenarbeit" : "Group project"}
          title={de ? "Wer was gemacht hat" : "Who did what"}
          intro={
            de
              ? "Geplant haben wir zu viert. Das spielbare Spiel habe ich gebaut."
              : "The four of us planned it together. I built the playable game."
          }
        />

        <div className="mt-12 md:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-x-16 gap-y-12">
          <div className="lg:col-span-5">
            <Reveal direction="up" duration={0.9}>
              <p className="text-[8px] uppercase tracking-[0.28em] text-white/45 mb-6">
                {de ? "Team zu viert" : "Team of four"}
              </p>
              <ul className="space-y-3">
                {[
                  { en: "Concept and learning goals", de: "Konzept und Lernziele" },
                  { en: "Storyboard and user flow in Figma", de: "Storyboard und Nutzerführung in Figma" },
                  { en: "Panorama shoots in the studio and on campus", de: "Panorama-Aufnahmen im Studio und auf dem Campus" },
                ].map((i) => (
                  <li
                    key={i.en}
                    className="border-t border-white/[0.07] pt-3 text-[13px] font-light leading-[1.7] text-white/60"
                  >
                    {tx(i)}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal direction="up" delay={0.1} duration={0.9}>
              <p className="text-[8px] uppercase tracking-[0.28em] text-white/55 mb-6">
                {de ? "Mein Anteil" : "My part"}
              </p>
              <ul className="space-y-3">
                {[
                  {
                    en: "The complete PaneoVR project: 59 scenes and every connection between them",
                    de: "Das gesamte PaneoVR-Projekt: 59 Szenen und jede Verbindung dazwischen",
                  },
                  {
                    en: "Game logic for free task order with persistent progress",
                    de: "Spiellogik für freie Reihenfolge mit bleibendem Fortschritt",
                  },
                  {
                    en: "Inventory, quizzes, checklists and in-game hints",
                    de: "Inventar, Quizfragen, Checklisten und Hinweise im Spiel",
                  },
                  {
                    en: "Story, tutorial texts and the step-by-step camera setup",
                    de: "Geschichte, Anleitungstexte und der Kameraaufbau Schritt für Schritt",
                  },
                  {
                    en: "Testing and fixing every route through the game",
                    de: "Jeden Weg durch das Spiel testen und reparieren",
                  },
                ].map((i) => (
                  <li
                    key={i.en}
                    className="border-t border-white/[0.12] pt-3 text-[13px] font-light leading-[1.7] text-white/70"
                  >
                    {tx(i)}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>

      {/* ── Ablauf ── */}
      <div className="mt-28 md:mt-40 max-w-[1760px] mx-auto px-6 md:px-10 lg:px-12">
        <Head
          kicker={de ? "Ablauf" : "Flow"}
          title={de ? "Zwei Aufträge, zwei Gebäude" : "Two tasks, two buildings"}
          intro={
            de
              ? "Die Reihenfolge bestimmt der Spieler. Was erledigt ist, bleibt erledigt, auch wenn ein Raum auf halbem Weg verlassen und später wieder betreten wird."
              : "The order is up to the player. Whatever is done stays done, even when a room is left halfway through and entered again later."
          }
        />

        <div className="mt-12 md:mt-16">
          <Reveal direction="up" duration={0.9}>
            <div className="border border-white/[0.1] px-5 py-4 max-w-sm">
              <p className="font-display font-medium text-white/85">
                {de ? "Start" : "Start"}
              </p>
              <p className="mt-1 text-[12px] font-light text-white/55">
                {de
                  ? "Die Aufgabe: Abgabe bis 16 Uhr, Video und Tonaufnahme"
                  : "The brief: submission at 4 pm, a video and an audio recording"}
              </p>
            </div>
          </Reveal>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-10">
            {TRACKS.map((track, ti) => (
              <Reveal key={track.label.en} direction="up" delay={0.06 * ti} duration={0.9}>
                <div className="border-t border-white/25 pt-4">
                  <div className="flex items-baseline justify-between gap-4 mb-5">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">
                      {tx(track.label)}
                    </p>
                    <p className="font-mono text-[10px] text-white/48">{tx(track.where)}</p>
                  </div>
                  <ol className="space-y-0">
                    {track.steps.map((s, i) => (
                      <li
                        key={s.title.en}
                        className="flex items-baseline gap-5 border-b border-white/[0.07] py-4"
                      >
                        <span className="font-mono text-[10px] text-white/48 tabular-nums shrink-0">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-[13px] font-light text-white/75">
                          {tx(s.title)}
                        </span>
                        <span className="ml-auto text-right text-[11px] font-light text-white/52">
                          {tx(s.sub)}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal direction="up" delay={0.12} duration={0.9}>
            <div className="mt-8 border border-white/[0.1] px-5 py-4 max-w-sm lg:ml-auto">
              <p className="font-display font-medium text-white/85">
                {de ? "Abgabe" : "Submit"}
              </p>
              <p className="mt-1 text-[12px] font-light text-white/55">
                {de ? "Moodle, Raum E114" : "Moodle, room E114"}
              </p>
            </div>
            <p className="mt-6 font-mono text-[9px] tracking-[0.14em] text-white/45 max-w-xl">
              {de
                ? "Beide Stränge in beliebiger Reihenfolge. Fehlende Gegenstände lassen sich jederzeit nachholen, ohne dass Fortschritt verloren geht."
                : "Either track can come first. Missing items can be fetched at any point without losing progress."}
            </p>
          </Reveal>
        </div>
      </div>

      {/* Graph, Zahlen, die drei Probleme und die Textsorten:
          vollstaendig erhalten, aber aufklappbar. */}
      <div className="mt-24 md:mt-32 max-w-[1760px] mx-auto px-6 md:px-10 lg:px-12">
        <Disclosure
          label={t("techDocs", lang)}
          hint={
            de
              ? "PaneoVR-Graph · Zahlen · drei Probleme · Textsorten"
              : "PaneoVR graph · numbers · three problems · kinds of text"
          }
        >
      {/* ── Unter der Haube ── */}
      <div className="mt-28 md:mt-40 max-w-[1760px] mx-auto px-6 md:px-10 lg:px-12">
        <Head
          kicker="PaneoVR"
          title={de ? "Unter der Haube" : "Under the hood"}
          intro={
            de
              ? "PaneoVR ist ein knotenbasiertes Autorenwerkzeug: Jede Szene ist ein Panorama, und jeder Hotspot, jedes Quiz und jede Bedingung ist ein Knoten im Graphen. Campus Quest enthält keine Zeile Code. Das gesamte Verhalten steckt in diesem Graphen."
              : "PaneoVR is a node-based authoring tool: every scene is a panorama, and every hotspot, quiz and condition is a node in a graph. Campus Quest contains no code. All of its behaviour lives in that graph."
          }
        />

        <Reveal direction="up" delay={0.1} duration={1}>
          <figure className="mt-12 md:mt-16">
            <div className="relative overflow-hidden bg-[#050505] ring-1 ring-white/[0.06]">
              <img
                src={`${BASE}/paneovr-graph.jpg`}
                alt={
                  de
                    ? "Ausschnitt aus dem PaneoVR-Graphen rund um den Kameraaufbau: Szenenknoten, verbunden über Wegpunkte, Quizfragen, Bedingungsprüfungen und Setzer."
                    : "Part of the PaneoVR scene graph around the camera setup: scene nodes connected by waypoints, quizzes, condition checks and setters."
                }
                loading="lazy"
                decoding="async"
                width={1646}
                height={685}
                className="w-full h-auto"
              />
            </div>
            <figcaption className="mt-4 font-mono text-[9px] tracking-[0.14em] text-white/45">
              {de
                ? "Ein Ausschnitt des Graphen um Kameraaufbau und Aufnahme"
                : "A slice of the graph around the camera setup and recording"}
            </figcaption>
          </figure>
        </Reveal>

        <Stagger className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10" gap={0.06}>
          {NUMBERS.map((n) => (
            <StaggerItem key={n.n}>
              <div className="border-t border-white/[0.12] pt-4">
                <p
                  className="font-display font-bold text-white leading-none tabular-nums"
                  style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", letterSpacing: "-0.03em" }}
                >
                  {n.n}
                </p>
                <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-white/52">
                  {tx(n.label)}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      {/* ── Drei Probleme ── */}
      <div className="mt-28 md:mt-40 max-w-[1760px] mx-auto px-6 md:px-10 lg:px-12">
        <Head
          kicker={de ? "Was schiefging" : "What went wrong"}
          title={de ? "Drei Probleme der freien Reihenfolge" : "Three problems of free order"}
          intro={
            de
              ? "Freie Reihenfolge klingt einfach. In einem Werkzeug, das für lineare Rundgänge gebaut ist, steckte dort die meiste Arbeit."
              : "Free task order sounds simple. In a tool built for linear tours, it was where most of the work went."
          }
        />

        <div className="mt-12 md:mt-16 border-t border-white/[0.07]">
          {PROBLEMS.map((p, i) => (
            <Reveal key={p.title.en} direction="up" delay={0.05 * i} duration={0.9}>
              <article className="grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-4 py-8 md:py-10 border-b border-white/[0.07]">
                <div className="md:col-span-4">
                  <span className="font-mono text-[10px] text-white/45 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h4 className="mt-3 font-display font-medium text-white/85 text-lg leading-tight max-w-xs">
                    {tx(p.title)}
                  </h4>
                </div>
                <div className="md:col-span-8 max-w-3xl">
                  <p className="text-[13.5px] font-light leading-[1.85] text-white/62">
                    {tx(p.body)}
                  </p>
                  <p className="mt-4 text-[13.5px] font-light leading-[1.85] text-white/70">
                    <span className="text-white/52 uppercase tracking-[0.18em] text-[10px] mr-3">
                      {de ? "Lösung" : "Fix"}
                    </span>
                    {tx(p.fix)}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal direction="up" duration={0.9}>
          <p className="mt-8 text-sm font-light leading-[1.85] text-white/62 max-w-2xl">
            {de
              ? "Vor jedem Build wurde der Graph gegen alle erreichbaren Spielstände geprüft, rund 2 500, auf Sackgassen, verlorenen Fortschritt und überspringbare Schritte."
              : "Before each build, the scene graph was checked against all reachable game states, around 2,500, for dead ends, lost progress and steps that could be skipped."}
          </p>
        </Reveal>
      </div>

      {/* ── Drei Arten von Text ── */}
      <div className="mt-28 md:mt-40 max-w-[1760px] mx-auto px-6 md:px-10 lg:px-12">
        <Head
          kicker={de ? "Oberfläche" : "Interface"}
          title={de ? "Drei Arten von Text" : "Three kinds of text"}
          intro={
            de
              ? "Schwebender Text wird im 360°-Raum schnell unübersichtlich. Jeder Text im Spiel hat deshalb genau eine Aufgabe und eine Form, die diese Aufgabe anzeigt. Das Spiel selbst ist auf Deutsch."
              : "Floating text gets messy fast in 360°. Every text in the game therefore has exactly one job, and a form that says which. The game itself is in German."
          }
        />

        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {KINDS.map((k, i) => (
            <Reveal
              key={k.kind.en}
              direction="up"
              delay={0.06 * i}
              duration={0.9}
              className="flex h-full flex-col"
            >
              <Board>
                {i === 0 && (
                  <>
                    <p className="text-white/85">
                      <span className="font-mono text-[10px] tracking-[0.16em] text-white/62 mr-2">
                        AUFTRAG
                      </span>
                      Kamera startklar machen
                    </p>
                    <ol className="mt-3 space-y-1.5">
                      {["SD-Karte einlegen", "Bildregie einschalten", "Aufnahme starten", "SD-Karte entnehmen"].map(
                        (s, n) => (
                          <li key={s} className="flex gap-3">
                            <span className="font-mono text-[10px] text-white/48 tabular-nums">
                              {n + 1}
                            </span>
                            {s}
                          </li>
                        ),
                      )}
                    </ol>
                  </>
                )}
                {i === 1 && (
                  <>
                    <p className="text-white/85">
                      <span className="font-mono text-[10px] tracking-[0.16em] text-white/62 mr-2">
                        WISSEN
                      </span>
                      Blende
                    </p>
                    <p className="mt-3">
                      Die Blende regelt, wie viel Licht auf den Sensor fällt. Bild zu dunkel:
                      Blende öffnen. Zu hell: schließen.
                    </p>
                  </>
                )}
                {i === 2 && (
                  <ul className="space-y-1.5">
                    {[
                      ["✓", "Puppe positioniert", true],
                      ["✓", "Kamera aufgebaut", true],
                      ["○", "SD-Karte einlegen", false],
                      ["○", "Bildregie in Betrieb nehmen", false],
                      ["○", "Aufnahme starten", false],
                    ].map(([mark, text, done]) => (
                      <li key={text as string} className="flex gap-3">
                        <span
                          className={cn(
                            "font-mono text-[11px]",
                            done ? "text-white/70" : "text-white/45",
                          )}
                        >
                          {mark as string}
                        </span>
                        <span className={done ? "text-white/70" : "text-white/55"}>
                          {text as string}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Board>
              <p className="mt-4">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/68">
                  {tx(k.kind)}
                </span>
                <span className="block mt-2 text-[12px] font-light leading-[1.75] text-white/52">
                  {tx(k.note)}
                </span>
              </p>
            </Reveal>
          ))}
        </div>
      </div>
        </Disclosure>
      </div>

      {/* ── Die Räume ── */}
      <div className="mt-28 md:mt-40 max-w-[1760px] mx-auto px-6 md:px-10 lg:px-12">
        <Head
          kicker={de ? "Schauplätze" : "Locations"}
          title={de ? "Die echten Räume" : "The real rooms"}
          intro={
            de
              ? "Gespielt wird in Aufnahmen der Räume der Medientechnik: Fernsehstudio, Bildregie, Tonregie und Aufnahmeräume. Die Ansichten unten sind aus den Panoramen gerechnet."
              : "The game plays inside photographs of the Media Technology rooms: TV studio, control rooms and audio rooms. The views below are computed from the panoramas."
          }
        />
        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {ROOMS.map((r, i) => (
            <Reveal key={r.src} direction="up" delay={0.06 * i} duration={0.9}>
              <figure>
                <div className="relative overflow-hidden bg-[#050505] ring-1 ring-white/[0.06] aspect-[16/9]">
                  <img
                    src={r.src}
                    alt={tx(r.cap)}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
                <figcaption className="mt-3 font-mono text-[9px] tracking-[0.14em] text-white/45">
                  {tx(r.cap)}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── Ausblick ── */}
      <div className="mt-28 md:mt-40 max-w-[1760px] mx-auto px-6 md:px-10 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-16 gap-y-10 border-t border-white/[0.07] pt-14 md:pt-20">
          <div className="lg:col-span-7">
            <Head
              kicker={de ? "Ausblick" : "Next"}
              title={de ? "Was ich als Nächstes bauen würde" : "What I would build next"}
            />
            <Reveal direction="up" delay={0.1} duration={0.9}>
              <p className="text-sm md:text-base font-light leading-[1.9] text-white/65 max-w-xl">
                {de
                  ? "Ein Panorama ist ein einziger Standpunkt: Man kann sich umsehen, aber nicht gehen. Die nächste Fassung würde die fotografierten Räume behalten und die Hotspots durch echte 3D-Objekte aus Maya in Unity ersetzen, damit die Kamera wirklich auf das Stativ kommt und das Kabel wirklich eingesteckt wird."
                  : "A panorama is a single point of view: you can look around, but not walk. The next version would keep the photographed rooms and replace the hotspots with real 3D props built in Maya and brought into Unity, so the camera actually goes on the tripod and the cable actually gets plugged in."}
              </p>
              <p className="mt-5 text-sm md:text-base font-light leading-[1.9] text-white/65 max-w-xl">
                {de
                  ? "Die Logik ginge fast unverändert mit. Die eigentliche Arbeit steckte darin, Zustände zu entwerfen, die jede Reihenfolge überstehen, und das hängt nicht an der Engine."
                  : "The logic would carry over almost unchanged. Most of the hard work here was designing states that survive any order of play, and that is independent of the engine."}
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-4 lg:col-start-9">
            <Reveal direction="up" delay={0.15} duration={0.9}>
              <p className="text-[8px] uppercase tracking-[0.28em] text-white/45 mb-6">
                {de ? "Nachweis" : "Credits"}
              </p>
              <p className="text-[12.5px] font-light leading-[1.85] text-white/55">
                {de
                  ? "Konzept, Storyboard und Panoramen: Gruppe B, Interaktive Medien 2, Hochschule Emden/Leer. Umsetzung in PaneoVR: Issam Selmi."
                  : "Concept, storyboard and panoramas: Group B, Interactive Media 2, Hochschule Emden/Leer. PaneoVR implementation: Issam Selmi."}
              </p>
              <p className="mt-4 text-[12.5px] font-light leading-[1.85] text-white/55">
                {de
                  ? "Die Panoramen zeigen Studio, Regie- und Aufnahmeräume der Medientechnik."
                  : "The panoramas show the studio, control rooms and audio rooms of the Media Technology department."}
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────── Panoramen ──────────────────
   Winkel aus dem PaneoVR-Projekt übernommen; die Punkte sitzen
   auf den Geräten, um die es im Spiel geht.
   ──────────────────────────────────────────────────────────── */

export const CQ_SCENES: PanoScene[] = [
  {
    id: "studio",
    label: { en: "Studio G28", de: "Studio G28" },
    src: `${BASE}/studio.jpg`,
    preview: `${BASE}/studio-preview.jpg`,
    yaw: -26,
    pitch: 2,
    hfov: 105,
    pins: [
      {
        yaw: 11,
        pitch: -18,
        title: { en: "Studio camera", de: "Studiokamera" },
        body: {
          en: "In the game this setup is built in seven guided steps: tripod, camera, power cable, switch on, turn the camera, insert the SD card, close the slot.",
          de: "Im Spiel wird diese Einrichtung in sieben Schritten aufgebaut: Stativ, Kamera, Stromkabel, einschalten, Kamera drehen, SD-Karte einlegen, Klappe schließen.",
        },
      },
      {
        yaw: -8,
        pitch: -9,
        title: { en: "The talent", de: "Die Puppe" },
        body: {
          en: "A mannequin. Placing it on the floor mark is the very first task in the studio.",
          de: "Eine Schaufensterpuppe. Sie auf der Bodenmarke zu platzieren ist die erste Aufgabe im Studio.",
        },
      },
      {
        yaw: -22,
        pitch: 30,
        title: { en: "Lighting grid", de: "Lichttraverse" },
        body: {
          en: "The photographed rooms are the real studio of the Media Technology department.",
          de: "Die Aufnahmen zeigen das echte Studio der Medientechnik.",
        },
      },
    ],
    links: [{ yaw: -134, pitch: -6, to: "control" }],
  },
  {
    id: "control",
    label: { en: "Control room", de: "Bildregie" },
    src: `${BASE}/control-room.jpg`,
    preview: `${BASE}/control-room-preview.jpg`,
    yaw: 4,
    pitch: -4,
    hfov: 118,
    pins: [
      {
        yaw: -8,
        pitch: 6,
        title: { en: "Programme monitor", de: "Programm-Monitor" },
        body: {
          en: "Shows the studio camera. In the game it stays dark until the vision mixer is switched on.",
          de: "Zeigt die Studiokamera. Im Spiel bleibt er dunkel, bis die Bildregie eingeschaltet ist.",
        },
      },
      {
        yaw: -20,
        pitch: -28,
        title: { en: "Camera control", de: "Kamerasteuerung" },
        body: {
          en: "Here the brightness of the studio camera is set, after a quiz question.",
          de: "Hier wird die Helligkeit der Studiokamera eingestellt, nach einer Quizfrage.",
        },
      },
      {
        yaw: 75,
        pitch: -21,
        title: { en: "Vision mixer", de: "Bildmischer" },
        body: {
          en: "After the setup it is possible to switch between the dark and the corrected image.",
          de: "Nach dem Aufbau lässt sich zwischen dem dunklen und dem korrigierten Bild umschalten.",
        },
      },
    ],
    links: [
      { yaw: 157, pitch: -6, to: "studio" },
      { yaw: -148, pitch: -8, to: "audio" },
    ],
  },
  {
    id: "audio",
    label: { en: "Audio room E115", de: "Aufnahmeraum E115" },
    src: `${BASE}/audio-room.jpg`,
    preview: `${BASE}/audio-room-preview.jpg`,
    yaw: 46,
    pitch: -6,
    hfov: 120,
    pins: [
      {
        yaw: 8,
        pitch: -20,
        title: { en: "Microphone", de: "Mikrofon" },
        body: {
          en: "The audio track needs an audio cable, a microphone and a USB stick from room E114 before the recording can start.",
          de: "Für die Tonaufnahme braucht es ein Audiokabel, ein Mikrofon und einen USB-Stick aus Raum E114.",
        },
      },
      {
        yaw: 67,
        pitch: -22,
        title: { en: "Recording desk", de: "Aufnahmeplatz" },
        body: {
          en: "A last quiz question unlocks the recording. The result is saved to the USB stick for the submission.",
          de: "Eine letzte Quizfrage gibt die Aufnahme frei. Das Ergebnis landet auf dem USB-Stick für die Abgabe.",
        },
      },
    ],
    links: [{ yaw: -155, pitch: -14, to: "studio" }],
  },
];

export const CQ_POSTER = `${BASE}/still-studio.jpg`;
