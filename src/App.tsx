import React, { Suspense, useEffect, useState } from 'react';
import { MobileNav } from './components/MobileNav';
import { TracingBeams } from './components/TracingBeams';
import { DesktopNav } from './components/DesktopNav';
import { HeroSection } from './components/HeroSection';
import { LazyOnVisible } from './components/LazyOnVisible';
import { SectionSkeleton } from './components/SectionSkeleton';
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

  const particleLayer = particlesReady ? (
    <Suspense fallback={null}>
      <ParticleNetwork quality={constrainedDevice ? 'reduced' : 'full'} />
    </Suspense>
  ) : null;

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
        <HeroSection
          particleLayer={particleLayer}
          prefersReducedMotion={prefersReducedMotion}
          onTerminalPreload={preloadTerminal}
          onTerminalRequest={requestTerminal}
        />

        <LazyOnVisible
          id="skills"
          prefetch={preloadStack}
          prefetchRootMargin="900px 0px"
          renderRootMargin="260px 0px"
          fallback={<SectionSkeleton variant="skills" />}
          isServer={isServer}
        >
          <Suspense fallback={<SectionSkeleton variant="skills" />}>
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
            targetId="history"
            fallback={<SectionSkeleton variant="history" />}
            isServer={isServer}
          >
            <Suspense fallback={<SectionSkeleton variant="history" />}>
              <GitHistory />
            </Suspense>
          </LazyOnVisible>
        </section>

        <section id="monitor" className="cv-monitor min-h-[760px] scroll-mt-24 snap-start md:min-h-[840px]">
          <LazyOnVisible
            prefetch={preloadStatus}
            prefetchRootMargin="900px 0px"
            renderRootMargin="420px 0px"
            targetId="monitor"
            fallback={<SectionSkeleton variant="monitor" />}
            isServer={isServer}
          >
            <Suspense fallback={<SectionSkeleton variant="monitor" />}>
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

export default App;
