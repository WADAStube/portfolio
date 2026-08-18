import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-6 px-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/25">
        404
      </p>
      <h1
        className="font-display font-bold text-white leading-none text-center"
        style={{ fontSize: "clamp(2.5rem, 8vw, 6rem)", letterSpacing: "-0.02em" }}
      >
        Page not found
      </h1>
      <Link
        href="/"
        className="text-[10px] uppercase tracking-[0.22em] text-white/40 hover:text-white transition-colors duration-300 border-b border-white/15 pb-1"
      >
        Back to portfolio
      </Link>
    </div>
  );
}
