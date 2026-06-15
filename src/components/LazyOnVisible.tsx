import React, { useEffect, useRef, useState } from 'react';

export function LazyOnVisible({
  children,
  fallback,
  id,
  isServer,
  prefetch,
  prefetchRootMargin = '900px 0px',
  renderRootMargin = '600px 0px',
  targetId,
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
  id?: string;
  isServer: boolean;
  prefetch?: () => Promise<unknown>;
  prefetchRootMargin?: string;
  renderRootMargin?: string;
  targetId?: string;
}) {
  const [shouldRender, setShouldRender] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const didPrefetch = useRef(false);

  useEffect(() => {
    if (!targetId || shouldRender || typeof window === 'undefined') return;

    const renderForHashTarget = () => {
      if (window.location.hash === `#${targetId}`) {
        setShouldRender(true);
        if (prefetch && !didPrefetch.current) {
          didPrefetch.current = true;
          void prefetch();
        }
      }
    };

    renderForHashTarget();
    window.addEventListener('hashchange', renderForHashTarget);
    return () => window.removeEventListener('hashchange', renderForHashTarget);
  }, [prefetch, shouldRender, targetId]);

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
    if (!prefetch || didPrefetch.current || !node || !('IntersectionObserver' in window)) return;

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
  }, [prefetch, prefetchRootMargin]);

  useEffect(() => {
    if (shouldRender) return;
    const node = ref.current;
    if (!node || !('IntersectionObserver' in window)) {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          if (prefetch && !didPrefetch.current) {
            didPrefetch.current = true;
            void prefetch();
          }
          observer.disconnect();
        }
      },
      { rootMargin: renderRootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [prefetch, renderRootMargin, shouldRender]);

  if (isServer || !shouldRender) {
    return (
      <div ref={ref} id={id}>
        {fallback}
      </div>
    );
  }

  return <>{children}</>;
}
