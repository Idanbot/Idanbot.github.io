import React, { Suspense } from 'react';
import { m, Variants } from 'framer-motion';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import { Terminal } from 'lucide-react';
import { PipelineNav } from './components/PipelineNav';
import { MobileNav } from './components/MobileNav';
import { StackSection } from './components/StackSection';
import { TerminalModal } from './components/TerminalModal';
import { CommandPalette } from './components/CommandPalette';
import { ParticleNetwork } from './components/ParticleNetwork';
import { ScrambleText } from './components/ScrambleText';
import { TracingBeams } from './components/TracingBeams';
import { HeroBackground } from './components/HeroBackground';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
import { useActiveSection } from './hooks/useActiveSection';
import { OPEN_TERMINAL_EVENT } from './lib/site-events';

const GitHistory = React.lazy(() =>
  import('./components/GitHistory').then((mod) => ({ default: mod.GitHistory }))
);
const StatusPage = React.lazy(() =>
  import('./components/StatusPage').then((mod) => ({ default: mod.StatusPage }))
);

function App() {
  const activeSection = useActiveSection();
  const prefersReducedMotion = usePrefersReducedMotion();

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
      <PipelineNav activeSection={activeSection} />
      <MobileNav activeSection={activeSection} />
      <TerminalModal />
      <CommandPalette />

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
            <ParticleNetwork />
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
              <span className="font-medium text-foreground">DevOps Engineer</span> &
              <span className="font-medium text-foreground"> Backend Developer</span> crafting robust
              infrastructure and scalable systems.
            </m.p>

            <m.div
              variants={item}
              className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-6 sm:pt-8"
            >
              <SocialLink href="https://github.com/Idanbot" icon={<FaGithub size={24} />} label="GitHub" />
              <SocialLink
                href="https://www.linkedin.com/in/idanbotbol/"
                icon={<FaLinkedin size={24} />}
                label="LinkedIn"
              />
              <SocialLink href="mailto:idan@idanbot.uk" icon={<FaEnvelope size={24} />} label="Email" />
            </m.div>

            <m.div variants={item} className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent(OPEN_TERMINAL_EVENT))}
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
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">Scroll</span>
            <m.div
              animate={prefersReducedMotion ? false : { y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="h-12 w-1 rounded-full bg-linear-to-b from-primary/55 to-transparent"
            />
          </m.div>
        </section>

        <StackSection className="snap-start" />

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
          <Suspense
            fallback={
              <div className="min-h-[280px] max-w-4xl mx-auto rounded-xl border border-white/5 bg-white/[0.02] animate-pulse" />
            }
          >
            <GitHistory />
          </Suspense>
        </section>

        <section id="monitor" className="snap-start">
          <Suspense
            fallback={
              <div className="min-h-[180px] max-w-5xl mx-auto px-4 sm:px-6 rounded-xl border border-white/5 bg-white/[0.02] animate-pulse" />
            }
          >
            <StatusPage />
          </Suspense>
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

export default App;
