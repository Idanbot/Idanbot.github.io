import { fetchHeartbeatMachines } from './heartbeats';
import {
  createTerminalEngine,
  type TerminalEffect,
  type TerminalRuntime,
} from './terminalEngine';

interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    jsHeapLimit: number;
  };
}

function createBrowserRuntime(): TerminalRuntime {
  return {
    now: () => new Date(),
    uptimeSeconds: () => (typeof performance === 'undefined' ? 0 : performance.now() / 1000),
    userAgent: () => (typeof navigator === 'undefined' ? '' : navigator.userAgent),
    logicalCores: () =>
      typeof navigator === 'undefined' ? 4 : navigator.hardwareConcurrency || 4,
    memory: () => {
      if (typeof performance === 'undefined') return undefined;
      const memory = (performance as PerformanceWithMemory).memory;
      return memory
        ? { usedBytes: memory.usedJSHeapSize, limitBytes: memory.jsHeapLimit }
        : undefined;
    },
    random: Math.random,
    fetchHeartbeats: () => fetchHeartbeatMachines({ retries: 0 }),
  };
}

export function createBrowserTerminalEngine() {
  return createTerminalEngine(createBrowserRuntime());
}

export function applyBrowserTerminalEffect(
  effect: TerminalEffect | undefined,
  handlers: { clear: () => void; close: () => void; openMonitor: () => void }
) {
  if (!effect) return;
  if (effect.type === 'clear') handlers.clear();
  if (effect.type === 'close') handlers.close();
  if (effect.type === 'open-monitor') handlers.openMonitor();
  if (effect.type === 'open-url' && typeof window !== 'undefined') {
    window.open(effect.href, '_blank', 'noopener,noreferrer');
  }
}
