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

type NavigatorWithHardwareHints = Navigator & {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
};

const loadTerminalModal = () =>
  import('./components/TerminalModal').then((mod) => ({ default: mod.TerminalModal }));
const loadCommandPalette = () =>
  import('./components/CommandPalette').then((mod) => ({ default: mod.CommandPalette }));
const loadParticleNetwork = () =>
  import('./components/ParticleNetwork').then((mod) => ({ default: mod.ParticleNetwork }));
const loadStackSection = () =>
  import('./components/StackSection').then((mod) => ({ default: mod.StackSection }));
const loadGitHistory = () =>
  import('./components/GitHistory').then((mod) => ({ default: mod.GitHistory }));
const loadStatusPage = () =>
  import('./components/StatusPage').then((mod) => ({ default: mod.StatusPage }));

const TerminalModal = React.lazy(loadTerminalModal);
const CommandPalette = React.lazy(loadCommandPalette);
const ParticleNetwork = React.lazy(loadParticleNetwork);
const StackSection = React.lazy(loadStackSection);
const GitHistory = React.lazy(loadGitHistory);
const StatusPage = React.lazy(loadStatusPage);

const isConstrainedDevice = () => {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as NavigatorWithHardwareHints;
  return Boolean(
    nav.connection?.saveData ||
      (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4) ||
      (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4)
  );
};

const prefetchWhenIdle = (loader: () => Promise<unknown>) => {
  if (typeof window === 'undefined') return;
  const start = () => {
    void loader();
  };
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(start, { timeout: 2200 });
    return;
  }
  globalThis.setTimeout(start, 1400);
};

const prefetchOnFirstIntent = (event: PointerEvent | FocusEvent, loader: () => Promise<unknown>) => {
  const target = event.currentTarget;
  if (!(target instanceof HTMLElement)) return;
  if (target.dataset.prefetched === 'true') return;
  target.dataset.prefetched = 'true';
  void loader();
};

const preloadTerminal = (event: React.PointerEvent<HTMLElement> | React.FocusEvent<HTMLElement>) =>
  prefetchOnFirstIntent(event.nativeEvent, loadTerminalModal);
const preloadStack = () => loadStackSection();
const preloadHistory = () => loadGitHistory();
const preloadStatus = () => loadStatusPage();

function App() {
  const activeSection = useActiveSection();
  const prefersReducedMotion = usePrefersReducedMotion();
  const isServer = typeof window === 'undefined';
  const [terminalRequested, setTerminalRequested] = useState(false);
  const [commandPaletteRequested, setCommandPaletteRequested] = useState(false);
  const [particlesReady, setParticlesReady] = useState(false);
  const [constrainedDevice, setConstrainedDevice] = useState(false);
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
    const constrained = isConstrainedDevice();
    setConstrainedDevice(constrained);
    if (!constrained) {
      prefetchWhenIdle(loadStackSection);
    }
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || constrainedDevice) return;

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
  }, [constrainedDevice, prefersReducedMotion]);

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
      <div className="noise-overlay" aria-hidden />
      <DesktopNav activeSection={activeSection} />
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
          className="relative flex min-h-[100dvh] min-h-screen snap-start flex-col items-start justify-center px-5 py-24 sm:px-8 lg:px-12"
        >
          <HeroBackground />
          <div className="pointer-events-none absolute inset-0 z-[1]">
            {particlesReady ? (
              <Suspense fallback={null}>
                <ParticleNetwork quality={constrainedDevice ? 'reduced' : 'full'} />
              </Suspense>
            ) : null}
          </div>
          <m.div
            variants={container}
            initial="hidden"
            animate="show"
            className="relative z-10 w-full max-w-5xl space-y-8 px-1 text-left"
          >
            <m.div
              variants={item}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-white/70 shadow-sm backdrop-blur-md"
            >
              <span className="relative flex size-2" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              Available for cloud and platform work
            </m.div>

            <m.h1
              variants={item}
              className="font-display text-[clamp(3.4rem,9.2vw,8.25rem)] font-medium tracking-tight leading-[1.02]"
            >
              <span className="mb-3 block text-2xl font-normal tracking-normal text-white/45 sm:text-3xl md:text-4xl">
                <ScrambleText text="Idan Botbol" interval={45} hoverTrigger={true} />
              </span>
              <span className="text-gradient block">Architecting</span>
              <span className="block text-white">Resilient Systems.</span>
            </m.h1>

            <m.p
              variants={item}
              className="max-w-2xl text-lg font-light leading-relaxed text-white/60 sm:text-xl md:text-2xl"
            >
              <span className="font-medium text-white/90">Cloud Architect / DevOps Engineer</span> with
              <span className="font-medium text-white/90"> backend depth</span>, building secure,
              cost-aware cloud platforms and reliable production systems.
            </m.p>


            <m.div
              variants={item}
              className="-ml-5 flex w-screen justify-center pt-4 sm:-ml-8 lg:-ml-12"
            >
              <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/42 p-1.5 shadow-[0_18px_70px_-46px_rgba(96,165,250,0.55)] backdrop-blur-xl">
                <SocialLink href="https://github.com/Idanbot" icon={<GithubIcon className="size-5" />} label="GitHub" />
                <SocialLink
                  href="https://www.linkedin.com/in/idanbotbol/"
                  icon={<LinkedinIcon className="size-5" />}
                  label="LinkedIn"
                />
                <SocialLink href="mailto:idan@idanbot.uk" icon={<MailIcon className="size-5" />} label="Email" />
              </div>
            </m.div>

            <m.div variants={item} className="-ml-5 flex w-screen justify-center pt-1 sm:-ml-8 lg:-ml-12">
              <button
                type="button"
                onClick={requestTerminal}
                onFocus={preloadTerminal}
                onPointerEnter={preloadTerminal}
                className="inline-flex min-h-11 max-w-[calc(100vw-2rem)] items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2.5 text-left text-sm text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:border-cloud/40 hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cloud/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Terminal className="size-4 shrink-0 text-cloud" aria-hidden />
                <span>
                  Try the <span className="font-medium text-white">terminal</span>
                </span>
                <kbd className="shrink-0 rounded border border-white/15 bg-black/50 px-2 py-0.5 font-mono text-xs text-muted-foreground">
                  ~
                </kbd>
              </button>
            </m.div>
          </m.div>

        </section>

        <LazyOnVisible
          id="skills"
          prefetch={preloadStack}
          prefetchRootMargin="900px 0px"
          renderRootMargin="260px 0px"
          fallback={
            <section
              className="cv-skills mx-auto min-h-[300px] max-w-5xl snap-start rounded-xl border border-white/5 bg-white/[0.02] animate-pulse"
            />
          }
          isServer={isServer}
        >
          <Suspense
            fallback={
              <section
                className="cv-skills mx-auto min-h-[300px] max-w-5xl snap-start rounded-xl border border-white/5 bg-white/[0.02] animate-pulse"
              />
            }
          >
            <StackSection className="snap-start" />
          </Suspense>
        </LazyOnVisible>

        <section id="history" className="cv-history py-24 sm:py-32 px-4 sm:px-6 max-w-7xl mx-auto snap-start">
          <div className="scroll-reveal mb-12 sm:mb-16 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">
              Professional <span className="text-gradient">Trajectory</span>
            </h2>
            <p className="px-2 text-base text-muted-foreground sm:text-lg">
              A concise timeline of roles, systems, and platform work.
            </p>
          </div>
          <LazyOnVisible
            prefetch={preloadHistory}
            prefetchRootMargin="900px 0px"
            renderRootMargin="420px 0px"
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

        <section id="monitor" className="cv-monitor snap-start">
          <LazyOnVisible
            prefetch={preloadStatus}
            prefetchRootMargin="900px 0px"
            renderRootMargin="420px 0px"
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


function DesktopNav({ activeSection }: { activeSection: string }) {
  const items = [
    { id: 'hero', label: 'Profile' },
    { id: 'skills', label: 'Stack' },
    { id: 'history', label: 'Experience' },
    { id: 'monitor', label: 'Live' },
  ];

  return (
    <nav
      className="fixed left-1/2 top-6 z-[70] hidden w-[92%] max-w-lg -translate-x-1/2 rounded-full border border-white/10 bg-black/58 px-4 py-2.5 shadow-[0_16px_70px_-42px_rgba(255,255,255,0.45)] backdrop-blur-xl lg:block"
      aria-label="Primary navigation"
    >
      <ul className="flex items-center justify-between gap-1 text-sm font-medium text-white/60">
        {items.map((navItem) => {
          const active = activeSection === navItem.id;
          return (
            <li key={navItem.id}>
              <a
                href={`#${navItem.id}`}
                aria-current={active ? 'page' : undefined}
                className={`rounded-full px-3 py-1.5 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:ring-2 focus-visible:ring-cloud/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  active ? 'bg-white/[0.075] text-white' : ''
                }`}
              >
                {navItem.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
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
      className="icon-link group relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-transparent bg-white/[0.035] p-2.5 text-white/58 shadow-sm outline-none backdrop-blur-md transition-[border-color,background-color,color,box-shadow,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[0.025rem] hover:border-white/16 hover:bg-white/[0.08] hover:text-white hover:shadow-[0_14px_44px_-26px_rgba(255,255,255,0.72)] focus-visible:ring-2 focus-visible:ring-cloud/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:h-12 sm:w-12 sm:p-3"
      aria-label={label}
    >
      <span className="pointer-events-none absolute bottom-[calc(100%+0.65rem)] left-1/2 -translate-x-1/2 translate-y-1 rounded-full border border-white/10 bg-black/80 px-2.5 py-1 text-xs font-medium text-white/78 opacity-0 shadow-[0_12px_36px_-24px_rgba(255,255,255,0.8)] backdrop-blur-md transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
        {label}
      </span>
      <span className="flex shrink-0 items-center justify-center transition-colors duration-100 group-hover:text-white group-focus-visible:text-white">
        {icon}
      </span>
    </m.a>
  );
}

function LazyOnVisible({
  children,
  fallback,
  id,
  isServer,
  prefetch,
  prefetchRootMargin = '900px 0px',
  renderRootMargin = '600px 0px',
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
  id?: string;
  isServer: boolean;
  prefetch?: () => Promise<unknown>;
  prefetchRootMargin?: string;
  renderRootMargin?: string;
}) {
  const [shouldRender, setShouldRender] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const didPrefetch = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!prefetch || didPrefetch.current || !node || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          didPrefetch.current = true;
          void prefetch();
          observer.disconnect();
        }
      },
      { rootMargin: prefetchRootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [prefetch, prefetchRootMargin]);

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
          if (prefetch && !didPrefetch.current) {
            didPrefetch.current = true;
            void prefetch();
          }
          observer.disconnect();
        }
      },
      { rootMargin: renderRootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [prefetch, renderRootMargin, shouldRender]);

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
