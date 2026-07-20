import React, { type ReactElement } from 'react'
import { hydrateRoot, createRoot } from 'react-dom/client'
import { NavIsland } from './islands/NavIsland.tsx'
import { HeroIsland } from './islands/HeroIsland.tsx'
import { MonitorIsland } from './islands/MonitorIsland.tsx'
import './index.css'

// Interactive islands hydrate independently; the sections between them are
// static prerendered HTML that never ships or hydrates JavaScript.
const islands: [string, ReactElement][] = [
  ['nav-root', <NavIsland />],
  ['hero-root', <HeroIsland />],
  ['monitor-root', <MonitorIsland />],
];

for (const [id, element] of islands) {
  const container = document.getElementById(id);
  if (!container) continue;
  const app = <React.StrictMode>{element}</React.StrictMode>;
  if (container.hasChildNodes()) {
    hydrateRoot(container, app);
  } else {
    createRoot(container).render(app);
  }
}
