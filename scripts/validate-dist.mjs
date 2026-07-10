/* global console, process */

import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'parse5';

const distDirectory = path.resolve('dist');
const htmlPath = path.join(distDirectory, 'index.html');
const html = await readFile(htmlPath, 'utf8');
const document = parse(html);
const failures = [];

function getAttribute(node, name) {
  return node.attrs?.find((attribute) => attribute.name === name)?.value;
}

function findElements(node, predicate, matches = []) {
  if (predicate(node)) matches.push(node);
  for (const child of node.childNodes ?? []) findElements(child, predicate, matches);
  if (node.content) findElements(node.content, predicate, matches);
  return matches;
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

async function assertFile(relativePath, label) {
  try {
    await access(path.join(distDirectory, relativePath));
  } catch {
    failures.push(`${label} is missing: ${relativePath}`);
  }
}

const root = findElements(
  document,
  (node) => node.tagName === 'div' && getAttribute(node, 'id') === 'root'
);
assert(root.length === 1, `expected one #root element, found ${root.length}`);
assert((root[0]?.childNodes?.length ?? 0) > 0, '#root must contain prerendered markup');
assert(!html.includes('/src/main.tsx'), 'production HTML must not reference /src/main.tsx');
assert(!html.includes('id="root"></div>'), 'production HTML must not contain an empty root');

const moduleScripts = findElements(
  document,
  (node) => node.tagName === 'script' && getAttribute(node, 'type') === 'module'
);
assert(moduleScripts.length === 1, `expected one module entry, found ${moduleScripts.length}`);

const stylesheets = findElements(
  document,
  (node) =>
    node.tagName === 'link' &&
    getAttribute(node, 'rel')?.split(/\s+/).includes('stylesheet')
);
assert(stylesheets.length >= 1, 'expected at least one stylesheet');

const localAssets = [];
for (const script of moduleScripts) {
  const source = getAttribute(script, 'src') ?? '';
  assert(/^\/assets\/[\w.-]+-[A-Za-z0-9_-]{8,}\.js$/.test(source), `module entry is not a hashed asset: ${source}`);
  if (source.startsWith('/')) localAssets.push(source.slice(1));
}
for (const stylesheet of stylesheets) {
  const source = getAttribute(stylesheet, 'href') ?? '';
  assert(/^\/assets\/[\w.-]+-[A-Za-z0-9_-]{8,}\.css$/.test(source), `stylesheet is not a hashed asset: ${source}`);
  if (source.startsWith('/')) localAssets.push(source.slice(1));
}
await Promise.all(localAssets.map((asset) => assertFile(asset, 'referenced asset')));

const canonical = findElements(
  document,
  (node) => node.tagName === 'link' && getAttribute(node, 'rel') === 'canonical'
)[0];
assert(getAttribute(canonical ?? {}, 'href') === 'https://idanbot.me/', 'canonical URL must be https://idanbot.me/');

const ogImage = findElements(
  document,
  (node) => node.tagName === 'meta' && getAttribute(node, 'property') === 'og:image'
)[0];
assert(Boolean(getAttribute(ogImage ?? {}, 'content')), 'Open Graph image metadata is missing');

await assertFile('og-image.svg', 'Open Graph image');
await assertFile('.nojekyll', 'GitHub Pages marker');
const cname = (await readFile(path.join(distDirectory, 'CNAME'), 'utf8')).trim();
assert(cname === 'idanbot.me', `CNAME must contain idanbot.me, received ${JSON.stringify(cname)}`);

if (failures.length > 0) {
  console.error(`Distribution contract failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`Distribution contract passed (${moduleScripts.length} module, ${localAssets.length} critical assets).`);
}
