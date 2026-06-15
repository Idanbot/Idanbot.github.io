import { m } from 'framer-motion';

const items = [
  { id: 'hero', label: 'Profile' },
  { id: 'skills', label: 'Stack' },
  { id: 'history', label: 'Experience' },
  { id: 'monitor', label: 'Live' },
];

export function DesktopNav({ activeSection }: { activeSection: string }) {
  return (
    <nav
      className="liquid-glass fixed left-1/2 top-6 z-[70] hidden w-[92%] max-w-xl -translate-x-1/2 rounded-full p-1.5 lg:block"
      aria-label="Primary navigation"
    >
      <ul className="relative z-[1] grid grid-cols-4 gap-1 text-sm font-medium text-white/60">
        {items.map((navItem) => {
          const active = activeSection === navItem.id;
          return (
            <li key={navItem.id} className="min-w-0">
              <a
                href={`#${navItem.id}`}
                aria-current={active ? 'page' : undefined}
                className="group relative flex h-10 w-full items-center justify-center overflow-hidden rounded-full px-3 text-center transition-colors duration-200 hover:text-white focus-visible:ring-2 focus-visible:ring-cloud/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span className="absolute inset-0 rounded-full bg-white/[0.035] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                {active ? (
                  <m.span
                    layoutId="desktop-nav-active-pill"
                    className="liquid-glass-control absolute inset-0 rounded-full"
                    transition={{ type: 'spring', stiffness: 420, damping: 36, mass: 0.72 }}
                    aria-hidden
                  />
                ) : null}
                <span className={`relative z-[1] truncate transition-colors duration-200 ${active ? 'text-white' : ''}`}>
                  {navItem.label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
