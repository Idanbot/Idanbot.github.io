import { describe, expect, it } from 'vitest';
import {
  createHeroFrameClock,
  frameDamping,
  getHeroPixelRatio,
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

  it('caps full-quality rendering to the pixel budget at 1080p and 4K', () => {
    for (const [width, height] of [
      [1920, 1080],
      [3840, 2160],
    ]) {
      const ratio = getHeroPixelRatio(width, height, 2, 'full');
      const renderedPixels = width * height * ratio * ratio;
      expect(renderedPixels).toBeLessThanOrEqual(HERO_RENDER_PIXEL_BUDGET.full + 1);
    }
  });

  it('keeps easing independent of display frame rate', () => {
    const rate = 2.5;
    const thirtyFpsProgress = 1 - Math.pow(1 - frameDamping(rate, 1 / 30), 30);
    const sixtyFpsProgress = 1 - Math.pow(1 - frameDamping(rate, 1 / 60), 60);

    expect(sixtyFpsProgress).toBeCloseTo(thirtyFpsProgress, 8);
  });
});
