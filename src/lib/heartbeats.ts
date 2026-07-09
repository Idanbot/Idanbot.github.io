export interface HeartbeatMachine {
  id: string;
  name: string;
  heartbeat: number;
  last_timestamp: string;
  last_healthy_timestamp?: string | null;
  unavailable_since_timestamp?: string | null;
  alert_sent_at?: string | null;
}

export type HeartbeatStatus = 'online' | 'stale' | 'offline';

export const HEARTBEAT_ENDPOINT = 'https://device-heartbeat-monitor.botbolidan.workers.dev/';
export const HEARTBEAT_CACHE_KEY = 'device-heartbeats-v2';
export const HEARTBEAT_CACHE_TTL_MS = 5 * 60 * 1000;

export interface CachedHeartbeats {
  savedAt: number;
  machines: HeartbeatMachine[];
}

function isHeartbeatMachine(value: unknown): value is HeartbeatMachine {
  if (!value || typeof value !== 'object') return false;
  const machine = value as Record<string, unknown>;
  return (
    typeof machine.id === 'string' &&
    typeof machine.name === 'string' &&
    typeof machine.heartbeat === 'number' &&
    typeof machine.last_timestamp === 'string'
  );
}

function delay(milliseconds: number) {
  return new Promise((resolve) => globalThis.setTimeout(resolve, milliseconds));
}

export async function fetchHeartbeatMachines({
  retries = 1,
  timeoutMs = 6000,
}: {
  retries?: number;
  timeoutMs?: number;
} = {}): Promise<HeartbeatMachine[]> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = globalThis.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(HEARTBEAT_ENDPOINT, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Heartbeat endpoint returned HTTP ${response.status}`);
      }

      const data: unknown = await response.json();
      if (!Array.isArray(data) || !data.every(isHeartbeatMachine)) {
        throw new Error('Heartbeat endpoint returned an unexpected payload');
      }
      return data;
    } catch (error) {
      lastError = error;
      if (attempt < retries) await delay(250 * (attempt + 1));
    } finally {
      globalThis.clearTimeout(timeoutId);
    }
  }

  if (lastError instanceof Error) throw lastError;
  throw new Error('Heartbeat endpoint request failed');
}

export function getHeartbeatStatus(machine: HeartbeatMachine): HeartbeatStatus {
  if (machine.heartbeat !== 1) return 'offline';
  const timestamp = new Date(machine.last_timestamp).getTime();
  if (Number.isNaN(timestamp)) return 'offline';
  return Date.now() - timestamp > 10 * 60 * 1000 ? 'stale' : 'online';
}

export function sortHeartbeatMachines(machines: HeartbeatMachine[]) {
  const rank: Record<HeartbeatStatus, number> = { online: 0, stale: 1, offline: 2 };
  return [...machines].sort((first, second) => {
    const statusDifference = rank[getHeartbeatStatus(first)] - rank[getHeartbeatStatus(second)];
    return statusDifference || first.name.localeCompare(second.name);
  });
}

export function formatHeartbeatSummary(machines: HeartbeatMachine[]) {
  return machines.map((machine) => `${machine.name}: ${getHeartbeatStatus(machine)}`).join('\n');
}

export function readHeartbeatCache(storage: Storage = localStorage): CachedHeartbeats | null {
  try {
    const value: unknown = JSON.parse(storage.getItem(HEARTBEAT_CACHE_KEY) ?? 'null');
    if (!value || typeof value !== 'object') return null;
    const cache = value as Partial<CachedHeartbeats>;
    if (!Array.isArray(cache.machines) || typeof cache.savedAt !== 'number') return null;
    if (!cache.machines.every(isHeartbeatMachine)) return null;
    return { savedAt: cache.savedAt, machines: cache.machines };
  } catch {
    return null;
  }
}

export function writeHeartbeatCache(machines: HeartbeatMachine[], storage: Storage = localStorage) {
  storage.setItem(
    HEARTBEAT_CACHE_KEY,
    JSON.stringify({ savedAt: Date.now(), machines } satisfies CachedHeartbeats)
  );
}

export function isHeartbeatCacheFresh(cache: CachedHeartbeats, now = Date.now()) {
  return now - cache.savedAt < HEARTBEAT_CACHE_TTL_MS;
}
