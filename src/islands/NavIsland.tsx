import React, { Suspense, useEffect, useState } from 'react';
import { DesktopNav } from '@/components/DesktopNav';
import { useActiveSection } from '@/hooks/useActiveSection';
import { loadCommandPalette, loadTerminalModal } from '@/lib/lazyOverlays';
import { OPEN_TERMINAL_EVENT } from '@/lib/site-events';

const TerminalModal = React.lazy(loadTerminalModal);
const CommandPalette = React.lazy(loadCommandPalette);

export function NavIsland() {
  const activeSection = useActiveSection();
  const [terminalRequested, setTerminalRequested] = useState(false);
  const [commandPaletteRequested, setCommandPaletteRequested] = useState(false);

  useEffect(() => {
    const openTerminal = () => setTerminalRequested(true);
    const handleGlobalShortcuts = (event: KeyboardEvent) => {
      if ((event.key === '`' || event.key === '~') && !terminalRequested) {
        event.preventDefault();
        setTerminalRequested(true);
        return;
      }
      if (event.key === 'k' && (event.metaKey || event.ctrlKey) && !commandPaletteRequested) {
        event.preventDefault();
        setCommandPaletteRequested(true);
      }
    };

    window.addEventListener(OPEN_TERMINAL_EVENT, openTerminal);
    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => {
      window.removeEventListener(OPEN_TERMINAL_EVENT, openTerminal);
      window.removeEventListener('keydown', handleGlobalShortcuts);
    };
  }, [commandPaletteRequested, terminalRequested]);

  return (
    <>
      <DesktopNav activeSection={activeSection} />
      {terminalRequested ? (
        <Suspense fallback={null}>
          <TerminalModal startOpen />
        </Suspense>
      ) : null}
      {commandPaletteRequested ? (
        <Suspense fallback={null}>
          <CommandPalette startOpen />
        </Suspense>
      ) : null}
    </>
  );
}
