import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LazyOnVisible } from './LazyOnVisible';

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  window.history.replaceState(null, '', '/');
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
  window.history.replaceState(null, '', '/');
});

describe('LazyOnVisible', () => {
  it('renders immediately when the current hash targets the lazy section', async () => {
    const prefetch = vi.fn().mockResolvedValue(undefined);
    window.history.replaceState(null, '', '/#monitor');

    await act(async () => {
      root.render(
        <LazyOnVisible
          fallback={<div>loading monitor</div>}
          isServer={false}
          prefetch={prefetch}
          targetId="monitor"
        >
          <div>monitor loaded</div>
        </LazyOnVisible>
      );
    });

    expect(container.textContent).toContain('monitor loaded');
    expect(prefetch).toHaveBeenCalledTimes(1);
  });

  it('keeps the fallback on the server path', () => {
    act(() => {
      root.render(
        <LazyOnVisible fallback={<div>loading</div>} isServer={true}>
          <div>loaded</div>
        </LazyOnVisible>
      );
    });

    expect(container.textContent).toBe('loading');
  });
});
