import { Terminal } from 'lucide-react';
import { HeroBackground } from './HeroBackground';
import { ScrambleText } from './ScrambleText';
import { SocialDock } from './SocialDock';
import { profile } from '@/data/profile';

export function HeroSection({
  prefersReducedMotion,
  topologyQuality,
  onTerminalPreload,
  onTerminalRequest,
}: {
  prefersReducedMotion: boolean;
  topologyQuality: 'full' | 'reduced';
  onTerminalPreload: (event: React.PointerEvent<HTMLElement> | React.FocusEvent<HTMLElement>) => void;
  onTerminalRequest: () => void;
}) {
  return (
    <section
      id="hero"
      className="hero-section relative flex min-h-[100svh] min-h-[100dvh] snap-start flex-col items-start justify-center overflow-hidden px-5 py-16 sm:px-8 sm:py-24 lg:px-12"
    >
      <HeroBackground quality={topologyQuality} animate={!prefersReducedMotion} />
      <div className="hero-content relative z-10 w-full space-y-5 px-1 text-left sm:space-y-8">
        <div className="hero-availability liquid-glass-control inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-white/72">
          <span className="relative flex size-2" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
          </span>
          {profile.availability}
        </div>

        <h1 className="hero-title font-display font-medium tracking-tight leading-[1.01] sm:leading-[1.02]">
          <span className="mb-2 block text-xl font-normal tracking-normal text-white/45 sm:mb-3 sm:text-3xl md:text-4xl">
            <ScrambleText text={profile.hero.eyebrowName} interval={45} hoverTrigger={true} />
          </span>
          <span className="text-gradient block">{profile.hero.headlineAccent}</span>
          <span className="block text-white">{profile.hero.headline}</span>
        </h1>

        <p className="hero-description max-w-2xl text-base font-light leading-relaxed text-white/60 sm:text-xl md:text-2xl">
          <span className="font-medium text-white/90">{profile.role}</span> {profile.hero.description}
        </p>

        <div
          className="hero-signals flex max-w-3xl flex-wrap gap-2"
          aria-label="Core capabilities"
        >
          {profile.signals.map((signal) => (
            <span
              key={signal}
              className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/62 backdrop-blur-sm"
            >
              {signal}
            </span>
          ))}
        </div>

        <div className="-ml-5 flex w-screen justify-center pt-2 sm:-ml-8 sm:pt-4 lg:-ml-12">
          <SocialDock />
        </div>

        <div className="-ml-5 flex w-screen justify-center pt-0 sm:-ml-8 sm:pt-1 lg:-ml-12">
          <button
            type="button"
            onClick={onTerminalRequest}
            onFocus={onTerminalPreload}
            onPointerEnter={onTerminalPreload}
            className="liquid-glass-control inline-flex min-h-11 max-w-[calc(100vw-2rem)] items-center justify-center gap-2 rounded-full px-4 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:border-cloud/40 hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cloud/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Terminal className="size-4 shrink-0 text-cloud" aria-hidden />
            <span>
              Try the <span className="font-medium text-white">terminal</span>
            </span>
            <kbd className="shrink-0 rounded border border-white/15 bg-black/50 px-2 py-0.5 font-mono text-xs text-muted-foreground">
              ~
            </kbd>
          </button>
        </div>
      </div>
    </section>
  );
}
