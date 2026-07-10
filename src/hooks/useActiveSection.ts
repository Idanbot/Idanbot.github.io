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

function readHashSection(): SectionId | null {
  const hash = window.location.hash.slice(1);
  return SECTION_IDS.find((sectionId) => sectionId === hash) ?? null;
}

function alignSection(sectionId: SectionId) {
  const target = document.getElementById(sectionId);
  if (!target) return false;

  // Lazy sections above the target can resize after the native anchor scroll has started.
  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  target.scrollIntoView({ block: 'start', behavior: 'auto' });
  root.style.scrollBehavior = previousScrollBehavior;
  return true;
}

export function useActiveSection(): SectionId {
  const [id, setId] = useState<SectionId>('hero');

  const update = useCallback(() => {
    setId(readSection());
  }, []);

  useEffect(() => {
    let raf = 0;
    let lockedSection: SectionId | null = null;
    let unlockTimer = 0;

    const finishHashNavigation = () => {
      lockedSection = null;
      update();
    };
    const scheduleUnlock = () => {
      window.clearTimeout(unlockTimer);
      unlockTimer = window.setTimeout(finishHashNavigation, 5000);
    };
    const cancelHashNavigation = () => {
      if (!lockedSection) return;
      finishHashNavigation();
    };
    const alignLockedSection = () => {
      if (!lockedSection) return;
      setId(lockedSection);
      if (alignSection(lockedSection)) scheduleUnlock();
    };
    const lockToHashTarget = () => {
      const hashSection = readHashSection();
      if (!hashSection) return false;
      lockedSection = hashSection;
      setId(hashSection);
      window.clearTimeout(unlockTimer);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(alignLockedSection);
      return true;
    };
    const updateFromViewport = () => {
      if (lockedSection) {
        setId(lockedSection);
        return;
      }
      update();
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateFromViewport);
    };
    const onLayoutChange = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (lockedSection) alignLockedSection();
        else update();
      });
    };
    if (!lockToHashTarget()) update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onLayoutChange, { passive: true });
    window.addEventListener('hashchange', lockToHashTarget);
    window.addEventListener('wheel', cancelHashNavigation, { passive: true });
    window.addEventListener('touchstart', cancelHashNavigation, { passive: true });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onLayoutChange) : null;
    if (ro) ro.observe(document.body);
    SECTION_IDS.forEach((sid) => {
      const el = document.getElementById(sid);
      if (el && ro) ro.observe(el);
    });
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(unlockTimer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onLayoutChange);
      window.removeEventListener('hashchange', lockToHashTarget);
      window.removeEventListener('wheel', cancelHashNavigation);
      window.removeEventListener('touchstart', cancelHashNavigation);
      ro?.disconnect();
    };
  }, [update]);

  return id;
}
