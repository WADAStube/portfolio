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
    body: "The scene is rendered once from the light's point of view. The result is a depth atlas, not an image: how far the light travels before it hits something. Every shadow in the final frame is a lookup into this texture.",
    bodyDe: "Die Szene wird einmal aus Sicht des Lichts gerendert. Das Ergebnis ist kein Bild, sondern ein Tiefen-Atlas: wie weit das Licht kommt, bevor es auf etwas trifft. Jeder Schatten im fertigen Bild ist ein Nachschlagen in dieser Textur.",
  },
  {
    src: `${BASE}/frame-02-depthnormals.jpg`,
    pass: "IP 19 — DrawDepthNormalPrepass",
    label: "Depth and normals",
    labelDe: "Tiefe und Normalen",
    body: "Per pixel: distance to the surface and the direction it faces. The colours are the normal vector itself. Nothing here reaches the screen — it is input for the passes that follow.",
    bodyDe: "Pro Pixel: Entfernung zur Oberfläche und ihre Ausrichtung. Die Farben sind der Normalenvektor selbst. Nichts davon landet auf dem Bildschirm — es ist Eingabe für die folgenden Durchgänge.",
  },
  {
    src: `${BASE}/frame-03-ssao.jpg`,
    pass: "IP 22 — SSAO",
    label: "Where surfaces meet",
    labelDe: "Wo Flächen zusammenstoßen",
    body: "SSAO reads depth and normals back and computes, per pixel, how much of the surroundings is blocked. Corners, gaps and contact points come out darker. Derived entirely from the two buffers above — no geometry is drawn again.",
    bodyDe: "SSAO liest Tiefe und Normalen zurück und berechnet pro Pixel, wie stark die Umgebung verdeckt ist. Ecken, Spalten und Auflagepunkte werden dunkler. Entsteht vollständig aus den beiden Puffern darüber — Geometrie wird nicht erneut gezeichnet.",
  },
  {
    src: `${BASE}/frame-04-ssao-filtered.jpg`,
    pass: "IP 23 — SSAO",
    label: "Filtered",
    labelDe: "Gefiltert",
    body: "The raw occlusion is noisy and gets filtered. What remains is a near-white mask with thin dark lines along the contact edges — under the rocks, inside the fence, where the bridge meets the ground.",
    bodyDe: "Die rohe Verdeckung ist verrauscht und wird gefiltert. Übrig bleibt eine fast weiße Maske mit dünnen dunklen Linien an den Berührungskanten — unter den Felsen, im Zaun, wo die Brücke den Boden trifft.",
  },
  {
    src: `${BASE}/frame-05-final.jpg`,
    pass: "IP 27 — BlitFinalToBackBuffer",
    label: "The frame",
    labelDe: "Das Bild",
    body: "The visible image is composited and written to the back buffer. Everything before this was preparation. Four passes of setup for one frame — which is why the look is a budget decision as much as a style one.",
    bodyDe: "Das sichtbare Bild wird zusammengesetzt und in den Back Buffer geschrieben. Alles davor war Vorbereitung. Vier Durchgänge für ein Bild — deshalb ist der Look genauso eine Budget- wie eine Stilentscheidung.",
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
      "Humanoid import fails: “Not enough bones to create human avatar”, plus duplicate bone assignments.",
    symptomDe:
      "Humanoid-Import schlägt fehl: „Not enough bones to create human avatar“, dazu doppelt zugewiesene Bones.",
    cause:
      "The Maya rig does not match the bone set Unity expects for Humanoid. The export settings decide this, not the hierarchy.",
    causeDe:
      "Das Maya-Rig entspricht nicht dem Bone-Satz, den Unity für Humanoid erwartet. Entschieden wird das über die Export-Einstellungen, nicht über die Hierarchie.",
    fix: [
      "Mesh exported without the skeleton",
      "Auto-rig via Mixamo, re-import as FBX for Unity",
      "Rig: Humanoid, Avatar from this model, T-Pose enforced",
    ],
    fixDe: [
      "Mesh ohne Skelett exportiert",
      "Auto-Rig über Mixamo, Reimport als FBX für Unity",
      "Rig: Humanoid, Avatar aus diesem Modell, T-Pose erzwungen",
    ],
  },
  {
    n: "02",
    title: "The character was 42.5 times too small",
    titleDe: "Der Character war 42,5-mal zu klein",
    symptom:
      "Chiara stands in the scene as a speck.",
    symptomDe:
      "Chiara steht als Punkt in der Szene.",
    cause:
      "CharacterController height reads 0.04 against an expected 1.7. Factor 42.5 — read off, not estimated.",
    causeDe:
      "CharacterController-Height liegt bei 0,04 statt bei erwarteten 1,7. Faktor 42,5 — abgelesen, nicht geschätzt.",
    fix: [
      "Scale Factor raised by 42.5",
      "Character and scene scaled together",
    ],
    fixDe: [
      "Scale Factor um 42,5 angehoben",
      "Character und Szene gemeinsam skaliert",
    ],
  },
  {
    n: "03",
    title: "Running sank her through the floor",
    titleDe: "Beim Laufen sank sie durch den Boden ein",
    symptom:
      "Walking is fine. At running speed the character drops into the terrain.",
    symptomDe:
      "Gehen funktioniert. Bei Laufgeschwindigkeit sinkt der Character ins Terrain.",
    cause:
      "Gravity hard-coded at −20. Per physics step the controller travels further than the collider is thick, so the collision is never evaluated.",
    causeDe:
      "Gravitation fest auf −20. Pro Physikschritt legt der Controller mehr Weg zurück, als der Collider dick ist — die Kollision wird nie ausgewertet.",
    fix: [
      "Gravity −20 → −9.81",
      "Skin Width 0.08 → 0.04",
    ],
    fixDe: [
      "Gravitation −20 → −9,81",
      "Skin Width 0,08 → 0,04",
    ],
  },
  {
    n: "04",
    title: "The raycast kept hitting the character",
    titleDe: "Der Raycast traf immer den Character",
    symptom:
      "Pick-up works from some angles and not from others.",
    symptomDe:
      "Aufnehmen funktioniert aus manchen Winkeln, aus anderen nicht.",
    cause:
      "The third-person camera does a LookAt on the character, so camera-forward points at her. The ray hits Chiara before the object behind her.",
    causeDe:
      "Die Third-Person-Kamera macht LookAt auf den Character, die Blickrichtung zeigt also auf ihn. Der Strahl trifft Chiara vor dem Objekt dahinter.",
    log: "Getroffenes Objekt \"Chiara\" hat kein Pickupable-Skript",
    fix: [
      "Raycast removed",
      "Physics.OverlapSphere around the character — direction-independent",
    ],
    fixDe: [
      "Raycast entfernt",
      "Physics.OverlapSphere um den Character — richtungsunabhängig",
    ],
  },
  {
    n: "05",
    title: "Dropped objects could not be picked up again",
    titleDe: "Abgelegte Objekte ließen sich nicht wieder aufnehmen",
    symptom:
      "An object can be carried and dropped once. After that it is no longer detected.",
    symptomDe:
      "Ein Objekt lässt sich tragen und einmal ablegen. Danach wird es nicht mehr erkannt.",
    cause:
      "Detaching loses the world position, and the collider is not re-registered with the physics system.",
    causeDe:
      "Beim Lösen geht die Weltposition verloren, der Collider wird nicht neu bei der Physik angemeldet.",
    fix: [
      "SetParent(null, true)",
      "World position set explicitly on drop",
      "Collider off and on again to force re-registration",
    ],
    fixDe: [
      "SetParent(null, true)",
      "Weltposition beim Ablegen explizit gesetzt",
      "Collider aus und wieder an, erzwingt Neuanmeldung",
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
                  ? "Das Diorama war auf ein Standbild hin gebaut. Für die Engine muss es aus jedem Winkel und sechzigmal pro Sekunde funktionieren. Umgesetzt: Geometrie halbiert, Materialien auf batchbare Instanzen umgestellt, Character gerigged und animiert, Interaktionssystem in C# für Aufnehmen, Zielen und Werfen."
                  : "The diorama was built towards a still. For the engine it has to hold up from any angle, sixty times a second. Done: geometry halved, materials moved onto batchable instances, character rigged and animated, interaction system written in C# for picking up, aiming and throwing."}
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
              ? "Die Szene wird mehrfach gerendert, bevor das erste sichtbare Pixel geschrieben wird. Fünf Schritte aus einem einzigen Frame, abgegriffen im Frame Debugger, in der Reihenfolge der Ausführung."
              : "The scene is rendered several times before the first visible pixel is written. Five steps out of one frame, captured in the Frame Debugger, in execution order."}
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
                  ? "In der Maya-Fassung war die Vegetation echte Geometrie, jede Instanz ein eigenes Objekt. Für die Engine neu aufgebaut: Dreieckszahl mehr als halbiert, Materialien so gesetzt, dass der SRP Batcher greift. Von 1 327 Draw Calls sind 1 309 instanziert."
                  : "In the Maya version vegetation was real geometry, every instance its own object. Rebuilt for the engine: triangle count more than halved, materials set up so the SRP Batcher takes over. Of 1,327 draw calls, 1,309 are instanced."}
              </p>
              <p className="mt-5 text-[11px] leading-relaxed text-white/28 max-w-md">
                {lang === "de"
                  ? "30,4 MB Texturspeicher bei dieser Szenengröße: Cel-Shading arbeitet mit Farbstufen statt mit Texturkarten. Im Maya-Projekt eine Stilentscheidung, in der Engine ein Budgetvorteil."
                  : "30.4 MB of texture memory at this scene size: cel shading works with colour steps instead of texture maps. A style decision in the Maya project, a budget advantage in the engine."}
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
              ? "Jeweils über einen eindeutigen Test eingegrenzt — Log, Zahlenvergleich, Ausschluss — und erst danach geändert."
              : "Each one narrowed down by an unambiguous test — a log line, a comparison of values, an exclusion — and only then changed."}
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
