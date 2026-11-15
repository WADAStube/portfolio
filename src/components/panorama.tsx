import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useLang, type Lang } from "@/lib/lang";

/* ────────────────────────────────────────────────────────────
   360°-BETRACHTER

   Zeigt begehbare Panoramen: ziehen zum Umsehen, Punkte
   erklaeren etwas, Pfeile fuehren in den naechsten Raum.

   Technik: Pannellum 2.5.6 (MIT), liegt unter
   public/vendor/pannellum/ und wird erst geladen, wenn der
   Betrachter in die Naehe des Sichtfensters kommt — die
   Panoramen sind rund ein Megabyte pro Raum.

   Ohne WebGL oder bei einem Ladefehler bleibt das Standbild
   stehen, die Seite bricht nicht ab.
   ──────────────────────────────────────────────────────────── */

type Bi = { en: string; de: string };

export interface PanoScene {
  id: string;
  label: Bi;
  /** Volles equirektangulares Bild */
  src: string;
  /** Kleine Fassung, die waehrend des Ladens angezeigt wird */
  preview: string;
  yaw: number;
  pitch: number;
  hfov?: number;
  pins?: { yaw: number; pitch: number; title: Bi; body: Bi }[];
  links?: { yaw: number; pitch: number; to: string }[];
}

/* Pannellum haengt sich global ans window. */
declare global {
  interface Window {
    pannellum?: {
      viewer: (el: HTMLElement | string, cfg: unknown) => PannellumViewer;
    };
  }
}
interface PannellumViewer {
  loadScene: (id: string) => void;
  on: (ev: string, fn: (id: string) => void) => void;
  destroy: () => void;
}

const SRC = "/vendor/pannellum/pannellum.js";
const CSS = "/vendor/pannellum/pannellum.css";

let pending: Promise<void> | null = null;

/** Laedt Skript und Stylesheet genau einmal pro Seitenaufruf. */
function loadPannellum(): Promise<void> {
  if (window.pannellum) return Promise.resolve();
  if (pending) return pending;

  pending = new Promise<void>((resolve, reject) => {
    if (!document.querySelector(`link[href="${CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = CSS;
      document.head.appendChild(link);
    }
    const script = document.createElement("script");
    script.src = SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("pannellum"));
    document.head.appendChild(script);
  });

  return pending;
}

export function Panorama({
  scenes,
  poster,
  note,
  className,
}: {
  scenes: PanoScene[];
  /** Standbild, solange nichts geladen ist */
  poster: string;
  note?: Bi;
  className?: string;
}) {
  const { lang } = useLang();
  const holder = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const viewer = useRef<PannellumViewer | null>(null);
  const [active, setActive] = useState(scenes[0].id);
  const [state, setState] = useState<"idle" | "ready" | "failed">("idle");

  /* Die Sprache steckt in den Beschriftungen der Punkte, also
     wird der Betrachter bei einem Sprachwechsel neu gebaut. */
  useEffect(() => {
    const el = holder.current;
    const target = stage.current;
    if (!el || !target) return;

    let cancelled = false;

    const build = () => {
      loadPannellum()
        .then(() => {
          if (cancelled || !window.pannellum) return;

          const tip =
            (kind: "info" | "go", title: string, body: string) =>
            (div: HTMLDivElement) => {
              div.classList.add("cq-pin", kind === "go" ? "cq-pin-go" : "cq-pin-info");
              div.setAttribute("tabindex", "0");
              div.setAttribute("role", "button");
              div.setAttribute("aria-label", `${title}. ${body}`);
              const tipEl = document.createElement("span");
              tipEl.className = "cq-tip";
              const b = document.createElement("b");
              b.textContent = title;
              tipEl.append(b, document.createTextNode(body));
              div.append(document.createTextNode(kind === "go" ? "›" : "i"), tipEl);
              div.addEventListener("click", () => div.classList.toggle("is-open"));
            };

          const built: Record<string, unknown> = {};
          scenes.forEach((s) => {
            built[s.id] = {
              type: "equirectangular",
              panorama: s.src,
              preview: s.preview,
              yaw: s.yaw,
              pitch: s.pitch,
              hfov: s.hfov ?? 105,
              hotSpots: [
                ...(s.pins ?? []).map((p) => ({
                  yaw: p.yaw,
                  pitch: p.pitch,
                  cssClass: "cq-hotspot",
                  createTooltipFunc: tip("info", p.title[lang], p.body[lang]),
                })),
                ...(s.links ?? []).map((l) => {
                  const to = scenes.find((x) => x.id === l.to);
                  const label = to ? to.label[lang] : l.to;
                  return {
                    yaw: l.yaw,
                    pitch: l.pitch,
                    type: "scene",
                    sceneId: l.to,
                    cssClass: "cq-hotspot",
                    createTooltipFunc: tip(
                      "go",
                      label,
                      lang === "de" ? "Dorthin wechseln" : "Go there",
                    ),
                  };
                }),
              ],
            };
          });

          const reduced = window.matchMedia?.(
            "(prefers-reduced-motion: reduce)",
          ).matches;

          const v = window.pannellum.viewer(target, {
            default: {
              firstScene: scenes[0].id,
              autoLoad: true,
              showControls: false,
              compass: false,
              minHfov: 50,
              maxHfov: 120,
              sceneFadeDuration: 700,
              mouseZoom: false,
              autoRotate: reduced ? 0 : -1.6,
              autoRotateInactivityDelay: 6000,
            },
            scenes: built,
          });

          viewer.current = v;
          v.on("scenechange", (id) => setActive(id));
          v.on("load", () => !cancelled && setState("ready"));
          /* Falls "load" ausbleibt, trotzdem freigeben. */
          window.setTimeout(() => !cancelled && setState("ready"), 2500);
        })
        .catch(() => !cancelled && setState("failed"));
    };

    /* Erst laden, wenn der Betrachter in Sichtweite ist. */
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          build();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);

    return () => {
      cancelled = true;
      io.disconnect();
      try {
        viewer.current?.destroy();
      } catch {
        /* Betrachter war nie fertig — nichts abzuräumen */
      }
      viewer.current = null;
    };
  }, [scenes, lang]);

  const go = (id: string) => {
    setActive(id);
    viewer.current?.loadScene(id);
  };

  return (
    <div ref={holder} className={className}>
      <div className="relative bg-[#050505] ring-1 ring-white/[0.06] overflow-hidden">
        <div className="relative aspect-[16/10] md:aspect-[16/8]">
          {/* Standbild: liegt darunter und verschwindet, sobald
              der Betrachter steht. */}
          <img
            src={poster}
            alt=""
            aria-hidden="true"
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
              state === "ready" ? "opacity-0" : "opacity-100",
            )}
          />
          <div
            ref={stage}
            role="application"
            aria-label={
              lang === "de"
                ? "360-Grad-Panorama. Ziehen zum Umsehen, Räume über die Schaltflächen wechseln."
                : "360 degree panorama. Drag to look around, switch rooms with the buttons."
            }
            className="absolute inset-0"
          />

          {state !== "failed" && (
            <p className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 bg-black/65 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-white/70 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
              {lang === "de" ? "360° — Ziehen zum Umsehen" : "360° — drag to look around"}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-4 justify-between">
        <div
          role="group"
          aria-label={lang === "de" ? "Raum wechseln" : "Switch room"}
          className="flex flex-wrap gap-2"
        >
          {scenes.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={active === s.id}
              onClick={() => go(s.id)}
              className={cn(
                "border px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] transition-colors duration-300",
                "focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/60",
                active === s.id
                  ? "border-white/60 bg-white text-black"
                  : "border-white/[0.12] text-white/65 hover:text-white hover:border-white/35",
              )}
            >
              {s.label[lang]}
            </button>
          ))}
        </div>
        {note && (
          <p className="font-mono text-[9px] tracking-[0.14em] text-white/45">
            {state === "failed"
              ? lang === "de"
                ? "360°-Ansicht nicht verfügbar — Standbild"
                : "360° view unavailable — showing a still"
              : note[lang]}
          </p>
        )}
      </div>
    </div>
  );
}

export type { Bi as PanoBi, Lang };
