import { m } from 'framer-motion';

const items = [
  { id: 'hero', label: 'Profile' },
  { id: 'skills', label: 'Stack' },
  { id: 'history', label: 'Experience' },
  { id: 'monitor', label: 'Live' },
];

export function DesktopNav({ activeSection }: { activeSection: string }) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;

    const navElement = e.currentTarget;
    const focusableElements = Array.from(
      navElement.querySelectorAll<HTMLAnchorElement>('a')
    );
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLAnchorElement);
    if (currentIndex === -1) return;

    e.preventDefault();
    let nextIndex = currentIndex;
    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % focusableElements.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
    }

    focusableElements[nextIndex]?.focus();
  };

  return (
    <nav
      className="liquid-glass fixed left-1/2 top-6 z-[70] hidden w-[92%] max-w-xl -translate-x-1/2 rounded-full p-1.5 lg:block overflow-hidden"
      aria-label="Primary navigation"
      onKeyDown={handleKeyDown}
    >

      {/* Dynamic background liquid blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none rounded-full opacity-45 mix-blend-screen">
        <div className="absolute top-[-90%] left-[-20%] size-44 rounded-full bg-cloud/35 blur-3xl animate-blob-orbit-1" />
        <div className="absolute bottom-[-90%] right-[-20%] size-44 rounded-full bg-platform/25 blur-3xl animate-blob-orbit-2" />
        <div className="absolute top-[10%] left-[30%] size-40 rounded-full bg-backend/20 blur-3xl animate-blob-orbit-3" />
      </div>

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
                    className="liquid-glass-control absolute inset-0 rounded-full overflow-hidden"
                    transition={{ type: 'spring', stiffness: 420, damping: 36, mass: 0.72 }}
                    aria-hidden
                  >
                    {/* Active liquid pulse gradient */}
                    <span className="absolute inset-0 bg-gradient-to-tr from-cloud/30 via-platform/15 to-transparent animate-gradient-shift" />
                  </m.span>
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
