/**
 * Lightweight premium backdrop for the hero (CSS-only motion).
 */
export function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),transparent_32%),radial-gradient(ellipse_92%_70%_at_18%_24%,rgba(59,130,246,0.16),transparent_58%),radial-gradient(ellipse_82%_62%_at_78%_34%,rgba(16,185,129,0.08),transparent_56%)]" />
      <div className="hero-aurora absolute inset-x-[-18%] top-[-28%] h-[84%]" />
      <div className="hero-grid-shift absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/78 to-transparent" />
    </div>
  );
}
