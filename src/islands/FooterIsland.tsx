import { Mail } from 'lucide-react';
import { siteLinks } from '@/data/siteActions';

export function FooterIsland() {
  return (
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
  );
}
