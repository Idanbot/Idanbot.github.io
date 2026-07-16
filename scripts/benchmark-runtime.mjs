/* global console, document, PerformanceObserver, performance, process, requestAnimationFrame, window */

import { chromium } from '@playwright/test';
import { preview } from 'vite';

const headed = process.env.PERF_HEADED === '1';
const durationMs = 3_000;
const viewports = [
  { name: 'S23', width: 360, height: 780, deviceScaleFactor: 3 },
  { name: '1080p', width: 1920, height: 1080, deviceScaleFactor: 1 },
  { name: '1440p', width: 2560, height: 1440, deviceScaleFactor: 1 },
  { name: '4K', width: 3840, height: 2160, deviceScaleFactor: 1 },
];

const server = await preview({
  logLevel: 'silent',
  preview: { host: '127.0.0.1', port: 0 },
});
const url = server.resolvedUrls?.local[0];

if (!url) {
  await server.close();
  throw new Error('Vite preview did not expose a local URL. Run npm run build first.');
}

const browser = await chromium.launch({
  headless: !headed,
  args: ['--enable-webgl', '--ignore-gpu-blocklist'],
});
const results = [];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: viewport.deviceScaleFactor,
    });
    const page = await context.newPage();

    await page.addInitScript(() => {
      window.__heroFrameProbe = { frames: 0, renderMs: 0, maxRenderMs: 0 };
      window.__runtimeBenchmark = { longTasks: [], layoutShifts: [] };
      new PerformanceObserver((list) => {
        window.__runtimeBenchmark.longTasks.push(
          ...list.getEntries().map((entry) => entry.duration)
        );
      }).observe({ type: 'longtask', buffered: true });
      new PerformanceObserver((list) => {
        window.__runtimeBenchmark.layoutShifts.push(
          ...list
            .getEntries()
            .filter((entry) => !entry.hadRecentInput)
            .map((entry) => entry.value)
        );
      }).observe({ type: 'layout-shift', buffered: true });
    });

    await page.goto(url, { waitUntil: 'load' });
    await page.waitForSelector('[data-hero-renderer="webgl"]', { timeout: 10_000 });
    // Wait through warmup and until adaptive resolution has stopped changing.
    await page.evaluate(async () => {
      const startedAt = performance.now();
      const deadline = startedAt + 25_000;
      let previousSize = '';
      let stableSince = startedAt;

      while (performance.now() < deadline) {
        const canvas = document.querySelector('canvas');
        const size = canvas ? `${canvas.width}x${canvas.height}` : '';
        if (size !== previousSize) {
          previousSize = size;
          stableSince = performance.now();
        }

        if (performance.now() - startedAt >= 2_000 && performance.now() - stableSince >= 1_500) {
          return;
        }
        await new Promise((resolve) => window.setTimeout(resolve, 250));
      }
    });

    const result = await page.evaluate(
      (sampleDuration) =>
        new Promise((resolve) => {
          window.__heroFrameProbe = { frames: 0, renderMs: 0, maxRenderMs: 0 };
          const startedAt = performance.now();
          let browserFrames = 0;

          const sample = (timestamp) => {
            browserFrames += 1;
            if (timestamp - startedAt < sampleDuration) {
              requestAnimationFrame(sample);
              return;
            }

            const resources = performance.getEntriesByType('resource');
            const navigation = performance.getEntriesByType('navigation')[0];
            const probe = window.__heroFrameProbe;
            const canvas = document.querySelector('#hero canvas');
            resolve({
              loadMs: navigation.loadEventEnd,
              browserFps: (browserFrames * 1000) / sampleDuration,
              sceneFps: (probe.frames * 1000) / sampleDuration,
              averageRenderMs: probe.frames > 0 ? probe.renderMs / probe.frames : 0,
              maxRenderMs: probe.maxRenderMs,
              transferKiB:
                resources.reduce((total, resource) => total + (resource.transferSize || 0), 0) /
                1024,
              requests: resources.length,
              elements: document.querySelectorAll('*').length,
              cls: window.__runtimeBenchmark.layoutShifts.reduce(
                (total, value) => total + value,
                0
              ),
              longTasks: window.__runtimeBenchmark.longTasks.length,
              canvas: canvas ? `${canvas.width}x${canvas.height}` : 'missing',
            });
          };

          requestAnimationFrame(sample);
        }),
      durationMs
    );
    results.push({ viewport: viewport.name, ...result });
    console.log(
      `${viewport.name}: ${result.sceneFps.toFixed(1)} FPS, ${result.canvas}, ` +
        `${result.averageRenderMs.toFixed(2)}ms average render submission`
    );
    await context.close();
  }
} finally {
  await browser.close();
  await server.close();
}

console.table(
  results.map((result) => ({
    viewport: result.viewport,
    loadMs: result.loadMs.toFixed(0),
    browserFps: result.browserFps.toFixed(1),
    sceneFps: result.sceneFps.toFixed(1),
    avgRenderMs: result.averageRenderMs.toFixed(2),
    maxRenderMs: result.maxRenderMs.toFixed(2),
    transferKiB: result.transferKiB.toFixed(1),
    requests: result.requests,
    elements: result.elements,
    cls: result.cls.toFixed(3),
    longTasks: result.longTasks,
    canvas: result.canvas,
  }))
);

const failures = results.flatMap((result) => {
  const viewportFailures = [];
  const tallViewportLoadsNextSection = result.viewport === '4K';
  const transferBudget = tallViewportLoadsNextSection ? 380 : 320;
  const requestBudget = tallViewportLoadsNextSection ? 12 : 6;
  const elementBudget = tallViewportLoadsNextSection ? 850 : 200;
  if (result.averageRenderMs > 2) viewportFailures.push('average render submission exceeds 2ms');
  if (result.maxRenderMs > 8) viewportFailures.push('maximum render submission exceeds 8ms');
  if (result.transferKiB > transferBudget) {
    viewportFailures.push(`initial transfer exceeds ${transferBudget} KiB`);
  }
  if (result.requests > requestBudget) {
    viewportFailures.push(`initial request count exceeds ${requestBudget}`);
  }
  if (result.elements > elementBudget) {
    viewportFailures.push(`initial DOM exceeds ${elementBudget} elements`);
  }
  if (result.cls > 0.01) viewportFailures.push('CLS exceeds 0.01');
  if (headed && result.sceneFps < 55) viewportFailures.push('headed scene rate is below 55 FPS');
  return viewportFailures.map((failure) => `${result.viewport}: ${failure}`);
});

if (failures.length > 0) {
  console.error(`Runtime performance budget failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`);
  process.exitCode = 1;
}
