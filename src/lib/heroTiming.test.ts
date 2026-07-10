import { describe, expect, it } from 'vitest';
import { createHeroFrameClock, frameDamping, HERO_TARGET_FPS } from './heroTiming';

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

  it('keeps easing independent of display frame rate', () => {
    const rate = 2.5;
    const thirtyFpsProgress = 1 - Math.pow(1 - frameDamping(rate, 1 / 30), 30);
    const sixtyFpsProgress = 1 - Math.pow(1 - frameDamping(rate, 1 / 60), 60);

    expect(sixtyFpsProgress).toBeCloseTo(thirtyFpsProgress, 8);
  });
});
