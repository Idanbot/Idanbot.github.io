import { StackSection } from './components/StackSection';
import { GitHistory } from './components/GitHistory';

/**
 * Fully static content: rendered to HTML at build time and never hydrated.
 * Client code must not import this module — it keeps the section components,
 * react-icons, and Tailwind class utilities out of the shipped bundle.
 */
export function StaticSections() {
  return (
    <>
      <StackSection className="snap-start" />

      <section
        id="history"
        className="cv-history site-content-width mx-auto px-4 py-24 sm:px-6 sm:py-32 snap-start"
      >
        <div className="scroll-reveal mb-12 sm:mb-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">
            Professional <span className="text-gradient">Trajectory</span>
          </h2>
          <p className="px-2 text-base text-muted-foreground sm:text-lg">
            A concise timeline of roles, systems, and platform work.
          </p>
        </div>
        <GitHistory />
      </section>
    </>
  );
}
