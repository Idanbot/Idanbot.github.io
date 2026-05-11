/**
 * Lightweight animated backdrop for the hero (no extra JS loops).
 */
export function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Soft vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_88%_68%_at_50%_38%,transparent_18%,var(--background)_76%)]" />

      {/* Slow aurora / mesh */}
      <div className="hero-aurora absolute -left-[25%] -right-[25%] top-[-35%] h-[92%]" />

      {/* Secondary glow */}
      <div className="hero-pulse-glow absolute left-1/2 top-[28%] h-[min(72vw,520px)] w-[min(150vw,960px)] -translate-x-1/2 rounded-full bg-gradient-to-r from-primary/28 via-primary/[0.07] to-secondary/40 blur-3xl" />

      {/* Fine grid */}
      <div className="hero-grid-shift absolute inset-0 opacity-[0.11] [background-image:linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_72%_58%_at_50%_42%,black,transparent)]" />

      {/* Bottom fade into next section */}
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[var(--background)] to-transparent" />
    </div>
  );
}
