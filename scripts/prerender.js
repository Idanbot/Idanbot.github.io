/* eslint-disable no-undef */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

async function main() {
  console.log('Building SSR bundle...');
  execSync('npx vite build --ssr src/entry-server.tsx --outDir dist-server', {
    cwd: root,
    stdio: 'inherit',
  });

  console.log('Loading SSR render function...');
  const serverEntryPath = path.resolve(root, 'dist-server/entry-server.js');
  const { render } = await import(serverEntryPath);

  console.log('Reading dist/index.html...');
  const templatePath = path.resolve(root, 'dist/index.html');
  let html = fs.readFileSync(templatePath, 'utf-8');

  console.log('Rendering app...');
  const appHtml = render();

  console.log('Injecting pre-rendered content...');
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${appHtml}</div>`
  );

  console.log('Writing back to dist/index.html...');
  fs.writeFileSync(templatePath, html, 'utf-8');

  console.log('Cleaning up dist-server...');
  fs.rmSync(path.resolve(root, 'dist-server'), { recursive: true, force: true });

  console.log('Prerendering completed successfully!');
}

main().catch((err) => {
  console.error('Prerendering failed:', err);
  process.exit(1);
});
