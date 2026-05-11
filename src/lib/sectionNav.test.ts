import { describe, it, expect } from 'vitest';
import { pickActiveSectionId, SECTION_IDS } from './sectionNav';

function rect(top: number, height: number): DOMRect {
  return {
    top,
    bottom: top + height,
    left: 0,
    right: 100,
    width: 100,
    height,
    x: 0,
    y: top,
    toJSON() {
      return this;
    },
  };
}

describe('pickActiveSectionId', () => {
  it('selects hero when focal line sits in hero', () => {
    const vh = 800;
    const rects = new Map([
      ['hero', rect(0, vh)],
      ['skills', rect(vh, 600)],
      ['history', rect(vh + 600, 800)],
      ['monitor', rect(vh + 1400, 400)],
    ]);
    expect(pickActiveSectionId(SECTION_IDS, rects, vh, 0.32)).toBe('hero');
  });

  it('selects skills when viewport is scrolled to stack', () => {
    const vh = 812; // ~phone height
    const rects = new Map([
      ['hero', rect(-700, 900)],
      ['skills', rect(80, 520)],
      ['history', rect(700, 900)],
      ['monitor', rect(2000, 400)],
    ]);
    const picked = pickActiveSectionId(SECTION_IDS, rects, vh, 0.28);
    expect(picked).toBe('skills');
  });

  it('returns a known section when only edge overlaps exist', () => {
    const vh = 800;
    const rects = new Map([
      ['hero', rect(-900, 700)],
      ['skills', rect(-150, 400)],
      ['history', rect(300, 900)],
      ['monitor', rect(2000, 300)],
    ]);
    const picked = pickActiveSectionId(SECTION_IDS, rects, vh, 0.32);
    expect(SECTION_IDS.includes(picked)).toBe(true);
  });
});
