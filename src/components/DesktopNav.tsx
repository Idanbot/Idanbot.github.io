const items = [
  { id: 'hero', label: 'Profile' },
  { id: 'skills', label: 'Stack' },
  { id: 'history', label: 'Experience' },
  { id: 'monitor', label: 'Live' },
];

export function DesktopNav({ activeSection }: { activeSection: string }) {
  return (
    <nav
      className="liquid-glass fixed left-1/2 top-6 z-[70] hidden w-[92%] max-w-lg -translate-x-1/2 rounded-full px-4 py-2.5 lg:block"
      aria-label="Primary navigation"
    >
      <ul className="flex items-center justify-between gap-1 text-sm font-medium text-white/60">
        {items.map((navItem) => {
          const active = activeSection === navItem.id;
          return (
            <li key={navItem.id}>
              <a
                href={`#${navItem.id}`}
                aria-current={active ? 'page' : undefined}
                className={`relative z-[1] rounded-full px-3 py-1.5 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:ring-2 focus-visible:ring-cloud/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  active ? 'bg-white/[0.11] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' : ''
                }`}
              >
                {navItem.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
