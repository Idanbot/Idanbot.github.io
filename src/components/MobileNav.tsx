import { m } from 'framer-motion';
import { Home, GitBranch, Layers, Activity } from 'lucide-react';

const items = [
  { id: 'hero', label: 'Init', icon: Home },
  { id: 'skills', label: 'Stack', icon: Layers },
  { id: 'history', label: 'Log', icon: GitBranch },
  { id: 'monitor', label: 'Live', icon: Activity },
] as const;

export const MobileNav = ({ activeSection }: { activeSection: string }) => {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-background/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:hidden"
      aria-label="Section navigation"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4 gap-1 px-2">
        {items.map(({ id, label, icon: Icon }) => {
          const active = activeSection === id;
          return (
            <li key={id} className="min-w-0">
              <a
                href={`#${id}`}
                className="flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl py-2 outline-none tap-highlight-transparent focus-visible:ring-2 focus-visible:ring-primary/75 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:bg-white/5"
                aria-current={active ? 'page' : undefined}
              >
                <m.span
                  className={`flex size-12 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    active ? 'bg-primary/20 text-primary' : 'text-muted-foreground'
                  }`}
                  layout
                >
                  <Icon className="size-6" aria-hidden />
                </m.span>
                <span
                  className={`max-w-full truncate px-0.5 text-center text-[10px] font-mono uppercase leading-tight tracking-tight sm:text-[11px] ${
                    active ? 'text-primary/90' : 'text-muted-foreground/80'
                  }`}
                >
                  {label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
