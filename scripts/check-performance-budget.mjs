/* global console, process */

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const distDirectory = path.resolve('dist');
const kibibyte = 1024;

const gzipSize = async (relativePath) => gzipSync(await readFile(path.join(distDirectory, relativePath))).byteLength;
const formatSize = (bytes) => `${(bytes / kibibyte).toFixed(1)} KiB`;

const index = await readFile(path.join(distDirectory, 'index.html'), 'utf8');
const initialJavaScript = [
  ...index.matchAll(/<script[^>]+src="\/(assets\/[^"]+\.js)"/g),
  ...index.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="\/(assets\/[^"]+\.js)"/g),
].map((match) => match[1]);
const initialStyles = [...index.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="\/(assets\/[^"]+\.css)"/g)].map(
  (match) => match[1]
);
const fontDirectory = path.join(distDirectory, 'fonts');
const fonts = (await readdir(fontDirectory)).map((file) => 'fonts/' + file);
const assetDirectory = path.join(distDirectory, 'assets');
const heroSceneAsset = (await readdir(assetDirectory)).find(
  (file) =>
    (file.startsWith('heroScene-') || file.startsWith('three.')) && file.endsWith('.js')
);

const uniqueJavaScript = [...new Set(initialJavaScript)];
const initialJavaScriptBytes = await Promise.all(uniqueJavaScript.map(gzipSize));
const styleBytes = await Promise.all(initialStyles.map(gzipSize));
const fontBytes = await Promise.all(fonts.map(async (file) => (await readFile(path.join(distDirectory, file))).byteLength));
const heroSceneJavaScript = heroSceneAsset ? await gzipSize('assets/' + heroSceneAsset) : 0;

const measurements = {
  entryJavaScript: initialJavaScriptBytes[0] ?? 0,
  initialJavaScript: initialJavaScriptBytes.reduce((total, bytes) => total + bytes, 0),
  css: styleBytes.reduce((total, bytes) => total + bytes, 0),
  fonts: fontBytes.reduce((total, bytes) => total + bytes, 0),
  heroSceneJavaScript,
};

const budgets = {
  entryJavaScript: 70 * kibibyte,
  initialJavaScript: 76 * kibibyte,
  css: 18 * kibibyte,
  fonts: 90 * kibibyte,
  heroSceneJavaScript: 140 * kibibyte,
};

const failures = Object.entries(budgets)
  .filter(([name, budget]) => measurements[name] > budget)
  .map(([name, budget]) => `${name}: ${formatSize(measurements[name])} exceeds ${formatSize(budget)}`);

if (index.includes('tsparticles')) {
  failures.push('initial HTML must not preload tsparticles');
}

for (const [name, value] of Object.entries(measurements)) {
  console.log(`${name}: ${formatSize(value)}`);
}

if (failures.length > 0) {
  console.error(`Performance budget failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`);
  process.exitCode = 1;
}
