import { useEffect, useState } from 'react';
import { HeroSection } from '@/components/HeroSection';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { isConstrainedDevice } from '@/lib/deviceHints';
import { loadTerminalModal, prefetchOnFirstIntent } from '@/lib/lazyOverlays';
import { OPEN_TERMINAL_EVENT } from '@/lib/site-events';

const preloadTerminal = (event: React.PointerEvent<HTMLElement> | React.FocusEvent<HTMLElement>) =>
  prefetchOnFirstIntent(event.nativeEvent, loadTerminalModal);

const requestTerminal = () => {
  window.dispatchEvent(new CustomEvent(OPEN_TERMINAL_EVENT));
};

export function HeroIsland() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [constrainedDevice, setConstrainedDevice] = useState(false);

  useEffect(() => {
    setConstrainedDevice(isConstrainedDevice());
  }, []);

  return (
    <HeroSection
      prefersReducedMotion={prefersReducedMotion}
      topologyQuality={constrainedDevice ? 'reduced' : 'full'}
      onTerminalPreload={preloadTerminal}
      onTerminalRequest={requestTerminal}
    />
  );
}
