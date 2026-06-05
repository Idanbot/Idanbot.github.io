import React, { Suspense, useEffect, useRef, useState } from 'react';
import { m, Variants } from 'framer-motion';
import { Terminal } from 'lucide-react';
import { MobileNav } from './components/MobileNav';
import { ScrambleText } from './components/ScrambleText';
import { TracingBeams } from './components/TracingBeams';
import { HeroBackground } from './components/HeroBackground';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
import { useActiveSection } from './hooks/useActiveSection';
import { OPEN_TERMINAL_EVENT } from './lib/site-events';

const TerminalModal = React.lazy(() =>
  import('./components/TerminalModal').then((mod) => ({ default: mod.TerminalModal }))
);
const CommandPalette = React.lazy(() =>
  import('./components/CommandPalette').then((mod) => ({ default: mod.CommandPalette }))
);
const ParticleNetwork = React.lazy(() =>
  import('./components/ParticleNetwork').then((mod) => ({ default: mod.ParticleNetwork }))
);
const StackSection = React.lazy(() =>
  import('./components/StackSection').then((mod) => ({ default: mod.StackSection }))
);
const GitHistory = React.lazy(() =>
  import('./components/GitHistory').then((mod) => ({ default: mod.GitHistory }))
);
const StatusPage = React.lazy(() =>
  import('./components/StatusPage').then((mod) => ({ default: mod.StatusPage }))
);

function App() {
  const activeSection = useActiveSection();
  const prefersReducedMotion = usePrefersReducedMotion();
  const isServer = typeof window === 'undefined';
  const [terminalRequested, setTerminalRequested] = useState(false);
  const [commandPaletteRequested, setCommandPaletteRequested] = useState(false);
  const [particlesReady, setParticlesReady] = useState(false);
  const requestTerminal = () => {
    if (terminalRequested) {
      window.dispatchEvent(new CustomEvent(OPEN_TERMINAL_EVENT));
      return;
    }
    setTerminalRequested(true);
  };

  useEffect(() => {
    const openTerminal = () => setTerminalRequested(true);
    const handleGlobalShortcuts = (event: KeyboardEvent) => {
      if ((event.key === '`' || event.key === '~') && !terminalRequested) {
        event.preventDefault();
        setTerminalRequested(true);
        return;
      }
      if (event.key === 'k' && (event.metaKey || event.ctrlKey) && !commandPaletteRequested) {
        event.preventDefault();
        setCommandPaletteRequested(true);
      }
    };

    window.addEventListener(OPEN_TERMINAL_EVENT, openTerminal);
    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => {
      window.removeEventListener(OPEN_TERMINAL_EVENT, openTerminal);
      window.removeEventListener('keydown', handleGlobalShortcuts);
    };
  }, [commandPaletteRequested, terminalRequested]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const start = () => setParticlesReady(true);
    const idleId =
      'requestIdleCallback' in window
        ? window.requestIdleCallback(start, { timeout: 1400 })
        : undefined;
    const timeoutId = idleId === undefined ? window.setTimeout(start, 900) : undefined;

    return () => {
      if (idleId !== undefined && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [prefersReducedMotion]);

  const container: Variants = prefersReducedMotion
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3,
          },
        },
      };

  const item: Variants = prefersReducedMotion
    ? { hidden: { y: 0, opacity: 1 }, show: { y: 0, opacity: 1 } }
    : {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 50 } },
      };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground selection:bg-primary/25">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <MobileNav activeSection={activeSection} />
      {terminalRequested ? (
        <Suspense fallback={null}>
          <TerminalModal startOpen />
        </Suspense>
      ) : null}
      {commandPaletteRequested ? (
        <Suspense fallback={null}>
          <CommandPalette startOpen />
        </Suspense>
      ) : null}

      <TracingBeams />

      <main
        id="main-content"
        tabIndex={-1}
        className="relative w-full scroll-smooth snap-y snap-proximity pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))] outline-none md:snap-mandatory lg:pb-0"
      >
        <section
          id="hero"
          className="relative flex min-h-[100dvh] min-h-screen snap-start flex-col items-center justify-center px-6 py-20"
        >
          <HeroBackground />
          <div className="pointer-events-none absolute inset-0 z-[1]">
            {particlesReady ? (
              <Suspense fallback={null}>
                <ParticleNetwork />
              </Suspense>
            ) : null}
          </div>
          <m.div
            variants={container}
            initial="hidden"
            animate="show"
            className="relative z-10 text-center space-y-8 w-full max-w-4xl px-1"
          >
            <m.h1
              variants={item}
              className="text-[clamp(2.75rem,10vw,8.5rem)] md:text-9xl font-bold tracking-tighter leading-[0.95]"
            >
              <span className="block text-foreground drop-shadow-[0_0_40px_rgba(0,0,0,0.45)]">
                <ScrambleText text="Idan" interval={50} hoverTrigger={true} />
              </span>
              <span className="text-gradient block mt-2 drop-shadow-[0_0_32px_rgba(0,0,0,0.35)]">
                <ScrambleText text="Botbol" interval={50} hoverTrigger={true} />
              </span>
            </m.h1>

            <m.p
              variants={item}
              className="mx-auto max-w-2xl text-lg font-light leading-relaxed text-muted-foreground sm:text-xl md:text-2xl"
            >
              <span className="font-medium text-foreground">Cloud Architect / DevOps Engineer</span> with
              <span className="font-medium text-foreground"> backend depth</span>, building secure,
              cost-aware cloud platforms and reliable production systems.
            </m.p>

            <m.div
              variants={item}
              className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-6 sm:pt-8"
            >
              <SocialLink href="https://github.com/Idanbot" icon={<GithubIcon className="size-6" />} label="GitHub" />
              <SocialLink
                href="https://www.linkedin.com/in/idanbotbol/"
                icon={<LinkedinIcon className="size-6" />}
                label="LinkedIn"
              />
              <SocialLink href="mailto:idan@idanbot.uk" icon={<MailIcon className="size-6" />} label="Email" />
            </m.div>

            <m.div variants={item} className="flex justify-center pt-2">
              <button
                type="button"
                onClick={requestTerminal}
                className="inline-flex min-h-11 max-w-[calc(100vw-2rem)] items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2.5 text-left text-sm text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:border-primary/40 hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Terminal className="size-4 shrink-0 text-primary" aria-hidden />
                <span>
                  Try the <span className="font-medium text-white">terminal</span>
                </span>
                <kbd className="shrink-0 rounded border border-white/15 bg-black/50 px-2 py-0.5 font-mono text-xs text-muted-foreground">
                  ~
                </kbd>
              </button>
            </m.div>
          </m.div>

          <m.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={
              prefersReducedMotion ? { duration: 0 } : { delay: 1.5, duration: 1 }
            }
            className="absolute bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 lg:bottom-10 lg:pb-0"
          >
            <m.div
              animate={prefersReducedMotion ? false : { y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="h-12 w-1 rounded-full bg-linear-to-b from-primary/55 to-transparent"
            />
          </m.div>
        </section>

        <LazyOnVisible
          id="skills"
          rootMargin="300px 0px"
          fallback={
            <section
              className="mx-auto min-h-[300px] max-w-5xl snap-start rounded-xl border border-white/5 bg-white/[0.02] animate-pulse"
            />
          }
          isServer={isServer}
        >
          <Suspense
            fallback={
              <section
                className="mx-auto min-h-[300px] max-w-5xl snap-start rounded-xl border border-white/5 bg-white/[0.02] animate-pulse"
              />
            }
          >
            <StackSection className="snap-start" />
          </Suspense>
        </LazyOnVisible>

        <section id="history" className="py-24 sm:py-32 px-4 sm:px-6 max-w-7xl mx-auto snap-start">
          <m.div
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : undefined}
            viewport={{ once: true, margin: '-100px' }}
            className="mb-12 sm:mb-16 text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">
              Commit <span className="text-gradient">Log</span>
            </h2>
            <p className="px-2 text-base text-muted-foreground sm:text-lg">
              Changelog of my professional journey.
            </p>
          </m.div>
          <LazyOnVisible
            rootMargin="450px 0px"
            fallback={
              <div className="min-h-[280px] max-w-4xl mx-auto rounded-xl border border-white/5 bg-white/[0.02] animate-pulse" />
            }
            isServer={isServer}
          >
            <Suspense
              fallback={
                <div className="min-h-[280px] max-w-4xl mx-auto rounded-xl border border-white/5 bg-white/[0.02] animate-pulse" />
              }
            >
              <GitHistory />
            </Suspense>
          </LazyOnVisible>
        </section>

        <section id="monitor" className="snap-start">
          <LazyOnVisible
            rootMargin="450px 0px"
            fallback={
              <div className="min-h-[180px] max-w-5xl mx-auto px-4 sm:px-6 rounded-xl border border-white/5 bg-white/[0.02] animate-pulse" />
            }
            isServer={isServer}
          >
            <Suspense
              fallback={
                <div className="min-h-[180px] max-w-5xl mx-auto px-4 sm:px-6 rounded-xl border border-white/5 bg-white/[0.02] animate-pulse" />
              }
            >
              <StatusPage />
            </Suspense>
          </LazyOnVisible>
        </section>
      </main>

      <footer className="relative z-[60] border-t border-white/5 bg-black/50 backdrop-blur-md py-8 sm:py-12 text-center pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))] lg:pb-12">
        <p className="mx-auto max-w-2xl px-4 text-sm text-muted-foreground md:text-base">
          © {new Date().getFullYear()} Idan Botbol.
          <span className="hidden md:inline">
            {' '}
            | Press <code className="bg-white/10 px-1 rounded">~</code> for terminal ·{' '}
            <kbd className="bg-white/10 px-1 rounded">⌘</kbd>
            <kbd className="bg-white/10 px-1 rounded">K</kbd> for menu
          </span>
          <span className="mt-2 block font-mono text-xs leading-relaxed text-muted-foreground/80 md:hidden">
            Bottom nav: sections · <code className="bg-white/10 px-1 rounded">~</code> terminal · ⌘K
            menu
          </span>
        </p>
      </footer>
    </div>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  const isMail = href.startsWith('mailto:');
  const reduced = usePrefersReducedMotion();
  return (
    <m.a
      href={href}
      {...(isMail ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
      whileHover={reduced ? undefined : { scale: 1.05 }}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      className="icon-link group relative inline-flex min-h-12 min-w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-3 shadow-sm outline-none backdrop-blur-md transition-all hover:border-primary/35 hover:bg-white/10 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:p-4"
      aria-label={label}
    >
      <div className="flex items-center justify-center text-muted-foreground transition-colors group-hover:text-foreground">
        {icon}
      </div>
    </m.a>
  );
}

function LazyOnVisible({
  children,
  fallback,
  id,
  isServer,
  rootMargin = '600px 0px',
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
  id?: string;
  isServer: boolean;
  rootMargin?: string;
}) {
  const [shouldRender, setShouldRender] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldRender) return;
    const node = ref.current;
    if (!node || !('IntersectionObserver' in window)) {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, shouldRender]);

  if (isServer || !shouldRender) {
    return (
      <div ref={ref} id={id}>
        {fallback}
      </div>
    );
  }

  return <>{children}</>;
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 0C5.37 0 0 5.5 0 12.29c0 5.43 3.44 10.03 8.2 11.65.6.11.82-.27.82-.59 0-.29-.01-1.06-.02-2.08-3.34.74-4.04-1.65-4.04-1.65-.55-1.42-1.33-1.8-1.33-1.8-1.09-.76.08-.74.08-.74 1.2.09 1.84 1.27 1.84 1.27 1.07 1.87 2.81 1.33 3.5 1.02.11-.79.42-1.33.76-1.64-2.66-.31-5.46-1.36-5.46-6.07 0-1.34.47-2.44 1.24-3.3-.12-.31-.54-1.56.12-3.25 0 0 1.01-.33 3.3 1.26A11.21 11.21 0 0 1 12 5.97c1.02.01 2.04.14 3 .41 2.29-1.59 3.3-1.26 3.3-1.26.66 1.69.24 2.94.12 3.25.77.86 1.24 1.96 1.24 3.3 0 4.72-2.8 5.75-5.47 6.06.43.38.81 1.13.81 2.28 0 1.65-.02 2.97-.02 3.37 0 .33.22.71.83.59A12.29 12.29 0 0 0 24 12.29C24 5.5 18.63 0 12 0Z" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M20.45 20.45h-3.56v-5.58c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27ZM5.32 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13Zm1.78 13.02H3.54V9H7.1v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0Z" />
    </svg>
  );
}

function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M1.5 4.5A2.5 2.5 0 0 1 4 2h16a2.5 2.5 0 0 1 2.5 2.5v15A2.5 2.5 0 0 1 20 22H4a2.5 2.5 0 0 1-2.5-2.5v-15Zm2.3-.1a.75.75 0 0 0-.8.75v.36l9 6.1 9-6.1v-.36a.75.75 0 0 0-.8-.75H3.8Zm17.2 3.3-8.58 5.82a.75.75 0 0 1-.84 0L3 7.7v11.05c0 .41.34.75.75.75h16.5c.41 0 .75-.34.75-.75V7.7Z" />
    </svg>
  );
}

export default App;
