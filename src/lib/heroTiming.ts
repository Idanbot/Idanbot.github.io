export const HERO_TARGET_FPS = {
  full: 60,
  reduced: 30,
} as const;

export const HERO_RENDER_PIXEL_BUDGET = {
  full: 520_000,
  reduced: 240_000,
} as const;

const HERO_REFERENCE_AREA = 1920 * 1080;
const HERO_MAX_FULL_PIXEL_BUDGET = 1_050_000;
export const HERO_MAX_CANVAS_LONG_EDGE = 3840;
export const HERO_MAX_CANVAS_SHORT_EDGE = 2160;
const ADAPTIVE_WARMUP_FRAMES = 60;
const ADAPTIVE_SAMPLE_FRAMES = 30;
const ADAPTIVE_RATIO_STEP = 1.01;
const ADAPTIVE_RATIO_EPSILON = 0.0005;
const ADAPTIVE_CLIMB_FPS = 58;
const ADAPTIVE_FLOOR_FPS = 55;

export function getHeroRenderPixelBudget(
  width: number,
  height: number,
  quality: keyof typeof HERO_RENDER_PIXEL_BUDGET
) {
  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  const narrowPortraitMultiplier = safeHeight > safeWidth && safeWidth < 768 ? 0.82 : 1;

  if (quality === 'reduced') {
    return HERO_RENDER_PIXEL_BUDGET.reduced * narrowPortraitMultiplier;
  }

  const viewportScale = Math.max(
    1,
    Math.sqrt((safeWidth * safeHeight) / HERO_REFERENCE_AREA)
  );
  return (
    Math.min(HERO_RENDER_PIXEL_BUDGET.full * viewportScale, HERO_MAX_FULL_PIXEL_BUDGET) *
    narrowPortraitMultiplier
  );
}

export function getHeroPixelRatio(
  width: number,
  height: number,
  devicePixelRatio: number,
  quality: keyof typeof HERO_RENDER_PIXEL_BUDGET
) {
  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  const pixelBudget = getHeroRenderPixelBudget(safeWidth, safeHeight, quality);
  const budgetRatio = Math.sqrt(pixelBudget / (safeWidth * safeHeight));
  const qualityCap = quality === 'full' ? 1.25 : 0.85;

  return Math.max(0.2, Math.min(devicePixelRatio || 1, qualityCap, budgetRatio));
}

export function getHeroMaxPixelRatio(
  width: number,
  height: number,
  devicePixelRatio: number,
  quality: keyof typeof HERO_RENDER_PIXEL_BUDGET
) {
  if (quality === 'reduced') {
    return getHeroPixelRatio(width, height, devicePixelRatio, quality);
  }

  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  const landscape = safeWidth >= safeHeight;
  const maximumWidth = landscape ? HERO_MAX_CANVAS_LONG_EDGE : HERO_MAX_CANVAS_SHORT_EDGE;
  const maximumHeight = landscape ? HERO_MAX_CANVAS_SHORT_EDGE : HERO_MAX_CANVAS_LONG_EDGE;
  const canvasRatio = Math.min(maximumWidth / safeWidth, maximumHeight / safeHeight);

  return Math.max(
    getHeroPixelRatio(width, height, devicePixelRatio, quality),
    canvasRatio
  );
}

export interface AdaptivePixelRatioController {
  recordFrame: (deltaSeconds: number) => number | null;
  getPixelRatio: () => number;
}

export function createAdaptivePixelRatioController(
  initialPixelRatio: number,
  maximumPixelRatio: number
): AdaptivePixelRatioController {
  let currentRatio = initialPixelRatio;
  let stableRatio = initialPixelRatio;
  let ceilingRatio = Math.max(initialPixelRatio, maximumPixelRatio);
  let warmupFrames = 0;
  let sampleFrames = 0;
  let sampleSeconds = 0;

  const resetSample = () => {
    sampleFrames = 0;
    sampleSeconds = 0;
  };

  return {
    recordFrame(deltaSeconds) {
      if (warmupFrames < ADAPTIVE_WARMUP_FRAMES) {
        warmupFrames += 1;
        return null;
      }

      sampleFrames += 1;
      sampleSeconds += Math.max(0, deltaSeconds);
      if (sampleFrames < ADAPTIVE_SAMPLE_FRAMES) return null;

      const sampledFps = sampleSeconds > 0 ? sampleFrames / sampleSeconds : 60;
      resetSample();

      if (sampledFps >= ADAPTIVE_CLIMB_FPS) {
        stableRatio = currentRatio;
        const nextRatio = Math.min(ceilingRatio, currentRatio * ADAPTIVE_RATIO_STEP);
        if (nextRatio <= currentRatio + ADAPTIVE_RATIO_EPSILON) return null;
        currentRatio = nextRatio;
        return currentRatio;
      }

      if (sampledFps >= ADAPTIVE_FLOOR_FPS) {
        stableRatio = currentRatio;
        ceilingRatio = currentRatio;
        return null;
      }

      if (currentRatio > stableRatio + ADAPTIVE_RATIO_EPSILON) {
        ceilingRatio = stableRatio;
        currentRatio = stableRatio;
        return currentRatio;
      }

      currentRatio = Math.max(0.2, currentRatio / ADAPTIVE_RATIO_STEP);
      stableRatio = currentRatio;
      ceilingRatio = currentRatio;
      return currentRatio;
    },
    getPixelRatio: () => currentRatio,
  };
}

export interface HeroFrameClock {
  tick: (timestamp: number) => number | null;
  reset: () => void;
}

export function createHeroFrameClock(targetFps: number): HeroFrameClock {
  const frameInterval = 1000 / targetFps;
  let previousTick: number | undefined;
  let accumulatedMs = 0;

  return {
    tick(timestamp) {
      if (previousTick === undefined) {
        previousTick = timestamp;
        return 1 / targetFps;
      }

      accumulatedMs += Math.max(0, timestamp - previousTick);
      previousTick = timestamp;
      // A small tolerance absorbs RAF timestamp jitter without quantizing high-refresh displays.
      if (accumulatedMs < frameInterval - 0.5) return null;

      const deltaSeconds = Math.min(accumulatedMs / 1000, 0.05);
      accumulatedMs = Math.max(0, accumulatedMs - frameInterval);
      if (accumulatedMs > frameInterval) accumulatedMs %= frameInterval;
      return deltaSeconds;
    },
    reset() {
      previousTick = undefined;
      accumulatedMs = 0;
    },
  };
}

export function frameDamping(ratePerSecond: number, deltaSeconds: number) {
  return 1 - Math.exp(-ratePerSecond * deltaSeconds);
}
