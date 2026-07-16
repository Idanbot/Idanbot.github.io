import { useEffect, useRef, useState } from 'react';
import type { HeroSceneController, HeroSceneQuality } from '@/lib/heroScene';

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export function HeroBackground({
  quality,
  animate,
}: {
  quality: HeroSceneQuality;
  animate: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendererReady, setRendererReady] = useState(false);

  useEffect(() => {
    setRendererReady(false);
    if (!animate || quality === 'reduced') return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const idleWindow = window as IdleWindow;
    let cancelled = false;
    let idleHandle: number | undefined;
    let animationFrame = 0;
    let controller: HeroSceneController | undefined;
    let removeSceneListeners = () => {};

    const startScene = async () => {
      try {
        const { createHeroScene } = await import('@/lib/heroScene');
        if (cancelled) return;

        controller = createHeroScene(canvas, quality);
        let visible = true;

        const resize = () => {
          if (!controller) return;
          const rect = container.getBoundingClientRect();
          controller.resize(rect.width, rect.height, window.devicePixelRatio || 1);
        };
        const syncPlayback = () => {
          if (!controller) return;
          if (visible && !document.hidden) controller.start();
          else controller.stop();
        };
        const handleVisibility = () => syncPlayback();
        const supportsPointerParallax = window.matchMedia('(pointer: fine)').matches;
        const handlePointerMove = (event: PointerEvent) => {
          if (!supportsPointerParallax || !controller || !visible) return;
          controller.setPointer(
            event.clientX / Math.max(1, window.innerWidth) - 0.5,
            event.clientY / Math.max(1, window.innerHeight) - 0.5
          );
        };
        const handleContextLost = (event: Event) => {
          event.preventDefault();
          controller?.stop();
          setRendererReady(false);
        };

        const intersectionObserver =
          typeof IntersectionObserver === 'undefined'
            ? undefined
            : new IntersectionObserver(
                ([entry]) => {
                  visible = entry.isIntersecting;
                  syncPlayback();
                },
                { rootMargin: '120px 0px', threshold: 0.02 }
              );
        intersectionObserver?.observe(container);

        const resizeObserver =
          typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(resize);
        resizeObserver?.observe(container);
        window.addEventListener('resize', resize);
        window.addEventListener('pointermove', handlePointerMove, { passive: true });
        document.addEventListener('visibilitychange', handleVisibility);
        canvas.addEventListener('webglcontextlost', handleContextLost);

        removeSceneListeners = () => {
          intersectionObserver?.disconnect();
          resizeObserver?.disconnect();
          window.removeEventListener('resize', resize);
          window.removeEventListener('pointermove', handlePointerMove);
          document.removeEventListener('visibilitychange', handleVisibility);
          canvas.removeEventListener('webglcontextlost', handleContextLost);
        };

        resize();
        syncPlayback();
        setRendererReady(true);
      } catch {
        controller?.dispose();
        controller = undefined;
        setRendererReady(false);
      }
    };

    if (idleWindow.requestIdleCallback) {
      idleHandle = idleWindow.requestIdleCallback(() => void startScene(), { timeout: 500 });
    } else {
      animationFrame = window.requestAnimationFrame(() => void startScene());
    }

    return () => {
      cancelled = true;
      if (idleHandle !== undefined) idleWindow.cancelIdleCallback?.(idleHandle);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      removeSceneListeners();
      controller?.dispose();
    };
  }, [animate, quality]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[var(--background)]"
      data-hero-renderer={rendererReady ? 'webgl' : 'poster'}
      aria-hidden
    >
      <div className={`hero-poster ${rendererReady ? 'hero-poster-enhanced' : ''}`} />
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${
          rendererReady ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div className="absolute inset-y-0 left-0 w-[92%] bg-[linear-gradient(90deg,rgba(4,4,5,0.86),rgba(4,4,5,0.62)_62%,transparent)] sm:w-[82%] sm:bg-[linear-gradient(90deg,rgba(4,4,5,0.72),rgba(4,4,5,0.38)_48%,transparent)]" />
    </div>
  );
}
