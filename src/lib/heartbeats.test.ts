import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fetchHeartbeatMachines,
  formatHeartbeatSummary,
  getHeartbeatStatus,
  HEARTBEAT_CACHE_TTL_MS,
  isHeartbeatCacheFresh,
  readHeartbeatCache,
  sortHeartbeatMachines,
  writeHeartbeatCache,
  type HeartbeatMachine,
} from './heartbeats';

const machines: HeartbeatMachine[] = [
  { id: 'offline', name: 'Offline machine', heartbeat: 0, last_timestamp: '2026-07-09T10:00:00.000Z' },
  { id: 'online', name: 'Online machine', heartbeat: 1, last_timestamp: '2026-07-09T10:09:59.000Z' },
  { id: 'stale', name: 'Stale machine', heartbeat: 1, last_timestamp: '2026-07-09T09:59:00.000Z' },
];

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-07-09T10:10:00.000Z'));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  localStorage.clear();
});

describe('heartbeats', () => {
  it('keeps the raw endpoint response order for terminal JSON output', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => machines } as Response)
    );

    await expect(fetchHeartbeatMachines({ retries: 0 })).resolves.toEqual(machines);
  });

  it('sorts display data by health without mutating the raw response', () => {
    expect(getHeartbeatStatus(machines[0])).toBe('offline');
    expect(getHeartbeatStatus(machines[1])).toBe('online');
    expect(getHeartbeatStatus(machines[2])).toBe('stale');
    expect(sortHeartbeatMachines(machines).map((machine) => machine.id)).toEqual([
      'online',
      'stale',
      'offline',
    ]);
    expect(machines.map((machine) => machine.id)).toEqual(['offline', 'online', 'stale']);
    expect(formatHeartbeatSummary(machines)).toBe(
      'Offline machine: offline\nOnline machine: online\nStale machine: stale'
    );
  });

  it('uses a time-bound local cache', () => {
    writeHeartbeatCache(machines);
    const cache = readHeartbeatCache();

    expect(cache?.machines).toEqual(machines);
    expect(cache && isHeartbeatCacheFresh(cache)).toBe(true);
    expect(cache && isHeartbeatCacheFresh(cache, cache.savedAt + HEARTBEAT_CACHE_TTL_MS)).toBe(false);
  });
});
