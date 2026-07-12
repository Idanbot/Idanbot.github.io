import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink, FlaskConical } from 'lucide-react';
import { CinematicVariant } from './variants/CinematicVariant';
import { ConsoleVariant } from './variants/ConsoleVariant';
import { EditorialVariant } from './variants/EditorialVariant';
import { TerrainVariant } from './variants/TerrainVariant';

const variants = [
  {
    key: 'terrain',
    name: 'Topology',
    thesis: 'Immersive cloud terrain with a strong editorial spine.',
    theme: '#040405',
    Component: TerrainVariant,
  },
  {
    key: 'cinematic',
    name: 'Cinematic glass',
    thesis: 'MotionSites-inspired glass over a custom signal field.',
    theme: '#050608',
    Component: CinematicVariant,
  },
  {
    key: 'editorial',
    name: 'Architecture dossier',
    thesis: 'Bright, structured, and typography-led with no ambient renderer.',
    theme: '#f1f4f6',
    Component: EditorialVariant,
  },
  {
    key: 'console',
    name: 'Control plane',
    thesis: 'A dense operational interface instead of a conventional hero.',
    theme: '#050708',
    Component: ConsoleVariant,
  },
] as const;

type VariantKey = (typeof variants)[number]['key'];

function variantFromUrl(): VariantKey {
  const requested = new URLSearchParams(window.location.search).get('variant');
  return variants.some((variant) => variant.key === requested)
    ? (requested as VariantKey)
    : variants[0].key;
}

function isEditingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.matches('input, textarea, select, [contenteditable="true"]') ||
      Boolean(target.closest('[contenteditable="true"]')))
  );
}

export function PortfolioLab() {
  const [variantKey, setVariantKey] = useState<VariantKey>(variantFromUrl);
  const activeIndex = variants.findIndex((variant) => variant.key === variantKey);
  const activeVariant = variants[activeIndex] ?? variants[0];
  const ActiveComponent = activeVariant.Component;

  const selectVariant = useCallback((nextKey: VariantKey, replace = false) => {
    const url = new URL(window.location.href);
    url.searchParams.set('variant', nextKey);
    window.history[replace ? 'replaceState' : 'pushState']({}, '', url);
    setVariantKey(nextKey);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const cycle = useCallback(
    (direction: -1 | 1) => {
      const nextIndex = (activeIndex + direction + variants.length) % variants.length;
      selectVariant(variants[nextIndex].key);
    },
    [activeIndex, selectVariant]
  );

  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('variant')) selectVariant(variants[0].key, true);

    const handlePopState = () => setVariantKey(variantFromUrl());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectVariant]);

  useEffect(() => {
    document.title = `${activeVariant.name} - Idan Botbol Portfolio Lab`;
    document.documentElement.style.colorScheme = variantKey === 'editorial' ? 'light' : 'dark';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', activeVariant.theme);
  }, [activeVariant.name, activeVariant.theme, variantKey]);

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if (isEditingTarget(event.target)) return;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        cycle(-1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        cycle(1);
      }
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [cycle]);

  const switcherLabel = useMemo(
    () => `${activeIndex + 1} of ${variants.length}: ${activeVariant.name}`,
    [activeIndex, activeVariant.name]
  );

  return (
    <div className={`portfolio-lab portfolio-lab--${variantKey}`} data-lab-variant={variantKey}>
      <ActiveComponent />

      {import.meta.env.DEV ? (
        <aside className="lab-switcher" aria-label="Portfolio design variants">
          <a className="lab-switcher-baseline" href="/" title="Open the current portfolio">
            <ExternalLink size={14} aria-hidden />
            <span>Current site</span>
          </a>
          <button type="button" onClick={() => cycle(-1)} aria-label="Previous design">
            <ArrowLeft size={17} aria-hidden />
          </button>
          <div className="lab-switcher-state" aria-live="polite">
            <span><FlaskConical size={12} aria-hidden /> DESIGN LAB</span>
            <strong>{switcherLabel}</strong>
            <small>{activeVariant.thesis}</small>
          </div>
          <div className="lab-switcher-dots" aria-label="Choose a design">
            {variants.map((variant, index) => (
              <button
                key={variant.key}
                type="button"
                className={variant.key === variantKey ? 'is-active' : ''}
                onClick={() => selectVariant(variant.key)}
                aria-label={`Open ${variant.name}`}
                aria-current={variant.key === variantKey ? 'page' : undefined}
                title={variant.name}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => cycle(1)} aria-label="Next design">
            <ArrowRight size={17} aria-hidden />
          </button>
        </aside>
      ) : null}
    </div>
  );
}
