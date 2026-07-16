export const HERO_TARGET_FPS = {
  full: 60,
  reduced: 30,
} as const;

export const HERO_RENDER_PIXEL_BUDGET = {
  full: 520_000,
  reduced: 240_000,
} as const;

export function getHeroPixelRatio(
  width: number,
  height: number,
  devicePixelRatio: number,
  quality: keyof typeof HERO_RENDER_PIXEL_BUDGET
) {
  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  const portraitMultiplier = safeHeight > safeWidth ? 0.82 : 1;
  const pixelBudget = HERO_RENDER_PIXEL_BUDGET[quality] * portraitMultiplier;
  const budgetRatio = Math.sqrt(pixelBudget / (safeWidth * safeHeight));
  const qualityCap = quality === 'full' ? 1.25 : 0.85;

  return Math.max(0.2, Math.min(devicePixelRatio || 1, qualityCap, budgetRatio));
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
