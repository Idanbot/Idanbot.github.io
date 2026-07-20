import React, { Suspense } from 'react';
import { LazyOnVisible } from '@/components/LazyOnVisible';
import { SectionSkeleton } from '@/components/SectionSkeleton';
import { loadStatusPage } from '@/lib/lazyOverlays';

const StatusPage = React.lazy(loadStatusPage);

export function MonitorIsland() {
  const isServer = typeof window === 'undefined';

  return (
    <section
      id="monitor"
      className="cv-monitor min-h-[760px] scroll-mt-24 snap-start md:min-h-[840px]"
    >
      <LazyOnVisible
        prefetch={loadStatusPage}
        prefetchRootMargin="200px 0px"
        renderRootMargin="100px 0px"
        fallbackViewportMargin={200}
        targetId="monitor"
        fallback={<SectionSkeleton variant="monitor" />}
        isServer={isServer}
      >
        <Suspense fallback={<SectionSkeleton variant="monitor" />}>
          <StatusPage />
        </Suspense>
      </LazyOnVisible>
    </section>
  );
}
