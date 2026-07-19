import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DesktopNav } from './DesktopNav';

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

describe('DesktopNav', () => {
  it('marks the active section and exposes section anchors', () => {
    act(() => {
      root.render(<DesktopNav activeSection="monitor" />);
    });

    const current = container.querySelector('a[aria-current="page"]');
    expect(current?.textContent).toBe('Engineering Lab');
    expect(current?.getAttribute('href')).toBe('#monitor');

    const hrefs = [...container.querySelectorAll('a')].map((link) => link.getAttribute('href'));
    expect(hrefs).toEqual(['#hero', '#skills', '#history', '#monitor']);
  });
});
