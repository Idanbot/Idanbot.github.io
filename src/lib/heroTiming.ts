export const HERO_TARGET_FPS = {
  full: 60,
  reduced: 30,
} as const;

export const HERO_RESOLUTION_TIERS = {
  '480p': { width: 854, height: 480 },
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
  '1440p': { width: 2560, height: 1440 },
  '4k': { width: 3840, height: 2160 },
} as const;

export type HeroResolutionTier = keyof typeof HERO_RESOLUTION_TIERS;

export const HERO_INITIAL_RESOLUTION_TIER: HeroResolutionTier = '1080p';
const HERO_RESOLUTION_TIER_ORDER: HeroResolutionTier[] = [
  '480p',
  '720p',
  '1080p',
  '1440p',
  '4k',
];
const HERO_FPS_SAMPLE_SECONDS = 5;
const HERO_FPS_WARMUP_SECONDS = 1;
const HERO_UPSCALE_FPS = 58.5;
const HERO_HIGH_TIER_FLOOR_FPS = 55;
const HERO_PIXEL_RATIO_STEP = 0.01;
const HERO_FAILED_TIER_COOLDOWN_WINDOWS = 6;

export function getHeroTierPixelRatio(
  width: number,
  height: number,
  tier: HeroResolutionTier
) {
  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  const target = HERO_RESOLUTION_TIERS[tier];
  const landscape = safeWidth >= safeHeight;
  const targetWidth = landscape ? target.width : target.height;
  const targetHeight = landscape ? target.height : target.width;

  return Math.min(targetWidth / safeWidth, targetHeight / safeHeight);
}

export function approachHeroPixelRatio(current: number, target: number) {
  if (current === target) return target;
  const maximumChange = Math.max(0.001, current * HERO_PIXEL_RATIO_STEP);
  if (Math.abs(target - current) <= maximumChange) return target;
  return current + Math.sign(target - current) * maximumChange;
}

export interface AdaptiveResolutionController {
  recordFrame: (deltaSeconds: number, transitioning?: boolean) => HeroResolutionTier | null;
  getTier: () => HeroResolutionTier;
  isSettled: () => boolean;
}

export function createAdaptiveResolutionController(
  initialTier: HeroResolutionTier = HERO_INITIAL_RESOLUTION_TIER
): AdaptiveResolutionController {
  let currentTier = initialTier;
  let blockedTierIndex: number | null = null;
  let blockedWindows = 0;
  let settled = false;
  let warmupSeconds = 0;
  let sampleFrames = 0;
  let sampleSeconds = 0;

  const resetSample = () => {
    sampleFrames = 0;
    sampleSeconds = 0;
  };

  return {
    recordFrame(deltaSeconds, transitioning = false) {
      if (transitioning) {
        resetSample();
        return null;
      }
      if (deltaSeconds <= 0) return null;
      if (warmupSeconds < HERO_FPS_WARMUP_SECONDS) {
        warmupSeconds += deltaSeconds;
        return null;
      }

      sampleFrames += 1;
      sampleSeconds += Math.max(0, deltaSeconds);
      if (sampleSeconds < HERO_FPS_SAMPLE_SECONDS) return null;

      const averageFps = sampleFrames / sampleSeconds;
      resetSample();
      const currentIndex = HERO_RESOLUTION_TIER_ORDER.indexOf(currentTier);
      let nextTier = currentTier;
      if (blockedWindows > 0) blockedWindows -= 1;
      if (blockedWindows === 0) blockedTierIndex = null;

      const blockCurrentTier = () => {
        blockedTierIndex = currentIndex;
        blockedWindows = HERO_FAILED_TIER_COOLDOWN_WINDOWS;
      };

      if (averageFps < 15) {
        nextTier = '480p';
        if (currentIndex > 0) blockCurrentTier();
        settled = true;
      } else if (averageFps < 30) {
        nextTier = '720p';
        if (currentIndex > 1) blockCurrentTier();
        settled = true;
      } else if (currentIndex > 2 && averageFps < HERO_HIGH_TIER_FLOOR_FPS) {
        nextTier = HERO_RESOLUTION_TIER_ORDER[currentIndex - 1];
        blockCurrentTier();
        settled = true;
      } else if (
        averageFps >= HERO_UPSCALE_FPS &&
        currentIndex < HERO_RESOLUTION_TIER_ORDER.length - 1 &&
        blockedTierIndex !== currentIndex + 1
      ) {
        nextTier = HERO_RESOLUTION_TIER_ORDER[currentIndex + 1];
        settled = false;
      } else {
        settled = true;
      }

      if (nextTier === currentTier) return null;
      currentTier = nextTier;
      return currentTier;
    },
    getTier: () => currentTier,
    isSettled: () => settled,
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

      const deltaSeconds = Math.min(accumulatedMs / 1000, 0.25);
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
