import { Link } from "wouter";
import { StatusBadge } from "@/components/site-chrome";
import {
  fieldLabel,
  hasMedia,
  pathOf,
  type Entry,
} from "@/data/portfolio";
import { cn } from "@/lib/utils";
import { useLang, pick } from "@/lib/lang";

/* ────────────────────────────────────────────────────────────
   Karte eines Projekts, auf der Startseite und der Projektseite.

   Ein Projekt ohne jedes Material bekommt keine Verlinkung: es
   gaebe dahinter nichts zu sehen.
   ──────────────────────────────────────────────────────────── */

export function ProjectCard({
  entry,
  large,
  eager,
}: {
  entry: Entry;
  large?: boolean;
  eager?: boolean;
}) {
  const { lang } = useLang();
  const p = entry.project;
  const linked = entry.status === "complete" || hasMedia(p);

  const inner = (
    <>
      <div
        className={cn(
          "relative overflow-hidden bg-[#0d0d0d] ring-1 ring-white/[0.06]",
          large ? "aspect-[16/10]" : "aspect-[4/3]",
        )}
      >
        {entry.cover ? (
          <img
            src={entry.cover.src}
            alt=""
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            className={cn(
              "h-full w-full transition-transform duration-700 ease-out",
              entry.cover.fit === "contain"
                ? "object-contain p-5 md:p-7"
                : "object-cover",
              linked && "group-hover:scale-[1.03] group-focus-visible:scale-[1.03]",
              entry.status === "soon" && "opacity-60",
            )}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <span className="font-display font-bold text-white/[0.07] text-5xl md:text-6xl">
              {p.title.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        <StatusBadge
          status={entry.status}
          className="absolute left-3 top-3 bg-black/70 backdrop-blur-sm px-2.5 py-1.5 text-white/70"
        />
      </div>

      <div className="pt-5">
        <div className="flex items-baseline justify-between gap-4">
          <h3
            className={cn(
              "font-display font-medium leading-tight transition-colors duration-300",
              large ? "text-2xl md:text-3xl" : "text-xl md:text-2xl",
              linked ? "text-white/90 group-hover:text-white" : "text-white/62",
            )}
          >
            {p.title}
          </h3>
          {linked && (
            <svg
              width="12"
              height="12"
              viewBox="0 0 10 10"
              fill="none"
              aria-hidden="true"
              className="shrink-0 text-white/45 group-hover:text-white/75 transition-colors duration-300"
            >
              <path d="M1 9L9 1M9 1H3M9 1V7" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          )}
        </div>
        <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/52">
          {pick(p.category, p.de?.category, lang)}
        </p>
        <p className="mt-4 text-sm font-light leading-[1.8] text-white/65 max-w-xl">
          {pick(p.description, p.de?.description, lang)}
        </p>
        <p className="mt-4 text-[10px] tracking-[0.06em] text-white/48">
          {entry.fields.map((f) => fieldLabel(f)[lang]).join("  ·  ")}
        </p>
        {p.tools.length > 0 && (
          <p className="mt-1.5 font-mono text-[10px] text-white/45">
            {p.tools.slice(0, large ? 6 : 4).join(" / ")}
          </p>
        )}
      </div>
    </>
  );

  if (!linked) return <div className="block">{inner}</div>;

  return (
    <Link href={pathOf(entry)}>
      <a
        className="group block focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-8 focus-visible:outline-white/50"
        aria-label={p.title}
      >
        {inner}
      </a>
    </Link>
  );
}
