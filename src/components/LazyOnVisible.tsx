import React, { useCallback, useEffect, useRef, useState } from 'react';

function isNearViewport(element: Element, margin: number) {
  const rect = element.getBoundingClientRect();
  return rect.top <= window.innerHeight + margin && rect.bottom >= -margin;
}

export function LazyOnVisible({
  children,
  fallback,
  id,
  isServer,
  prefetch,
  prefetchRootMargin = '900px 0px',
  renderRootMargin = '600px 0px',
  fallbackViewportMargin = 720,
  targetId,
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
  id?: string;
  isServer: boolean;
  prefetch?: () => Promise<unknown>;
  prefetchRootMargin?: string;
  renderRootMargin?: string;
  fallbackViewportMargin?: number;
  targetId?: string;
}) {
  const [shouldRender, setShouldRender] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const didPrefetch = useRef(false);

  const reveal = useCallback(() => {
    setShouldRender(true);
    if (prefetch && !didPrefetch.current) {
      didPrefetch.current = true;
      void prefetch();
    }
  }, [prefetch]);

  useEffect(() => {
    if (!targetId || shouldRender || typeof window === 'undefined') return;

    const renderForHashTarget = () => {
      if (window.location.hash === `#${targetId}`) reveal();
    };

    renderForHashTarget();
    window.addEventListener('hashchange', renderForHashTarget);
    return () => window.removeEventListener('hashchange', renderForHashTarget);
  }, [reveal, shouldRender, targetId]);

  useEffect(() => {
    if (!targetId || !shouldRender || typeof window === 'undefined') return;
    if (window.location.hash !== `#${targetId}`) return;

    const timeout = window.setTimeout(() => {
      document.getElementById(targetId)?.scrollIntoView({ block: 'start' });
    }, 80);

    return () => window.clearTimeout(timeout);
  }, [shouldRender, targetId]);

  useEffect(() => {
    const node = ref.current;
    if (
      shouldRender ||
      !prefetch ||
      didPrefetch.current ||
      !node ||
      !('IntersectionObserver' in window)
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          didPrefetch.current = true;
          void prefetch();
          observer.disconnect();
        }
      },
      { rootMargin: prefetchRootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [prefetch, prefetchRootMargin, shouldRender]);

  useEffect(() => {
    if (shouldRender || typeof window === 'undefined') return;

    const node = ref.current;
    if (!node) return;

    const revealIfNearby = () => {
      if (isNearViewport(node, fallbackViewportMargin)) reveal();
    };

    let animationFrame = 0;
    const scheduleViewportCheck = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0;
        revealIfNearby();
      });
    };

    let observer: IntersectionObserver | undefined;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) reveal();
        },
        { rootMargin: renderRootMargin }
      );
      observer.observe(node);
    }

    revealIfNearby();
    window.addEventListener('scroll', scheduleViewportCheck, { passive: true });
    window.addEventListener('resize', scheduleViewportCheck);

    return () => {
      observer?.disconnect();
      window.removeEventListener('scroll', scheduleViewportCheck);
      window.removeEventListener('resize', scheduleViewportCheck);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [fallbackViewportMargin, reveal, renderRootMargin, shouldRender]);

  return (
    <div ref={ref} id={id} data-lazy-boundary>
      {isServer || !shouldRender ? fallback : children}
    </div>
  );
}
