import { describe, expect, it, vi } from 'vitest';
import { createTerminalEngine, type TerminalRuntime } from './terminalEngine';

const machines = [
  {
    id: 'machine-1',
    name: 'build-agent',
    heartbeat: 1,
    last_timestamp: new Date().toISOString(),
  },
  {
    id: 'machine-2',
    name: 'nas',
    heartbeat: 0,
    last_timestamp: '2026-01-01T00:00:00.000Z',
  },
];

function createRuntime(overrides: Partial<TerminalRuntime> = {}): TerminalRuntime {
  return {
    now: () => new Date('2026-07-10T10:00:00.000Z'),
    uptimeSeconds: () => 125,
    userAgent: () => 'Mozilla/5.0 (X11; Linux x86_64)',
    logicalCores: () => 8,
    memory: () => ({ usedBytes: 256 * 1024 * 1024, limitBytes: 4096 * 1024 * 1024 }),
    random: () => 0.5,
    fetchHeartbeats: vi.fn().mockResolvedValue(machines),
    ...overrides,
  };
}

describe('terminal engine', () => {
  it('formats heartbeat machines as machine: status rows by default', async () => {
    const engine = createTerminalEngine(createRuntime());

    const result = await engine.execute('heartbeat');

    expect(result?.output).toContain('build-agent: online');
    expect(result?.output).toContain('nas: offline');
    expect(engine.pendingMessage('heartbeat')).toBe('Fetching heartbeat machines...');
  });

  it('returns the raw heartbeat payload only with -json', async () => {
    const engine = createTerminalEngine(createRuntime());

    const result = await engine.execute('heartbeat -json');

    expect(JSON.parse(result?.output ?? 'null')).toEqual(machines);
  });

  it('turns UI operations into typed effects', async () => {
    const engine = createTerminalEngine(createRuntime());

    await expect(engine.execute('clear')).resolves.toEqual({
      effect: { type: 'clear' },
      recordHistory: false,
    });
    await expect(engine.execute('tmux')).resolves.toMatchObject({
      output: 'Starting session...',
      effect: { type: 'open-monitor' },
    });
    await expect(engine.execute('repo')).resolves.toMatchObject({
      effect: { type: 'open-url' },
    });
  });

  it('completes commands and virtual filenames without DOM state', () => {
    const engine = createTerminalEngine(createRuntime());

    expect(engine.complete('heart')).toEqual({ input: 'heartbeat ', nextCycle: 0 });
    expect(engine.complete('cat con')).toEqual({ input: 'cat contact.md', nextCycle: 0 });
    expect(engine.complete('echo hello')).toEqual({ input: 'echo hello', nextCycle: 0 });
  });

  it('contains heartbeat failures inside terminal output', async () => {
    const engine = createTerminalEngine(
      createRuntime({ fetchHeartbeats: vi.fn().mockRejectedValue(new Error('network unavailable')) })
    );

    await expect(engine.execute('heartbeat')).resolves.toMatchObject({
      output: 'heartbeat: network unavailable',
    });
  });
});
