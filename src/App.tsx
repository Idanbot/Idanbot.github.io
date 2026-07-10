import React, { Suspense, useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import { DesktopNav } from './components/DesktopNav';
import { HeroSection } from './components/HeroSection';
import { LazyOnVisible } from './components/LazyOnVisible';
import { SectionSkeleton } from './components/SectionSkeleton';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
import { useActiveSection } from './hooks/useActiveSection';
import { OPEN_TERMINAL_EVENT } from './lib/site-events';
import { siteLinks } from './data/siteActions';

type NavigatorWithHardwareHints = Navigator & {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
};

const loadTerminalModal = () =>
  import('./components/TerminalModal').then((mod) => ({ default: mod.TerminalModal }));
const loadCommandPalette = () =>
  import('./components/CommandPalette').then((mod) => ({ default: mod.CommandPalette }));
const loadStackSection = () =>
  import('./components/StackSection').then((mod) => ({ default: mod.StackSection }));
const loadGitHistory = () =>
  import('./components/GitHistory').then((mod) => ({ default: mod.GitHistory }));
const loadStatusPage = () =>
  import('./components/StatusPage').then((mod) => ({ default: mod.StatusPage }));

const TerminalModal = React.lazy(loadTerminalModal);
const CommandPalette = React.lazy(loadCommandPalette);
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
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground selection:bg-primary/25">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <DesktopNav activeSection={activeSection} />
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

      <main
        id="main-content"
        tabIndex={-1}
        className="relative w-full scroll-smooth snap-y snap-proximity outline-none md:snap-mandatory"
      >
        <HeroSection
          prefersReducedMotion={prefersReducedMotion}
          topologyQuality={constrainedDevice ? 'reduced' : 'full'}
          onTerminalPreload={preloadTerminal}
          onTerminalRequest={requestTerminal}
        />

        <LazyOnVisible
          targetId="skills"
          prefetch={preloadStack}
          prefetchRootMargin="440px 0px"
          renderRootMargin="220px 0px"
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
            prefetchRootMargin="480px 0px"
            renderRootMargin="240px 0px"
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
            prefetchRootMargin="480px 0px"
            renderRootMargin="240px 0px"
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

      <footer className="relative z-[60] border-t border-white/5 bg-black/50 py-8 text-center backdrop-blur-md sm:py-12">
        <a
          href={siteLinks.email}
          className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2.5 text-sm font-medium text-white/82 transition-colors hover:border-cloud/35 hover:bg-white/[0.08] hover:text-white focus-visible:ring-2 focus-visible:ring-cloud/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Mail className="size-4 text-cloud" aria-hidden />
          Start a conversation
        </a>
        <p className="mx-auto max-w-2xl px-4 text-sm text-muted-foreground md:text-base">
          © {new Date().getFullYear()} Idan Botbol.
          <span className="hidden md:inline">
            {' '}
            | Press <code className="bg-white/10 px-1 rounded">~</code> for terminal ·{' '}
            <kbd className="bg-white/10 px-1 rounded">⌘</kbd>
            <kbd className="bg-white/10 px-1 rounded">K</kbd> for menu
          </span>
          <span className="mt-2 block font-mono text-xs leading-relaxed text-muted-foreground/80 md:hidden">
            <code className="bg-white/10 px-1 rounded">~</code> terminal · ⌘K menu
          </span>
        </p>
      </footer>
    </div>
  );
}

export default App;
