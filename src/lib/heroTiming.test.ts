import { describe, expect, it } from 'vitest';
import {
  createAdaptivePixelRatioController,
  createHeroFrameClock,
  frameDamping,
  getHeroPixelRatio,
  getHeroMaxPixelRatio,
  getHeroRenderPixelBudget,
  HERO_MAX_CANVAS_LONG_EDGE,
  HERO_MAX_CANVAS_SHORT_EDGE,
  HERO_RENDER_PIXEL_BUDGET,
  HERO_TARGET_FPS,
} from './heroTiming';

describe('hero frame timing', () => {
  it('renders close to 60 FPS from a 120 Hz RAF stream', () => {
    const clock = createHeroFrameClock(HERO_TARGET_FPS.full);
    let renderedFrames = 0;

    for (let frame = 0; frame <= 120; frame += 1) {
      if (clock.tick(frame * (1000 / 120)) !== null) renderedFrames += 1;
    }

    expect(renderedFrames).toBeGreaterThanOrEqual(59);
    expect(renderedFrames).toBeLessThanOrEqual(62);
  });

  it('does not quantize a 90 Hz display down to 45 FPS', () => {
    const clock = createHeroFrameClock(HERO_TARGET_FPS.full);
    let renderedFrames = 0;

    for (let frame = 0; frame <= 90; frame += 1) {
      if (clock.tick(frame * (1000 / 90)) !== null) renderedFrames += 1;
    }

    expect(renderedFrames).toBeGreaterThanOrEqual(59);
    expect(renderedFrames).toBeLessThanOrEqual(62);
  });

  it('scales full-quality rendering conservatively from 1080p through 4K', () => {
    const budgets: number[] = [];

    for (const [width, height] of [
      [1920, 1080],
      [2560, 1440],
      [3840, 2160],
    ]) {
      const pixelBudget = getHeroRenderPixelBudget(width, height, 'full');
      const ratio = getHeroPixelRatio(width, height, 2, 'full');
      const renderedPixels = width * height * ratio * ratio;
      budgets.push(pixelBudget);
      expect(renderedPixels).toBeLessThanOrEqual(pixelBudget + 1);
    }

    expect(budgets[0]).toBe(HERO_RENDER_PIXEL_BUDGET.full);
    expect(budgets[1]).toBeGreaterThan(budgets[0]);
    expect(budgets[2]).toBeGreaterThan(budgets[1]);
    expect(budgets[2]).toBeLessThanOrEqual(1_050_000);
  });

  it('climbs to the dynamic maximum while frame rate remains healthy', () => {
    const controller = createAdaptivePixelRatioController(0.5, 1);
    const updates: number[] = [];

    for (let frame = 0; frame < 3_000; frame += 1) {
      const update = controller.recordFrame(1 / 60);
      if (update !== null) updates.push(update);
    }

    expect(updates.length).toBeGreaterThan(0);
    expect(updates[0]).toBeCloseTo(0.505, 5);
    expect(updates.every((ratio, index) => index === 0 || ratio / updates[index - 1] <= 1.011)).toBe(
      true
    );
    expect(controller.getPixelRatio()).toBeCloseTo(1, 5);
  });

  it('returns to the last stable ratio when a higher-resolution candidate degrades FPS', () => {
    const controller = createAdaptivePixelRatioController(0.5, 1);

    for (let frame = 0; frame < 90; frame += 1) controller.recordFrame(1 / 60);
    expect(controller.getPixelRatio()).toBeCloseTo(0.505, 5);

    for (let frame = 0; frame < 30; frame += 1) controller.recordFrame(1 / 50);
    expect(controller.getPixelRatio()).toBeCloseTo(0.5, 5);
  });

  it('steps down smoothly when performance degrades at the maximum', () => {
    const controller = createAdaptivePixelRatioController(1, 1);

    for (let frame = 0; frame < 90; frame += 1) controller.recordFrame(1 / 50);

    expect(controller.getPixelRatio()).toBeCloseTo(1 / 1.01, 5);
  });

  it('allows dynamic resolution up to a 4K canvas in either orientation', () => {
    const landscapeRatio = getHeroMaxPixelRatio(1920, 1080, 1, 'full');
    expect(1920 * landscapeRatio).toBeCloseTo(HERO_MAX_CANVAS_LONG_EDGE, 5);
    expect(1080 * landscapeRatio).toBeCloseTo(HERO_MAX_CANVAS_SHORT_EDGE, 5);

    const portraitRatio = getHeroMaxPixelRatio(360, 780, 3, 'full');
    expect(360 * portraitRatio).toBeLessThanOrEqual(HERO_MAX_CANVAS_SHORT_EDGE);
    expect(780 * portraitRatio).toBeCloseTo(HERO_MAX_CANVAS_LONG_EDGE, 5);
  });

  it('keeps easing independent of display frame rate', () => {
    const rate = 2.5;
    const thirtyFpsProgress = 1 - Math.pow(1 - frameDamping(rate, 1 / 30), 30);
    const sixtyFpsProgress = 1 - Math.pow(1 - frameDamping(rate, 1 / 60), 60);

    expect(sixtyFpsProgress).toBeCloseTo(thirtyFpsProgress, 8);
  });
});
