const items = [
  { id: 'hero', label: 'Profile' },
  { id: 'skills', label: 'Stack' },
  { id: 'history', label: 'Experience' },
  { id: 'monitor', label: 'Live' },
];

export function DesktopNav({ activeSection }: { activeSection: string }) {
  const activeIndex = Math.max(0, items.findIndex((item) => item.id === activeSection));

  return (
    <nav
      className="liquid-glass fixed left-1/2 top-6 z-[70] hidden w-[92%] max-w-xl -translate-x-1/2 rounded-full p-1.5 lg:block"
      aria-label="Primary navigation"
    >
      <ul className="relative z-[1] grid grid-cols-4 text-sm font-medium text-white/60">
        <li
          aria-hidden
          className="liquid-glass-control pointer-events-none absolute inset-y-0 left-0 w-1/4 rounded-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        />
        {items.map((navItem) => {
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
