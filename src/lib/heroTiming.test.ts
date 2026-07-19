import { describe, expect, it } from 'vitest';
import {
  approachHeroPixelRatio,
  createAdaptiveResolutionController,
  createHeroFrameClock,
  frameDamping,
  getHeroTierPixelRatio,
  HERO_RESOLUTION_TIERS,
  HERO_TARGET_FPS,
  type AdaptiveResolutionController,
} from './heroTiming';

function sampleFps(
  controller: AdaptiveResolutionController,
  fps: number,
  seconds = 5.1
) {
  const frames = Math.ceil(fps * seconds);
  let update = null;
  for (let frame = 0; frame < frames; frame += 1) {
    update = controller.recordFrame(1 / fps) ?? update;
  }
  return update;
}

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

  it('starts from 1080p and preserves viewport orientation', () => {
    expect(getHeroTierPixelRatio(1920, 1080, '1080p')).toBe(1);

    const portraitRatio = getHeroTierPixelRatio(360, 780, '1080p');
    expect(360 * portraitRatio).toBeLessThanOrEqual(HERO_RESOLUTION_TIERS['1080p'].height);
    expect(780 * portraitRatio).toBeCloseTo(HERO_RESOLUTION_TIERS['1080p'].width, 5);
  });

  it('promotes 1080p to 1440p and then 4K after sustained 60 FPS samples', () => {
    const controller = createAdaptiveResolutionController();

    expect(sampleFps(controller, 60, 6.1)).toBe('1440p');
    expect(sampleFps(controller, 60)).toBe('4k');
    expect(sampleFps(controller, 60)).toBeNull();
  });

  it('waits for a complete five-second sample before changing tiers', () => {
    const controller = createAdaptiveResolutionController();

    expect(sampleFps(controller, 60, 1)).toBeNull();
    expect(sampleFps(controller, 60, 4.9)).toBeNull();
    expect(sampleFps(controller, 60, 0.2)).toBe('1440p');
  });

  it('selects 720p below 30 FPS and 480p below 15 FPS', () => {
    expect(sampleFps(createAdaptiveResolutionController(), 29, 6.1)).toBe('720p');
    expect(sampleFps(createAdaptiveResolutionController(), 14, 6.1)).toBe('480p');
  });

  it('returns one high-resolution tier when it cannot sustain 55 FPS', () => {
    const controller = createAdaptiveResolutionController('4k');
    expect(sampleFps(controller, 50, 6.1)).toBe('1440p');
    expect(sampleFps(controller, 60)).toBeNull();
    expect(controller.getTier()).toBe('1440p');

    for (let window = 0; window < 4; window += 1) {
      expect(sampleFps(controller, 60)).toBeNull();
    }
    expect(sampleFps(controller, 60)).toBe('4k');
  });

  it('approaches a new tier by at most one percent per rendered frame', () => {
    expect(approachHeroPixelRatio(1, 2)).toBeCloseTo(1.01, 8);
    expect(approachHeroPixelRatio(1, 0.5)).toBeCloseTo(0.99, 8);
    expect(approachHeroPixelRatio(1, 1.005)).toBeCloseTo(1.005, 8);
  });

  it('keeps easing independent of display frame rate', () => {
    const rate = 2.5;
    const thirtyFpsProgress = 1 - Math.pow(1 - frameDamping(rate, 1 / 30), 30);
    const sixtyFpsProgress = 1 - Math.pow(1 - frameDamping(rate, 1 / 60), 60);

    expect(sixtyFpsProgress).toBeCloseTo(thirtyFpsProgress, 8);
  });
});
