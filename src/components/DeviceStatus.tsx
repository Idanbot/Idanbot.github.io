import { useCallback, useEffect, useMemo, useState } from 'react';
import { m, type Variants } from 'framer-motion';
import { AlertCircle, Clock, Cpu, Radio, RefreshCw, Server } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';
import { MotionBoundary } from './MotionBoundary';
import {
  fetchHeartbeatMachines,
  getHeartbeatStatus,
  isHeartbeatCacheFresh,
  readHeartbeatCache,
  sortHeartbeatMachines,
  writeHeartbeatCache,
  type HeartbeatMachine,
  type HeartbeatStatus,
} from '@/lib/heartbeats';

function getRelativeTime(timestamp: string | number): string {
  const past = new Date(timestamp).getTime();
  if (Number.isNaN(past)) return 'unknown';
  const difference = Date.now() - past;
  if (difference < 10_000) return 'just now';
  if (difference < 60_000) return `${Math.floor(difference / 1000)}s ago`;
  if (difference < 3_600_000) return `${Math.floor(difference / 60_000)}m ago`;
  if (difference < 86_400_000) return `${Math.floor(difference / 3_600_000)}h ago`;
  return `${Math.floor(difference / 86_400_000)}d ago`;
}

function formatTimestamp(timestamp?: string | null): string {
  if (!timestamp) return 'none';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'unknown';
  return `${getRelativeTime(timestamp)} · ${date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

function getCachedHeartbeats() {
  return typeof window === 'undefined' ? null : readHeartbeatCache();
}

const DeviceStatusContent = () => {
  const [devices, setDevices] = useState<HeartbeatMachine[]>(() => {
    const cache = getCachedHeartbeats();
    return cache ? sortHeartbeatMachines(cache.machines) : [];
  });
  const [cacheTimestamp, setCacheTimestamp] = useState<number | null>(
    () => getCachedHeartbeats()?.savedAt ?? null
  );
  const [source, setSource] = useState<'live' | 'cache'>(() =>
    getCachedHeartbeats() ? 'cache' : 'live'
  );
  const [loading, setLoading] = useState(() => !getCachedHeartbeats());
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDevices = useCallback(async (background = false) => {
    if (background) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const machines = sortHeartbeatMachines(await fetchHeartbeatMachines());
      setDevices(machines);
      setSource('live');
      const savedAt = Date.now();
      setCacheTimestamp(savedAt);
      try {
        writeHeartbeatCache(machines);
      } catch {
        // A private browsing quota failure should not prevent status rendering.
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to connect to the heartbeat monitor.'
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const cache = getCachedHeartbeats();
    if (cache) {
      setDevices(sortHeartbeatMachines(cache.machines));
      setCacheTimestamp(cache.savedAt);
      setSource('cache');
      setLoading(false);
      if (isHeartbeatCacheFresh(cache)) return;
      void fetchDevices(true);
      return;
    }
    void fetchDevices();
  }, [fetchDevices]);

  const systemStatus = useMemo<HeartbeatStatus | 'unknown'>(() => {
    if (devices.length === 0) return 'unknown';
    const statuses = devices.map(getHeartbeatStatus);
    if (statuses.every((status) => status === 'online')) return 'online';
    if (statuses.some((status) => status === 'offline')) return 'offline';
    return 'stale';
  }, [devices]);

  const statusColors = {
    online: 'bg-emerald-400',
    stale: 'bg-amber-400',
    offline: 'bg-red-400',
    unknown: 'bg-zinc-400',
  } as const;

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } },
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 border-b border-white/5 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span
                className={cn(
                  'absolute inline-flex h-full w-full animate-ping rounded-full opacity-70',
                  statusColors[systemStatus]
                )}
              />
              <span className={cn('relative inline-flex size-2 rounded-full', statusColors[systemStatus])} />
            </span>
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Infrastructure status
            </h3>
          </div>
          <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">Live Device Heartbeats</h2>
          {!loading && devices.length > 0 ? (
            <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Radio size={12} className="text-cloud" aria-hidden />
              <span>{source === 'live' ? 'Live response' : `Cached ${getRelativeTime(cacheTimestamp ?? Date.now())}`}</span>
              <span aria-hidden>·</span>
              <span>{devices.length} machines</span>
              {isRefreshing ? <span className="text-cloud">refreshing</span> : null}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => void fetchDevices(true)}
          disabled={loading || isRefreshing}
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-white disabled:pointer-events-none disabled:opacity-50"
        >
          <RefreshCw size={12} className={cn('shrink-0', isRefreshing && 'animate-spin')} />
          <span>{isRefreshing ? 'REFRESHING...' : 'REFRESH'}</span>
        </button>
      </div>

      {error && devices.length > 0 ? (
        <p className="flex items-center gap-2 rounded-lg border border-amber-500/15 bg-amber-500/[0.04] px-3 py-2 text-xs text-amber-200/80">
          <AlertCircle size={14} aria-hidden />
          Showing cached heartbeat data. The latest refresh failed: {error}
        </p>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2].map((item) => (
            <Card key={item} className="border-white/5 bg-card/40">
              <CardContent className="flex items-center justify-between p-5">
                <div className="space-y-2.5">
                  <div className="h-4 w-28 rounded bg-white/10" />
                  <div className="h-3 w-20 rounded bg-white/5" />
                </div>
                <div className="h-6 w-16 rounded bg-white/10" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error && devices.length === 0 ? (
        <Card className="border-red-500/20 bg-red-500/[0.03]">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
            <div className="rounded-full bg-red-500/10 p-3 text-red-400">
              <AlertCircle size={24} />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="font-semibold text-white">Connection error</h4>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => void fetchDevices()}
              className="inline-flex min-h-9 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/20"
            >
              Retry connection
            </button>
          </CardContent>
        </Card>
      ) : devices.length === 0 ? (
        <Card className="border-white/5 bg-card/20">
          <CardContent className="flex flex-col items-center justify-center space-y-3 p-8 text-center">
            <div className="rounded-full bg-white/5 p-3 text-muted-foreground">
              <Server size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">No monitored devices found</p>
              <p className="mt-1 text-xs text-muted-foreground">The heartbeat endpoint returned no machines.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <m.div
          variants={{ show: { transition: { staggerChildren: 0.06 } } }}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          {devices.map((device) => {
            const status = getHeartbeatStatus(device);
            const isOnline = status === 'online';
            const isStale = status === 'stale';
            const statusAccent = isOnline
              ? 'bg-emerald-500/80 shadow-[0_0_10px_#10b981]'
              : isStale
                ? 'bg-amber-500/80 shadow-[0_0_10px_#f59e0b]'
                : 'bg-red-500/80 shadow-[0_0_10px_#ef4444]';

            return (
              <m.div key={device.id} variants={cardVariants}>
                <Card className="group relative overflow-hidden border-white/5 bg-card/45 transition-[border-color,box-shadow] duration-300 hover:border-white/10">
                  <div className={`absolute inset-y-0 left-0 w-[3px] ${statusAccent}`} />
                  <CardContent className="flex items-center justify-between gap-4 p-5 pl-6">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5 text-muted-foreground/70">
                        {device.name.toLowerCase().includes('agent') ? <Cpu size={20} /> : <Server size={20} />}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="max-w-[150px] truncate text-sm font-semibold text-white sm:max-w-[200px] sm:text-base">
                            {device.name}
                          </h4>
                          <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] leading-none text-muted-foreground">
                            {device.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock size={11} className="shrink-0" />
                          <span title={new Date(device.last_timestamp).toLocaleString()}>
                            {isOnline ? `Pinged ${getRelativeTime(device.last_timestamp)}` : `Last active ${getRelativeTime(device.last_timestamp)}`}
                          </span>
                        </div>
                        <div className="grid gap-1 pt-1 text-[10px] leading-relaxed text-muted-foreground/80 sm:text-xs">
                          <span>Healthy: {formatTimestamp(device.last_healthy_timestamp ?? device.last_timestamp)}</span>
                          {device.unavailable_since_timestamp ? (
                            <span className="text-amber-300/85">Unavailable since: {formatTimestamp(device.unavailable_since_timestamp)}</span>
                          ) : null}
                          {device.alert_sent_at ? (
                            <span className="text-red-300/85">Alert sent: {formatTimestamp(device.alert_sent_at)}</span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <StatusBadge status={status} />
                  </CardContent>
                </Card>
              </m.div>
            );
          })}
        </m.div>
      )}
    </div>
  );
};

export const DeviceStatus = () => (
  <MotionBoundary>
    <DeviceStatusContent />
  </MotionBoundary>
);

function StatusBadge({ status }: { status: HeartbeatStatus }) {
  const labels: Record<HeartbeatStatus, string> = { online: 'ACTIVE', stale: 'STALE', offline: 'OFFLINE' };
  const colors: Record<HeartbeatStatus, string> = {
    online: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400',
    stale: 'border-amber-500/25 bg-amber-500/10 text-amber-400',
    offline: 'border-red-500/25 bg-red-500/10 text-red-400',
  };

  return (
    <div className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs font-bold ${colors[status]}`}>
      <span className={`size-1.5 rounded-full ${status === 'online' ? 'bg-emerald-400' : status === 'stale' ? 'bg-amber-400' : 'bg-red-400'}`} />
      {labels[status]}
    </div>
  );
}
