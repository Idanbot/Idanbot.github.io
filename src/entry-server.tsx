import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { NavIsland } from './islands/NavIsland';
import { HeroIsland } from './islands/HeroIsland';
import { MonitorIsland } from './islands/MonitorIsland';
import { FooterIsland } from './islands/FooterIsland';
import { StaticSections } from './StaticSections';

const render = (element: React.ReactElement) =>
  ReactDOMServer.renderToString(<React.StrictMode>{element}</React.StrictMode>);

export function renderIslands() {
  return {
    nav: render(<NavIsland />),
    hero: render(<HeroIsland />),
    monitor: render(<MonitorIsland />),
    staticSections: render(<StaticSections />),
    footer: render(<FooterIsland />),
  };
}
