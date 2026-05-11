/** Pick which section id is “current” based on which block best contains the viewport focal line. */

export const SECTION_IDS = ['hero', 'skills', 'history', 'monitor'] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export function getRects(
  ids: readonly string[],
  getElement: (id: string) => HTMLElement | null
): Map<string, DOMRect> {
  const map = new Map<string, DOMRect>();
  for (const id of ids) {
    const el = getElement(id);
    if (el) map.set(id, el.getBoundingClientRect());
  }
  return map;
}

/**
 * @param focalYRatio — 0..1, vertical position in viewport treated as the “reading line” (e.g. 0.32 for mobile toolbars).
 */
export function pickActiveSectionId(
  ids: readonly SectionId[],
  rects: ReadonlyMap<string, DOMRect>,
  viewportHeight: number,
  focalYRatio = 0.32
): SectionId {
  const y = viewportHeight * focalYRatio;
  let best: SectionId = ids[0] ?? 'hero';
  let bestScore = -Infinity;

  for (const id of ids) {
    const r = rects.get(id);
    if (!r) continue;
    if (r.bottom <= 0 || r.top >= viewportHeight) continue;

    const visibleTop = Math.max(0, r.top);
    const visibleBottom = Math.min(viewportHeight, r.bottom);
    const visibleH = Math.max(0, visibleBottom - visibleTop);
    const overlap = y >= visibleTop && y <= visibleBottom ? 1 : 0;
    const center = r.top + r.height / 2;
    const dist = Math.abs(center - y);
    const score = overlap * 1000 + visibleH - dist * 0.02;

    if (score > bestScore) {
      bestScore = score;
      best = id;
    }
  }

  if (bestScore === -Infinity) {
    let fallback: SectionId = ids[0] ?? 'hero';
    let fd = Infinity;
    for (const id of ids) {
      const r = rects.get(id);
      if (!r) continue;
      if (r.bottom <= 0 || r.top >= viewportHeight) continue;
      const center = r.top + r.height / 2;
      const d = Math.abs(center - y);
      if (d < fd) {
        fd = d;
        fallback = id;
      }
    }
    return fallback;
  }

  return best;
}
