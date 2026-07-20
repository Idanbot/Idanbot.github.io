/* eslint-disable no-undef */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

async function main() {
  const serverDir = path.resolve(root, 'dist-server');
  try {
    console.log('Building SSR bundle...');
    execSync('npx vite build --ssr src/entry-server.tsx --outDir dist-server', {
      cwd: root,
      stdio: 'inherit',
    });

    console.log('Loading SSR render function...');
    const serverEntryPath = path.resolve(serverDir, 'entry-server.js');
    const { renderIslands } = await import(serverEntryPath);

    console.log('Reading dist/index.html...');
    const templatePath = path.resolve(root, 'dist/index.html');
    let html = fs.readFileSync(templatePath, 'utf-8');

    console.log('Rendering islands...');
    const islands = renderIslands();

    console.log('Injecting pre-rendered content...');
    const containers = {
      nav: 'nav-root',
      hero: 'hero-root',
      monitor: 'monitor-root',
      staticSections: 'static-sections',
      footer: 'footer-root',
    };
    for (const [key, id] of Object.entries(containers)) {
      const marker = `<div id="${id}"></div>`;
      const markerCount = html.split(marker).length - 1;
      if (markerCount !== 1) throw new Error(`Expected one #${id} marker, found ${markerCount}`);
      const islandHtml = islands[key];
      if (!islandHtml?.trim()) throw new Error(`SSR renderer returned empty markup for ${key}`);
      html = html.replace(marker, `<div id="${id}">${islandHtml}</div>`);
      if (html.includes(marker)) throw new Error(`Empty #${id} marker remained after prerendering`);
    }

    console.log('Inlining critical CSS...');
    const stylesheetLinkPattern = /<link rel="stylesheet"[^>]*href="\/(assets\/[^"]+\.css)"[^>]*>/;
    const stylesheetMatch = html.match(stylesheetLinkPattern);
    if (stylesheetMatch) {
      const cssPath = path.resolve(root, 'dist', stylesheetMatch[1]);
      const css = fs.readFileSync(cssPath, 'utf-8');
      if (css.includes('</style>')) throw new Error('CSS contains </style>; cannot inline safely');
      html = html.replace(
        stylesheetMatch[0],
        `<style data-inlined-css="/${stylesheetMatch[1]}">${css}</style>`
      );
    }

    console.log('Writing back to dist/index.html...');
    fs.writeFileSync(templatePath, html, 'utf-8');

    console.log('Prerendering completed successfully!');
  } finally {
    console.log('Cleaning up dist-server...');
    fs.rmSync(serverDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error('Prerendering failed:', err);
  process.exit(1);
});
