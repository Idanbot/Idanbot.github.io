import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SectionSkeleton } from './SectionSkeleton';

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
});

describe('SectionSkeleton', () => {
  it('uses large reserved space for the monitor lazy section', () => {
    act(() => {
      root.render(<SectionSkeleton variant="monitor" />);
    });

    const skeleton = container.firstElementChild;
    expect(skeleton?.className).toContain('min-h-[680px]');
    expect(skeleton?.className).toContain('md:min-h-[760px]');
    expect(skeleton?.className).toContain('animate-pulse');
  });

  it('uses the skills sizing for the skills lazy section', () => {
    act(() => {
      root.render(<SectionSkeleton variant="skills" />);
    });

    expect(container.firstElementChild?.className).toContain('cv-skills');
    expect(container.firstElementChild?.className).toContain('min-h-[300px]');
  });
});
