import type { KeyboardEvent } from 'react';
import { siteSections } from '@/data/siteActions';

export function DesktopNav({ activeSection }: { activeSection: string }) {
  const activeIndex = Math.max(0, siteSections.findIndex((item) => item.id === activeSection));

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;

    const focusableElements = Array.from(
      event.currentTarget.querySelectorAll<HTMLAnchorElement>('a')
    );
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLAnchorElement);
    if (currentIndex === -1) return;

    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = (currentIndex + direction + focusableElements.length) % focusableElements.length;
    focusableElements[nextIndex]?.focus();
  };

  return (
    <nav
      className="liquid-glass fixed left-1/2 top-6 z-[70] hidden w-[92%] max-w-xl -translate-x-1/2 overflow-hidden rounded-full p-1.5 lg:block"
      aria-label="Primary navigation"
      onKeyDown={handleKeyDown}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 rounded-full bg-[linear-gradient(110deg,rgba(96,165,250,0.12),transparent_38%,rgba(52,211,153,0.07)_72%,transparent)] opacity-70"
      />

      <ul className="relative z-[1] grid grid-cols-4 text-sm font-medium text-white/60">
        <li
          aria-hidden
          className="liquid-glass-control pointer-events-none absolute inset-y-0 left-0 z-0 w-1/4 overflow-hidden rounded-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        >
          <span className="absolute inset-0 bg-gradient-to-tr from-cloud/30 via-platform/15 to-transparent" />
        </li>
        {siteSections.map((navItem) => {
          const active = activeSection === navItem.id;
          return (
            <li key={navItem.id} className="min-w-0">
              <a
                href={`#${navItem.id}`}
                aria-current={active ? 'page' : undefined}
                className="group relative z-[1] flex h-10 w-full items-center justify-center overflow-hidden rounded-full px-3 text-center transition-colors duration-200 hover:text-white focus-visible:ring-2 focus-visible:ring-cloud/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span className="absolute inset-0 rounded-full bg-white/[0.035] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
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
