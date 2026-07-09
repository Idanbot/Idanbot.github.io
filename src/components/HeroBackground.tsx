/** Static first-paint backdrop; the optional topology canvas adds motion after hydration. */
export function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-x-0 -top-px bottom-0 z-0 overflow-hidden bg-[var(--background)]" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_76%_at_50%_0%,rgba(59,130,246,0.16),transparent_60%),radial-gradient(ellipse_62%_56%_at_18%_38%,rgba(52,211,153,0.08),transparent_66%),linear-gradient(180deg,rgba(255,255,255,0.035),transparent_34%)]" />
      <div className="absolute inset-0 opacity-[0.09] [background-image:linear-gradient(rgba(148,163,184,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.07)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:linear-gradient(to_bottom,black_0%,black_70%,transparent_96%)]" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/78 to-transparent" />
    </div>
  );
}
