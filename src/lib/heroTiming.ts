export const HERO_TARGET_FPS = {
  full: 60,
  reduced: 30,
} as const;

export interface HeroFrameClock {
  tick: (timestamp: number) => number | null;
  reset: () => void;
}

export function createHeroFrameClock(targetFps: number): HeroFrameClock {
  const frameInterval = 1000 / targetFps;
  let previousFrame: number | undefined;

  return {
    tick(timestamp) {
      if (previousFrame === undefined) {
        previousFrame = timestamp;
        return 1 / targetFps;
      }

      const elapsed = timestamp - previousFrame;
      // The tolerance avoids dropping every other frame due to sub-millisecond RAF jitter.
      if (elapsed < frameInterval * 0.9) return null;
      previousFrame = timestamp;
      return Math.min(elapsed / 1000, 0.05);
    },
    reset() {
      previousFrame = undefined;
    },
  };
}

export function frameDamping(ratePerSecond: number, deltaSeconds: number) {
  return 1 - Math.exp(-ratePerSecond * deltaSeconds);
}
