import { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import {
  Reveal,
  Stagger,
  StaggerItem,
  EASE,
  useIsSmallScreen,
  CountUpNumber,
} from "@/components/motion-primitives";
import { cn } from "@/lib/utils";
import { useLang, pick } from "@/lib/lang";

/* ────────────────────────────────────────────────────────────
   UNITY-PORTIERUNG — Lantern Island

   Zweiter Teil des Projekts: aus dem gerenderten Diorama wird
   eine begehbare Szene. Die Sektion folgt der Bildsprache des
   restlichen Portfolios — Schwarz, duenne Linien, kleine
   Versalien-Marken — und zeigt drei Dinge, die sonst niemand
   zeigt: wie die Engine ein Bild aufbaut, was die Szene
   tatsaechlich kostet, und wie die Fehler gefunden wurden.

   Alle Bilder liegen unter public/images/projects/poor-house/unity/
   und haben absichtlich exakt dieselben Masse (1540x1037), damit
   in der Bildfolge nichts springt.
   ──────────────────────────────────────────────────────────── */

const BASE = "/images/projects/poor-house/unity";

/* ── Zahlen. Alle abgelesen aus dem Statistics-Fenster, das
      daneben abgebildet ist — was auf der Seite steht, steht
      auch im Screenshot. ── */
const MEASURED = {
  tris: 6063300,
  verts: 4609400,
  setPass: 54,
  drawCalls: 1327,
  instanced: 1309,
  textureMB: 30.4,
  skinned: 8,
  fps: 64.1,
};

/* Ausgangswert aus der Maya-Szene, vor der Optimierung.
   Sobald die exakte Zahl feststeht, hier eintragen. */
const MAYA_TRIS = 11000000;

/* ────────────────── 1 · Anatomie eines Frames ────────────────── */

interface FrameStep {
  src: string;
  pass: string;
  label: string;
  labelDe: string;
  body: string;
  bodyDe: string;
}

const FRAMES: FrameStep[] = [
  {
    src: `${BASE}/frame-01-shadowmap.jpg`,
    pass: "IP 18 — Draw Main Light Shadowmap",
    label: "The shadow map",
    labelDe: "Die Shadow Map",
    body: "Before anything visible is drawn, the scene is rendered once from the light's point of view. What comes out is not a picture but a distance table — an atlas of how far the light reaches before it hits something. Every shadow later in the frame is a lookup into this texture.",
    bodyDe: "Bevor irgendetwas Sichtbares gezeichnet wird, rendert die Engine die Szene einmal aus Sicht des Lichts. Heraus kommt kein Bild, sondern eine Entfernungstabelle — ein Atlas darüber, wie weit das Licht kommt, bevor es auf etwas trifft. Jeder Schatten im späteren Bild ist ein Nachschlagen in dieser Textur.",
  },
  {
    src: `${BASE}/frame-02-depthnormals.jpg`,
    pass: "IP 19 — DrawDepthNormalPrepass",
    label: "Depth and normals",
    labelDe: "Tiefe und Normalen",
    body: "A second pass writes, per pixel, how far away the surface is and which way it faces. The colours are the direction vector itself. Nothing here reaches the screen — it is the input the next steps need in order to know anything about the geometry at all.",
    bodyDe: "Ein zweiter Durchgang schreibt pro Pixel, wie weit die Oberfläche entfernt ist und in welche Richtung sie zeigt. Die Farben sind der Richtungsvektor selbst. Nichts davon landet auf dem Bildschirm — es ist die Eingabe, die die nächsten Schritte brauchen, um überhaupt etwas über die Geometrie zu wissen.",
  },
  {
    src: `${BASE}/frame-03-ssao.jpg`,
    pass: "IP 22 — SSAO",
    label: "Where surfaces meet",
    labelDe: "Wo Flächen zusammenstoßen",
    body: "Screen space ambient occlusion reads depth and normals back and asks, for every pixel, how much of the sky it can still see. Corners, gaps and contact points see less, and therefore get darker. It is derived entirely from the two buffers above — no extra geometry is touched.",
    bodyDe: "Screen Space Ambient Occlusion liest Tiefe und Normalen zurück und fragt für jedes Pixel, wie viel Himmel es noch sieht. Ecken, Spalten und Auflagepunkte sehen weniger und werden deshalb dunkler. Das entsteht vollständig aus den beiden Puffern darüber — zusätzliche Geometrie wird nicht angefasst.",
  },
  {
    src: `${BASE}/frame-04-ssao-filtered.jpg`,
    pass: "IP 23 — SSAO",
    label: "Filtered",
    labelDe: "Gefiltert",
    body: "The raw occlusion is noisy, so it gets blurred and ends up as a near-white mask with thin dark lines exactly along the contact edges — under the rocks, inside the fence, where the bridge meets the ground. That mask is the entire contribution of this effect to the final image.",
    bodyDe: "Die rohe Verdeckung ist verrauscht, wird also gefiltert und endet als fast weiße Maske mit dünnen dunklen Linien genau an den Berührungskanten — unter den Felsen, im Zaun, wo die Brücke den Boden trifft. Diese Maske ist der gesamte Beitrag des Effekts zum fertigen Bild.",
  },
  {
    src: `${BASE}/frame-05-final.jpg`,
    pass: "IP 27 — BlitFinalToBackBuffer",
    label: "The frame",
    labelDe: "Das Bild",
    body: "Only now is the visible image assembled and written to the back buffer. Everything before it was preparation that nobody ever sees. This is what runs sixty times a second — and the reason a stylised look is not only a style decision but a budget decision.",
    bodyDe: "Erst jetzt wird das sichtbare Bild zusammengesetzt und in den Back Buffer geschrieben. Alles davor war Vorbereitung, die niemand je zu sehen bekommt. Das hier läuft sechzigmal pro Sekunde — und ist der Grund, warum ein stilisierter Look nicht nur eine Stilentscheidung ist, sondern eine Budgetentscheidung.",
  },
];

function FrameImage({
  step,
  index,
  last,
  progress,
  stepSize,
  scale,
}: {
  step: FrameStep;
  index: number;
  last: boolean;
  progress: MotionValue<number>;
  stepSize: number;
  scale: MotionValue<number>;
}) {
  const s = index * stepSize;
  const e = (index + 1) * stepSize;

  /* Anders als beim Maya-Breakdown bauen die Bilder NICHT
     aufeinander auf — jeder Puffer ersetzt den vorherigen.
     Deshalb echte Kreuzblende statt Stapel. */
  const opacity = useTransform(
    progress,
    index === 0
      ? [0, 0.0001, e - stepSize * 0.12, e + stepSize * 0.32]
      : last
        ? [s - stepSize * 0.32, s + stepSize * 0.12, 1, 1]
        : [
            s - stepSize * 0.32,
            s + stepSize * 0.12,
            e - stepSize * 0.12,
            e + stepSize * 0.32,
          ],
    index === 0 ? [1, 1, 1, 0] : last ? [0, 1, 1, 1] : [0, 1, 1, 0],
  );

  return (
    <motion.img
      src={step.src}
      alt={index === 0 ? step.label : ""}
      aria-hidden={index !== 0}
      loading={index < 2 ? "eager" : "lazy"}
      decoding="async"
      style={{ opacity, scale, willChange: "opacity, transform" }}
      className="absolute inset-0 w-full h-full object-cover"
    />
  );
}

function FrameText({
  step,
  progress,
  start,
  end,
}: {
  step: FrameStep;
  progress: MotionValue<number>;
  start: number;
  end: number;
}) {
  const reduced = useReducedMotion();
  const small = useIsSmallScreen();
  const { lang } = useLang();
  const off = reduced || small ? 0 : 1;
  const span = end - start;

  const opacity = useTransform(
    progress,
    [
      start - span * 0.35,
      start + span * 0.18,
      end - span * 0.18,
      end + span * 0.2,
    ],
    [0, 1, 1, 0],
  );
  const x = useTransform(
    progress,
    [start - span * 0.35, start + span * 0.18],
    [-46 * off, 0],
  );
  const y = useTransform(
    progress,
    [end - span * 0.18, end + span * 0.2],
    [0, -70 * off],
  );

  return (
    <motion.div
      style={{ opacity, x, y, willChange: "transform, opacity" }}
      className="absolute inset-x-0 top-0 lg:top-1/2 lg:-translate-y-1/2"
    >
      <p className="font-mono text-[9px] tracking-[0.12em] text-white/25 mb-4">
        {step.pass}
      </p>
      <h4
        className="font-display font-medium text-white leading-[1.15] mb-5"
        style={{
          fontSize: "clamp(1.4rem, 2.2vw, 1.9rem)",
          letterSpacing: "-0.01em",
        }}
      >
        {pick(step.label, step.labelDe, lang)}
      </h4>
      <p className="text-sm font-light leading-[1.95] text-white/50 max-w-sm">
        {pick(step.body, step.bodyDe, lang)}
      </p>
    </motion.div>
  );
}

function FrameAnatomy() {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const small = useIsSmallScreen();
  const n = FRAMES.length;

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 26,
    mass: 0.35,
    restDelta: 0.0005,
  });

  const build = 0.88;
  const stepSize = build / n;

  /* Gleicher Abgang wie bei Turntable und Maya-Breakdown */
  const outY = useTransform(p, [build, 1], [0, reduced ? 0 : -170]);
  const outScale = useTransform(p, [build, 1], [1, reduced ? 1 : 0.93]);
  const outOpacity = useTransform(p, [build + 0.03, 0.99], [1, 0]);
  const outFilter = useTransform(
    useTransform(p, [build, 0.98], [0, reduced || small ? 0 : 8]),
    (b) => `blur(${b}px)`,
  );

  const imgScale = useTransform(p, [0, build], [reduced ? 1 : 1.05, 1]);

  return (
    <div
      ref={trackRef}
      className="relative"
      style={{ height: `${n * (small ? 78 : 92)}vh` }}
    >
      <div className="sticky top-0 h-svh flex items-center overflow-hidden">
        <motion.div
          style={{
            y: outY,
            scale: outScale,
            opacity: outOpacity,
            filter: reduced ? undefined : outFilter,
            willChange: "transform, opacity, filter",
          }}
          className="w-full max-w-[1760px] mx-auto px-6 md:px-10 lg:px-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-6 gap-x-10 xl:gap-x-14 items-center">
            <div className="order-2 lg:order-1 lg:col-span-4 xl:col-span-3 relative h-[34vh] lg:h-[62vh]">
              {FRAMES.map((f, i) => (
                <FrameText
                  key={f.src}
                  step={f}
                  progress={p}
                  start={i * stepSize}
                  end={(i + 1) * stepSize}
                />
              ))}
            </div>

            <div className="order-1 lg:order-2 lg:col-span-8 xl:col-span-9">
              <div className="relative overflow-hidden bg-[#050505] ring-1 ring-white/[0.06] aspect-[1540/1037] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
                {FRAMES.map((f, i) => (
                  <FrameImage
                    key={f.src}
                    step={f}
                    index={i}
                    last={i === n - 1}
                    progress={p}
                    stepSize={stepSize}
                    scale={imgScale}
                  />
                ))}
              </div>

              {/* Schrittleiste — zeigt, an welcher Stelle im Frame
                  man gerade steht. Fuenf Striche, einer davon hell. */}
              <div className="mt-5 flex items-center gap-2">
                {FRAMES.map((f, i) => (
                  <StepTick
                    key={f.src}
                    progress={p}
                    start={i * stepSize}
                    end={(i + 1) * stepSize}
                  />
                ))}
                <span className="ml-3 font-mono text-[9px] tracking-[0.12em] text-white/22 shrink-0">
                  1 / 60 s
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StepTick({
  progress,
  start,
  end,
}: {
  progress: MotionValue<number>;
  start: number;
  end: number;
}) {
  const span = end - start;
  const opacity = useTransform(
    progress,
    [start - span * 0.3, start + span * 0.1, end - span * 0.1, end + span * 0.3],
    [0.14, 0.85, 0.85, 0.14],
  );
  return (
    <motion.span
      style={{ opacity }}
      className="h-[2px] flex-1 bg-white rounded-full"
    />
  );
}

/* ────────────────── 2 · Fuenf Probleme ────────────────── */

interface Case {
  n: string;
  title: string;
  titleDe: string;
  symptom: string;
  symptomDe: string;
  cause: string;
  causeDe: string;
  fix: string[];
  fixDe: string[];
  log?: string;
}

const CASES: Case[] = [
  {
    n: "01",
    title: "The rig would not import",
    titleDe: "Das Rig ließ sich nicht importieren",
    symptom:
      "Unity refused to build a Humanoid Avatar from the character: “Not enough bones to create human avatar”, plus duplicate bone assignments.",
    symptomDe:
      "Unity weigerte sich, aus dem Character einen Humanoid-Avatar zu bauen: „Not enough bones to create human avatar“, dazu doppelt zugewiesene Bones.",
    cause:
      "Unity's Humanoid system expects a specific, unambiguous bone set. A rig that works perfectly for rendering in Maya does not automatically satisfy that contract — and the export settings decide whether it ever gets the chance to.",
    causeDe:
      "Das Humanoid-System von Unity erwartet einen bestimmten, eindeutigen Satz an Bones. Ein Rig, das in Maya zum Rendern einwandfrei funktioniert, erfüllt diesen Vertrag nicht automatisch — und die Export-Einstellungen entscheiden, ob es überhaupt die Chance dazu bekommt.",
    fix: [
      "Mesh exported on its own, without the skeleton",
      "Auto-rigged through Mixamo, re-imported as FBX for Unity",
      "Rig set to Humanoid, Avatar created from this model, T-Pose enforced",
    ],
    fixDe: [
      "Mesh allein exportiert, ohne Skelett",
      "Über Mixamo automatisch gerigged, als FBX für Unity zurückgeholt",
      "Rig auf Humanoid, Avatar aus diesem Modell erzeugt, T-Pose erzwungen",
    ],
  },
  {
    n: "02",
    title: "The character was 42.5 times too small",
    titleDe: "Der Character war 42,5-mal zu klein",
    symptom:
      "Chiara stood in the scene as a speck. Guessing at scale values would have taken an afternoon.",
    symptomDe:
      "Chiara stand als Punkt in der Szene. Sich an Skalierungswerte heranzuraten hätte einen Nachmittag gekostet.",
    cause:
      "The CharacterController reported a height of 0.04 where roughly 1.7 was expected. Two numbers, one division: factor 42.5. Not an estimate — a measurement.",
    causeDe:
      "Der CharacterController meldete eine Höhe von 0,04, erwartet waren rund 1,7. Zwei Zahlen, eine Division: Faktor 42,5. Keine Schätzung — eine Messung.",
    fix: [
      "Scale Factor raised by exactly that factor",
      "Character and scene scaled together, so the proportion holds",
    ],
    fixDe: [
      "Scale Factor um genau diesen Faktor angehoben",
      "Character und Szene gemeinsam skaliert, damit das Verhältnis stimmt",
    ],
  },
  {
    n: "03",
    title: "Running sank her through the floor",
    titleDe: "Beim Laufen sank sie durch den Boden ein",
    symptom:
      "Walking was fine. At running speed the character dropped into the terrain.",
    symptomDe:
      "Gehen war in Ordnung. Bei Laufgeschwindigkeit sackte der Character ins Terrain.",
    cause:
      "Gravity was a hard-coded −20. Between two physics steps the controller moved further than the collider was thick, so the collision was never evaluated — it passed straight through before Skin Width could do anything.",
    causeDe:
      "Die Gravitation stand fest auf −20. Zwischen zwei Physikschritten bewegte sich der Controller weiter, als der Collider dick war — die Kollision wurde nie ausgewertet, er ging hindurch, bevor Skin Width überhaupt greifen konnte.",
    fix: [
      "Gravity set to the real −9.81",
      "Skin Width reduced from 0.08 to 0.04",
    ],
    fixDe: [
      "Gravitation auf die echten −9,81 gesetzt",
      "Skin Width von 0,08 auf 0,04 verringert",
    ],
  },
  {
    n: "04",
    title: "The raycast kept hitting the character",
    titleDe: "Der Raycast traf immer den Character",
    symptom:
      "Picking objects up worked from some angles and not from others, with no obvious pattern.",
    symptomDe:
      "Das Aufheben funktionierte aus manchen Winkeln und aus anderen nicht, ohne erkennbares Muster.",
    cause:
      "The log named the culprit outright. The third-person camera does a LookAt on the character, so camera-forward frequently points at her — the ray hit Chiara before it ever reached the object behind her.",
    causeDe:
      "Das Log nannte die Ursache direkt. Die Third-Person-Kamera macht ein LookAt auf den Character, ihre Blickrichtung zeigt also häufig auf ihn selbst — der Strahl traf Chiara, bevor er das Objekt dahinter erreichte.",
    log: "Getroffenes Objekt \"Chiara\" hat kein Pickupable-Skript",
    fix: [
      "Raycast dropped entirely",
      "Physics.OverlapSphere around the character instead — direction no longer matters",
    ],
    fixDe: [
      "Raycast komplett verworfen",
      "Stattdessen Physics.OverlapSphere um den Character — die Blickrichtung ist damit egal",
    ],
  },
  {
    n: "05",
    title: "Dropped objects could not be picked up again",
    titleDe: "Abgelegte Objekte ließen sich nicht wieder aufnehmen",
    symptom:
      "An object could be carried and dropped once. After that the game behaved as if it no longer existed.",
    symptomDe:
      "Ein Objekt ließ sich tragen und einmal ablegen. Danach verhielt sich das Spiel, als gäbe es das Objekt nicht mehr.",
    cause:
      "Detaching from the hand lost the world position, and the collider was never re-registered with the physics system — so the detection sphere had nothing left to find.",
    causeDe:
      "Beim Lösen von der Hand ging die Weltposition verloren, und der Collider wurde nicht neu bei der Physik angemeldet — die Erkennungskugel fand schlicht nichts mehr.",
    fix: [
      "SetParent(null, true) so the world transform survives",
      "World position written explicitly on drop",
      "Collider switched off and on again to force re-registration",
    ],
    fixDe: [
      "SetParent(null, true), damit die Welt-Transformation erhalten bleibt",
      "Weltposition beim Ablegen ausdrücklich gesetzt",
      "Collider kurz aus- und wieder eingeschaltet, um die Neuanmeldung zu erzwingen",
    ],
  },
];

function CaseRow({ c, i }: { c: Case; i: number }) {
  const { lang } = useLang();
  return (
    <Reveal direction="up" delay={Math.min(i, 3) * 0.05} duration={0.9}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-6 gap-x-10 py-10 md:py-14 border-t border-white/[0.07]">
        <div className="lg:col-span-3">
          <p className="font-mono text-[10px] tracking-[0.18em] text-white/22 mb-4">
            {c.n}
          </p>
          <h4
            className="font-display font-medium text-white leading-[1.2]"
            style={{
              fontSize: "clamp(1.15rem, 1.7vw, 1.45rem)",
              letterSpacing: "-0.01em",
            }}
          >
            {pick(c.title, c.titleDe, lang)}
          </h4>
        </div>

        <div className="lg:col-span-4">
          <p className="text-[8px] uppercase tracking-[0.28em] text-white/22 mb-3">
            {lang === "de" ? "Symptom" : "Symptom"}
          </p>
          <p className="text-sm font-light leading-[1.9] text-white/45">
            {pick(c.symptom, c.symptomDe, lang)}
          </p>
          {c.log && (
            <p className="mt-4 font-mono text-[10px] leading-relaxed text-amber-100/45 border-l border-amber-200/20 pl-3">
              {c.log}
            </p>
          )}
        </div>

        <div className="lg:col-span-5">
          <p className="text-[8px] uppercase tracking-[0.28em] text-white/22 mb-3">
            {lang === "de" ? "Ursache" : "Cause"}
          </p>
          <p className="text-sm font-light leading-[1.9] text-white/55">
            {pick(c.cause, c.causeDe, lang)}
          </p>
          <ul className="mt-5 pt-5 border-t border-white/[0.07] space-y-1.5">
            {pick(c.fix, c.fixDe, lang).map((f) => (
              <li
                key={f}
                className="text-[11px] leading-relaxed text-white/30 flex gap-3"
              >
                <span className="text-white/15 shrink-0">—</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Reveal>
  );
}

/* ────────────────── 3 · Steuerung ────────────────── */

const CONTROLS = [
  {
    key: "E",
    en: "Pick up the nearest object, or put it down",
    de: "Nächstes Objekt aufnehmen oder ablegen",
  },
  {
    key: "LMB",
    en: "Hold to aim — movement slows, throwing force charges",
    de: "Halten zum Zielen — Bewegung wird langsamer, Wurfkraft lädt",
  },
  {
    key: "↑",
    en: "Release to throw, force depending on charge",
    de: "Loslassen zum Werfen, Kraft abhängig von der Ladung",
  },
  { key: "RMB", en: "Drop immediately", de: "Sofort ablegen" },
  { key: "Space", en: "Jump", de: "Springen" },
];

/* ────────────────── Sektion ────────────────── */

export function UnitySection() {
  const { lang } = useLang();

  return (
    <div className="relative border-t border-white/[0.05] pt-24 md:pt-36">
      {/* ── Kopf ── */}
      <div className="max-w-[1760px] mx-auto px-6 md:px-10 lg:px-12">
        <div className="flex items-center gap-5 mb-10 md:mb-14">
          <span className="h-px w-10 bg-white/20 shrink-0" />
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/35">
            Unity 6 · URP
          </span>
          <span className="h-px flex-1 bg-white/[0.07]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-8 gap-x-10">
          <div className="lg:col-span-7">
            <Reveal direction="up" duration={0.95}>
              <h3
                className="font-display font-bold text-white leading-[1.02]"
                style={{
                  fontSize: "clamp(2rem, 5vw, 4.2rem)",
                  letterSpacing: "-0.03em",
                }}
              >
                {lang === "de" ? (
                  <>
                    Aus einem Bild
                    <br />
                    wird ein Ort.
                  </>
                ) : (
                  <>
                    A picture
                    <br />
                    becomes a place.
                  </>
                )}
              </h3>
            </Reveal>
          </div>

          <div className="lg:col-span-5 lg:pt-4">
            <Reveal direction="up" delay={0.12} duration={0.95}>
              <p className="text-base md:text-lg font-light leading-[1.85] text-white/50 max-w-xl">
                {lang === "de"
                  ? "Ein Render ist fertig, wenn das Bild stimmt. Eine Spielszene ist fertig, wenn sie sechzigmal pro Sekunde stimmt — aus jedem Winkel, an jeder Stelle, an der jemand stehen kann. Das Diorama wurde für Maya gebaut und für die Engine neu gedacht: Geometrie halbiert, Materialien auf batchbare Instanzen umgestellt, ein Character gerigged und animiert, und ein Interaktionssystem geschrieben, das Objekte aufnimmt und wirft."
                  : "A render is finished when the image is right. A playable scene is finished when it is right sixty times a second — from any angle, from anywhere a person can stand. The diorama was built for Maya and rethought for the engine: geometry halved, materials moved onto batchable instances, a character rigged and animated, and an interaction system written that picks objects up and throws them."}
              </p>
            </Reveal>
            <Reveal direction="up" delay={0.2} duration={0.95}>
              <p className="mt-6 text-[11px] leading-relaxed text-white/28">
                {lang === "de"
                  ? "Character: Chiara — Humanoid-Rig, Blend Tree aus Idle, Gehen und Laufen, Sprung und Interaktion über das neue Input System."
                  : "Character: Chiara — humanoid rig, a blend tree over idle, walk and run, jump and interaction through the new Input System."}
              </p>
            </Reveal>
          </div>
        </div>
      </div>

      {/* ── Standbild ── */}
      <Reveal direction="up" delay={0.1} duration={1.05}>
        <figure className="mt-16 md:mt-24 max-w-[1760px] mx-auto px-6 md:px-10 lg:px-12">
          <div className="relative overflow-hidden bg-[#050505] ring-1 ring-white/[0.06] aspect-[1540/1037] md:aspect-[16/9] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
            <img
              src={`${BASE}/hero.jpg`}
              alt={
                lang === "de"
                  ? "Lantern Island in Unity 6, Universal Render Pipeline"
                  : "Lantern Island running in Unity 6, Universal Render Pipeline"
              }
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <figcaption className="mt-4 font-mono text-[9px] tracking-[0.14em] text-white/25">
            {lang === "de"
              ? "Dieselbe Szene, in Echtzeit — Unity 6.5, URP"
              : "The same scene, in real time — Unity 6.5, URP"}
          </figcaption>
        </figure>
      </Reveal>

      {/* ── Anatomie eines Frames ── */}
      <div className="mt-28 md:mt-40 max-w-[1760px] mx-auto px-6 md:px-10 lg:px-12">
        <Reveal direction="up" duration={0.9}>
          <p className="text-[8px] uppercase tracking-[0.28em] text-white/22 mb-4">
            {lang === "de" ? "Frame Debugger" : "Frame Debugger"}
          </p>
          <h3
            className="font-display font-bold text-white leading-none mb-6"
            style={{
              fontSize: "clamp(1.6rem, 4vw, 3rem)",
              letterSpacing: "-0.02em",
            }}
          >
            {lang === "de"
              ? "Anatomie eines Frames"
              : "Anatomy of a single frame"}
          </h3>
          <p className="text-sm md:text-base font-light leading-[1.9] text-white/45 max-w-2xl">
            {lang === "de"
              ? "Ein Bild entsteht in der Engine nicht auf einmal. Die Szene wird mehrfach gerendert, bevor das erste sichtbare Pixel geschrieben wird. Fünf Schritte aus einem einzigen Frame, abgegriffen im Frame Debugger — in der Reihenfolge, in der die Engine sie ausführt."
              : "The engine does not draw a picture in one go. The scene is rendered several times before the first visible pixel is written. Five steps out of one single frame, captured in the Frame Debugger, in the order the engine runs them."}
          </p>
        </Reveal>
      </div>

      <div className="mt-12 md:mt-16">
        <FrameAnatomy />
      </div>

      {/* ── Messung ── */}
      <div className="max-w-[1760px] mx-auto px-6 md:px-10 lg:px-12 pt-8 md:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-10 gap-x-10 xl:gap-x-16 items-start">
          <div className="lg:col-span-5">
            <Reveal direction="up" duration={0.9}>
              <p className="text-[8px] uppercase tracking-[0.28em] text-white/22 mb-4">
                {lang === "de" ? "Messung" : "Measured"}
              </p>
              <h3
                className="font-display font-bold text-white leading-none mb-6"
                style={{
                  fontSize: "clamp(1.6rem, 3.4vw, 2.6rem)",
                  letterSpacing: "-0.02em",
                }}
              >
                {lang === "de"
                  ? "Was die Szene kostet"
                  : "What the scene costs"}
              </h3>
              <p className="text-sm font-light leading-[1.9] text-white/45 max-w-md">
                {lang === "de"
                  ? "Die Maya-Fassung war auf ein Standbild hin gebaut — Vegetation als echte Geometrie, jede Instanz ein eigenes Objekt. Für die Engine wurde das Diorama neu aufgebaut: die Dreieckszahl mehr als halbiert, Materialien so gesetzt, dass der SRP Batcher greift. Von 1 327 Draw Calls sind 1 309 instanziert."
                  : "The Maya version was built towards a still — vegetation as real geometry, every instance its own object. For the engine the diorama was rebuilt: triangle count more than halved, materials set up so the SRP Batcher can take over. Of 1,327 draw calls, 1,309 are instanced."}
              </p>
              <p className="mt-5 text-[11px] leading-relaxed text-white/28 max-w-md">
                {lang === "de"
                  ? "Die auffälligste Zahl ist die kleinste: 30,4 MB Texturspeicher. Cel-Shading arbeitet mit Farbstufen statt mit Texturkarten — was im Maya-Projekt eine Stilentscheidung war, ist in der Engine ein Budgetvorteil."
                  : "The most telling number is the smallest one: 30.4 MB of texture memory. Cel shading works with colour steps instead of texture maps — what was a style decision in the Maya project turns into a budget advantage in the engine."}
              </p>
            </Reveal>

            <Stagger className="mt-10 grid grid-cols-2 gap-x-8 gap-y-7" gap={0.06}>
              <StaggerItem>
                <Metric
                  label={lang === "de" ? "Dreiecke" : "Triangles"}
                  value={MEASURED.tris}
                  suffix=""
                  compact
                />
                <p className="mt-1.5 font-mono text-[9px] tracking-[0.1em] text-white/20">
                  {lang === "de" ? "vorher ≈ " : "before ≈ "}
                  {(MAYA_TRIS / 1_000_000).toLocaleString(
                    lang === "de" ? "de-DE" : "en-US",
                  )}{" "}
                  {lang === "de" ? "Mio." : "M"}
                </p>
              </StaggerItem>
              <StaggerItem>
                <Metric
                  label={lang === "de" ? "Vertices" : "Vertices"}
                  value={MEASURED.verts}
                  compact
                />
              </StaggerItem>
              <StaggerItem>
                <Metric label="Set Pass Calls" value={MEASURED.setPass} />
              </StaggerItem>
              <StaggerItem>
                <Metric label="Draw Calls" value={MEASURED.drawCalls} />
                <p className="mt-1.5 font-mono text-[9px] tracking-[0.1em] text-white/20">
                  {MEASURED.instanced.toLocaleString(
                    lang === "de" ? "de-DE" : "en-US",
                  )}{" "}
                  {lang === "de" ? "instanziert" : "instanced"}
                </p>
              </StaggerItem>
              <StaggerItem>
                <Metric
                  label={lang === "de" ? "Texturspeicher" : "Texture memory"}
                  value={MEASURED.textureMB}
                  suffix=" MB"
                  decimals={1}
                />
              </StaggerItem>
              <StaggerItem>
                <Metric
                  label={
                    lang === "de" ? "Skinned Meshes" : "Visible skinned meshes"
                  }
                  value={MEASURED.skinned}
                />
              </StaggerItem>
            </Stagger>
          </div>

          <div className="lg:col-span-7">
            <Reveal direction="up" delay={0.12} duration={1}>
              <figure>
                <div className="relative overflow-hidden bg-[#050505] ring-1 ring-white/[0.06] aspect-[1540/1037] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
                  <img
                    src={`${BASE}/stats.jpg`}
                    alt={
                      lang === "de"
                        ? "Unity Statistics-Fenster über der laufenden Szene"
                        : "Unity statistics window over the running scene"
                    }
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <figcaption className="mt-4 font-mono text-[9px] tracking-[0.14em] text-white/25">
                  {lang === "de"
                    ? "Statistics-Fenster im Play Mode — die Zahlen links sind aus diesem Bild abgelesen"
                    : "Statistics window in play mode — the numbers on the left are read off this frame"}
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </div>

      {/* ── Fuenf Probleme ── */}
      <div className="max-w-[1760px] mx-auto px-6 md:px-10 lg:px-12 mt-28 md:mt-40">
        <Reveal direction="up" duration={0.9}>
          <p className="text-[8px] uppercase tracking-[0.28em] text-white/22 mb-4">
            {lang === "de" ? "Fehlersuche" : "Debugging"}
          </p>
          <h3
            className="font-display font-bold text-white leading-none mb-6"
            style={{
              fontSize: "clamp(1.6rem, 4vw, 3rem)",
              letterSpacing: "-0.02em",
            }}
          >
            {lang === "de"
              ? "Fünf Probleme, fünf Ursachen"
              : "Five problems, five causes"}
          </h3>
          <p className="text-sm md:text-base font-light leading-[1.9] text-white/45 max-w-2xl mb-4">
            {lang === "de"
              ? "Keines davon wurde durch Herumprobieren gelöst. In jedem Fall führte ein eindeutiger Test zur Ursache — ein Log, ein Zahlenvergleich, ein Ausschluss. Erst danach wurde etwas geändert."
              : "None of these were solved by trial and error. In every case one unambiguous test pointed at the cause — a log line, a comparison of two numbers, an exclusion. Only then was anything changed."}
          </p>
        </Reveal>

        <div className="mt-12 md:mt-16">
          {CASES.map((c, i) => (
            <CaseRow key={c.n} c={c} i={i} />
          ))}
          <div className="border-t border-white/[0.07]" />
        </div>

        {/* Methode als Zitat */}
        <Reveal direction="up" duration={1}>
          <blockquote className="mt-20 md:mt-28 max-w-4xl">
            <p
              className="font-display font-medium text-white/85 leading-[1.35]"
              style={{
                fontSize: "clamp(1.3rem, 2.6vw, 2.1rem)",
                letterSpacing: "-0.02em",
              }}
            >
              {lang === "de"
                ? "„Nicht raten, sondern anhand der vorliegenden Daten — Logs, Screenshots, Werte­vergleiche — die Ursache eindeutig eingrenzen, bevor man einen Fix versucht.“"
                : "“Don't guess. Narrow the cause down unambiguously from the data you already have — logs, screenshots, comparisons of values — before attempting a fix.”"}
            </p>
            <footer className="mt-6 text-[10px] uppercase tracking-[0.24em] text-white/25">
              {lang === "de"
                ? "Arbeitsweise aus dem Projekt"
                : "Working method from the project"}
            </footer>
          </blockquote>
        </Reveal>
      </div>

      {/* ── Systeme und Steuerung ── */}
      <div className="max-w-[1760px] mx-auto px-6 md:px-10 lg:px-12 mt-28 md:mt-40 pb-24 md:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-14 gap-x-10 xl:gap-x-16">
          <div className="lg:col-span-5">
            <Reveal direction="up" duration={0.9}>
              <p className="text-[8px] uppercase tracking-[0.28em] text-white/22 mb-4">
                {lang === "de" ? "Systeme" : "Systems"}
              </p>
              <h3
                className="font-display font-bold text-white leading-none mb-8"
                style={{
                  fontSize: "clamp(1.4rem, 3vw, 2.2rem)",
                  letterSpacing: "-0.02em",
                }}
              >
                {lang === "de" ? "Was geschrieben wurde" : "What was written"}
              </h3>
            </Reveal>

            <Stagger className="space-y-7" gap={0.07}>
              {[
                {
                  file: "PlayerMovement.cs",
                  en: "Third-person movement on a CharacterController, driven by the new Input System. Speed feeds a 1D blend tree over idle, walk and run; jump and grounded are separate states.",
                  de: "Third-Person-Bewegung über einen CharacterController, angesteuert vom neuen Input System. Die Geschwindigkeit speist einen 1D-Blend-Tree aus Idle, Gehen und Laufen; Sprung und Bodenkontakt sind eigene Zustände.",
                },
                {
                  file: "PlayerPickup.cs",
                  en: "Detects carryable objects with Physics.OverlapSphere around the character, parents them to the hand, and handles aiming, charging and throwing.",
                  de: "Erkennt tragbare Objekte per Physics.OverlapSphere um den Character, hängt sie an die Hand und verarbeitet Zielen, Aufladen und Werfen.",
                },
                {
                  file: "Pickupable.cs",
                  en: "Switches an object between physics and carried state — rigidbody and collider on, off, and reliably on again.",
                  de: "Schaltet ein Objekt zwischen Physik- und Tragezustand um — Rigidbody und Collider an, aus und zuverlässig wieder an.",
                },
                {
                  file: "ColliderTool.cs",
                  en: "Editor helper for fitting colliders onto the imported scene geometry without doing it by hand, object by object.",
                  de: "Editor-Hilfe, um Collider auf die importierte Szenengeometrie zu setzen, ohne das Objekt für Objekt von Hand zu tun.",
                },
              ].map((s) => (
                <StaggerItem key={s.file}>
                  <div className="border-t border-white/[0.07] pt-5">
                    <p className="font-mono text-[11px] tracking-[0.06em] text-white/70 mb-2.5">
                      {s.file}
                    </p>
                    <p className="text-[13px] font-light leading-[1.85] text-white/42 max-w-md">
                      {pick(s.en, s.de, lang)}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          <div className="lg:col-span-4 lg:col-start-7">
            <Reveal direction="up" delay={0.1} duration={0.9}>
              <p className="text-[8px] uppercase tracking-[0.28em] text-white/22 mb-8">
                {lang === "de" ? "Steuerung" : "Controls"}
              </p>
            </Reveal>
            <Stagger className="space-y-0" gap={0.05}>
              {CONTROLS.map((c) => (
                <StaggerItem key={c.key + c.en}>
                  <div className="flex items-baseline gap-5 border-t border-white/[0.07] py-4">
                    <span className="font-mono text-[10px] tracking-[0.1em] text-white/70 w-14 shrink-0 tabular-nums">
                      {c.key}
                    </span>
                    <span className="text-[13px] font-light leading-[1.7] text-white/42">
                      {pick(c.en, c.de, lang)}
                    </span>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>

            {/* Stand */}
            <Reveal direction="up" delay={0.15} duration={0.9}>
              <div className="mt-14">
                <p className="text-[8px] uppercase tracking-[0.28em] text-white/22 mb-6">
                  {lang === "de" ? "Stand" : "Status"}
                </p>
                <ul className="space-y-3">
                  {[
                    {
                      done: true,
                      en: "Third-person movement and jump",
                      de: "Third-Person-Bewegung und Sprung",
                    },
                    {
                      done: true,
                      en: "Pick up, aim, throw, drop",
                      de: "Aufnehmen, zielen, werfen, ablegen",
                    },
                    {
                      done: true,
                      en: "Collision against the whole scene",
                      de: "Kollision gegen die gesamte Szene",
                    },
                    {
                      done: false,
                      en: "Crouch and slide — deferred, root motion snaps back",
                      de: "Ducken und Rutschen — zurückgestellt, Root Motion springt zurück",
                    },
                  ].map((s) => (
                    <li
                      key={s.en}
                      className="flex items-baseline gap-4 text-[13px] font-light leading-[1.7]"
                    >
                      <span
                        className={cn(
                          "shrink-0 font-mono text-[10px]",
                          s.done ? "text-white/55" : "text-white/20",
                        )}
                      >
                        {s.done ? "✓" : "—"}
                      </span>
                      <span
                        className={cn(s.done ? "text-white/45" : "text-white/25")}
                      >
                        {pick(s.en, s.de, lang)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Eine Kennzahl. Grosse Zahlen werden verkuerzt dargestellt,
   damit die Spalte nicht bricht. */
function Metric({
  label,
  value,
  suffix = "",
  decimals = 0,
  compact = false,
}: {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
  compact?: boolean;
}) {
  const { lang } = useLang();
  const locale = lang === "de" ? "de-DE" : "en-US";

  return (
    <div>
      <p className="text-[8px] uppercase tracking-[0.24em] text-white/22 mb-2">
        {label}
      </p>
      <p
        className="font-display font-medium text-white/85 tabular-nums"
        style={{ fontSize: "clamp(1.15rem, 2vw, 1.6rem)", letterSpacing: "-0.02em" }}
      >
        {compact ? (
          /* Wie im Statistics-Fenster abgelesen: in Tausend, eine
             Nachkommastelle. Bewusst ohne Zaehlanimation — die
             Zahl soll sich mit dem Screenshot daneben decken. */
          <>
            {(value / 1000).toLocaleString(locale, {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
            <span className="text-white/35 text-[0.62em] ml-0.5">k</span>
          </>
        ) : decimals ? (
          <>
            {value.toLocaleString(locale, {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            })}
            <span className="text-white/35 text-[0.62em]">{suffix}</span>
          </>
        ) : (
          <>
            <CountUpNumber value={value} duration={1.6} />
            {suffix && (
              <span className="text-white/35 text-[0.62em]">{suffix}</span>
            )}
          </>
        )}
      </p>
    </div>
  );
}
