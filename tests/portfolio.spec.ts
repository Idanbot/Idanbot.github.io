import { expect, test, type Page, type TestInfo } from '@playwright/test';

const heartbeatUrl = 'https://device-heartbeat-monitor.botbolidan.workers.dev/';
const heartbeatMachines = [
  {
    id: 'build-01',
    name: 'build-agent',
    heartbeat: 1,
    last_timestamp: new Date().toISOString(),
    last_healthy_timestamp: new Date().toISOString(),
    unavailable_since_timestamp: null,
    alert_sent_at: null,
  },
  {
    id: 'nas-01',
    name: 'home-nas',
    heartbeat: 0,
    last_timestamp: '2026-01-01T00:00:00.000Z',
    last_healthy_timestamp: '2026-01-01T00:00:00.000Z',
    unavailable_since_timestamp: '2026-01-01T00:10:00.000Z',
    alert_sent_at: '2026-01-01T00:15:00.000Z',
  },
];

async function mockHeartbeats(page: Page, status = 200) {
  await page.route(`${heartbeatUrl}**`, async (route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: status === 200 ? JSON.stringify(heartbeatMachines) : JSON.stringify({ error: 'offline' }),
    });
  });
}

async function enableFullRenderer(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'hardwareConcurrency', { configurable: true, get: () => 8 });
    Object.defineProperty(navigator, 'deviceMemory', { configurable: true, get: () => 8 });
  });
}

async function canvasSignature(page: Page) {
  return page.locator('#hero canvas').evaluate((canvas: HTMLCanvasElement) => {
    // Resize listeners render synchronously, before the non-preserved WebGL buffer is composited away.
    window.dispatchEvent(new Event('resize'));
    const context =
      (canvas.getContext('webgl2') as WebGL2RenderingContext | null) ??
      (canvas.getContext('webgl') as WebGLRenderingContext | null);
    if (!context || canvas.width === 0 || canvas.height === 0) return { colored: 0, checksum: 0 };

    const pixels = new Uint8Array(canvas.width * canvas.height * 4);
    context.readPixels(
      0,
      0,
      canvas.width,
      canvas.height,
      context.RGBA,
      context.UNSIGNED_BYTE,
      pixels
    );
    let colored = 0;
    let checksum = 0;
    for (let index = 0; index < pixels.length; index += 64) {
      const value = pixels[index] + pixels[index + 1] + pixels[index + 2] + pixels[index + 3];
      if (value > 0) colored += 1;
      checksum = (checksum + value * (index + 1)) % 2_147_483_647;
    }
    return { colored, checksum };
  });
}

async function verifyAnimatedHero(page: Page, testInfo: TestInfo) {
  const background = page.locator('[data-hero-renderer]');
  await expect(background).toHaveAttribute('data-hero-renderer', 'webgl', { timeout: 15_000 });

  const heroBox = await page.locator('#hero').boundingBox();
  const canvasBox = await page.locator('#hero canvas').boundingBox();
  expect(heroBox).not.toBeNull();
  expect(canvasBox).not.toBeNull();
  expect(Math.abs((heroBox?.width ?? 0) - (canvasBox?.width ?? 0))).toBeLessThan(2);
  expect(Math.abs((heroBox?.height ?? 0) - (canvasBox?.height ?? 0))).toBeLessThan(2);

  await expect
    .poll(async () => (await canvasSignature(page)).colored, { timeout: 10_000 })
    .toBeGreaterThan(20);
  const first = await canvasSignature(page);
  await page.mouse.move(50, 50);
  await page.waitForTimeout(250);
  const second = await canvasSignature(page);
  expect(second.checksum).not.toBe(first.checksum);

  await testInfo.attach(`hero-${testInfo.project.name}-${page.viewportSize()?.width}`, {
    body: await page.locator('#hero').screenshot(),
    contentType: 'image/png',
  });
}

test('renders the prerendered profile without runtime errors', async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });
  await mockHeartbeats(page);
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Resilient Systems.');
  await expect(page.getByRole('button', { name: /try the terminal/i })).toBeVisible();
  await expect(page.locator('script[src="/src/main.tsx"]')).toHaveCount(0);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  expect(runtimeErrors).toEqual([]);
});

test('loads lazy sections when desktop navigation targets them', async ({ page }) => {
  await mockHeartbeats(page);
  await page.goto('/');

  await page.getByRole('link', { name: 'Live', exact: true }).click();

  await expect(page).toHaveURL(/#monitor$/);
  await expect(page.getByRole('heading', { name: /Live System Monitor/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Live Device Heartbeats' })).toBeVisible();
  await expect(page.getByText('build-agent', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Live', exact: true })).toHaveAttribute(
    'aria-current',
    'page'
  );
});

test('runs heartbeat commands through the terminal interface', async ({ page }) => {
  await mockHeartbeats(page);
  await page.goto('/');
  await page.getByRole('button', { name: /try the terminal/i }).click();

  const terminal = page.getByRole('dialog', { name: 'Terminal' });
  const input = page.getByRole('textbox', { name: 'Terminal command input' });
  await expect(terminal).toBeVisible();
  await input.fill('heartbeat');
  await input.press('Enter');
  await expect(terminal).toContainText('build-agent: online');
  await expect(terminal).toContainText('home-nas: offline');

  await input.fill('heartbeat -json');
  await input.press('Enter');
  await expect(terminal).toContainText('"name": "build-agent"');
});

test('centers the command palette in the current viewport', async ({ page }) => {
  await mockHeartbeats(page);
  await page.goto('/#history');
  await page.locator('#history').scrollIntoViewIfNeeded();
  await expect(page.getByRole('heading', { name: 'Professional Trajectory' })).toBeVisible();
  await page.keyboard.press('Control+k');

  const palette = page.getByRole('dialog', { name: 'Global Command Menu' });
  await expect(palette).toBeVisible();
  const box = await palette.boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  // Scrollbar reservation can shift the layout viewport by half its width.
  expect(Math.abs((box?.x ?? 0) + (box?.width ?? 0) / 2 - (viewport?.width ?? 0) / 2)).toBeLessThan(8);
  expect(Math.abs((box?.y ?? 0) + (box?.height ?? 0) / 2 - (viewport?.height ?? 0) / 2)).toBeLessThan(8);
});

test('shows a useful live-status error state', async ({ page }) => {
  await mockHeartbeats(page, 503);
  await page.goto('/#monitor');

  await expect(page.getByRole('heading', { name: 'Connection error' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry connection' })).toBeVisible();
});

test('renders a nonblank moving Three.js scene on desktop and mobile', async ({ page }, testInfo) => {
  await enableFullRenderer(page);
  await mockHeartbeats(page);
  await page.goto('/');
  await verifyAnimatedHero(page, testInfo);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await verifyAnimatedHero(page, testInfo);
});

test('keeps the immediate poster for reduced motion without loading WebGL', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  await expect(page.locator('[data-hero-renderer]')).toHaveAttribute('data-hero-renderer', 'poster');
  await page.waitForTimeout(800);
  await expect(page.locator('[data-hero-renderer]')).toHaveAttribute('data-hero-renderer', 'poster');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('keeps meaningful prerendered content visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Resilient Systems.');
    await expect(page.getByText('Cloud platforms, delivery, and observability.')).toBeVisible();
    await expect(page.getByText('Cloud architecture with backend depth.')).toBeVisible();
  });
});
