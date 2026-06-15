import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { profile } from '@/data/profile';
import { SocialDock } from './SocialDock';

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: () => ({
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
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

describe('SocialDock', () => {
  it('renders profile social links with accessible labels', () => {
    act(() => {
      root.render(<SocialDock />);
    });

    for (const social of profile.socials) {
      const link = container.querySelector(`a[aria-label="${social.label}"]`);
      expect(link?.getAttribute('href')).toBe(social.href);
    }
  });

  it('opens non-mail links in a new tab and keeps email local', () => {
    act(() => {
      root.render(<SocialDock />);
    });

    const github = container.querySelector('a[aria-label="GitHub"]');
    const email = container.querySelector('a[aria-label="Email"]');

    expect(github?.getAttribute('target')).toBe('_blank');
    expect(github?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(email?.hasAttribute('target')).toBe(false);
  });
});
