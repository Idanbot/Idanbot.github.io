import { useCallback, useEffect, useState } from 'react';
import {
  SECTION_IDS,
  pickActiveSectionId,
  getRects,
  type SectionId,
} from '@/lib/sectionNav';

function readSection(): SectionId {
  const rects = getRects([...SECTION_IDS], (id) => document.getElementById(id));
  const vh = window.innerHeight || 800;
  const isNarrow = window.matchMedia('(max-width: 1023px)').matches;
  const focal = isNarrow ? 0.28 : 0.32;
  return pickActiveSectionId(SECTION_IDS, rects, vh, focal) as SectionId;
}

export function useActiveSection(): SectionId {
  const [id, setId] = useState<SectionId>('hero');

  const update = useCallback(() => {
    setId(readSection());
  }, []);

  useEffect(() => {
    update();
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onScroll) : null;
    SECTION_IDS.forEach((sid) => {
      const el = document.getElementById(sid);
      if (el && ro) ro.observe(el);
    });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      ro?.disconnect();
    };
  }, [update]);

  return id;
}
