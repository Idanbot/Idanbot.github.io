import { useState, useEffect, useCallback } from 'react';
import { m, Variants } from 'framer-motion';
import { Server, Cpu, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';

interface Device {
  id: string;
  name: string;
  heartbeat: number;
  last_timestamp: string;
}

type DeviceStatusType = 'online' | 'stale' | 'offline';

function getRelativeTime(timestampStr: string): string {
  try {
    const past = new Date(timestampStr).getTime();
    if (isNaN(past)) return 'unknown';
    const now = Date.now();
    const diffMs = now - past;
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 0) return 'just now';
    if (diffSecs < 10) return 'just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch (e) {
    return 'unknown';
  }
}

function getDeviceStatus(device: Device): DeviceStatusType {
  if (device.heartbeat !== 1) return 'offline';
  
  try {
    const past = new Date(device.last_timestamp).getTime();
    if (isNaN(past)) return 'offline';
    const now = Date.now();
    const diffMs = now - past;
    // If last heartbeat was more than 10 minutes (600,000ms) ago, consider it stale
    if (diffMs > 600000) {
      return 'stale';
    }
    return 'online';
  } catch (e) {
    return 'offline';
  }
}

export const DeviceStatus = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchDevices = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError(null);

    try {
      const response = await fetch('https://device-heartbeat-monitor.botbolidan.workers.dev/');
      if (!response.ok) {
        throw new Error(`Failed to fetch device status: ${response.statusText}`);
      }
      const data: Device[] = await response.json();
      
      // Sort devices: online first, then stale, then offline; then alphabetically by name
      const sortedData = [...data].sort((a, b) => {
        const statusA = getDeviceStatus(a);
        const statusB = getDeviceStatus(b);
        const rank = { online: 0, stale: 1, offline: 2 };
        
        if (rank[statusA] !== rank[statusB]) {
          return rank[statusA] - rank[statusB];
        }
        return a.name.localeCompare(b.name);
      });

      setDevices(sortedData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while connecting to the heartbeat monitor.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  // Overall system health status
  const systemStatus = useCallback(() => {
    if (devices.length === 0) return 'unknown';
    const statuses = devices.map(getDeviceStatus);
    if (statuses.every(s => s === 'online')) return 'healthy';
    if (statuses.some(s => s === 'offline')) return 'degraded';
    return 'warning';
  }, [devices]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } },
  };

  return (
    <div className="w-full space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                systemStatus() === 'healthy' && "bg-emerald-400",
                systemStatus() === 'warning' && "bg-amber-400",
                systemStatus() === 'degraded' && "bg-red-400",
                systemStatus() === 'unknown' && "bg-zinc-400"
              )}></span>
              <span className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                systemStatus() === 'healthy' && "bg-emerald-500",
                systemStatus() === 'warning' && "bg-amber-500",
                systemStatus() === 'degraded' && "bg-red-500",
                systemStatus() === 'unknown' && "bg-zinc-500"
              )}></span>
            </span>
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Infrastructure Status
            </h3>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 sm:text-2xl">
            Live Device Heartbeats
          </h2>
        </div>

        <button
          onClick={() => fetchDevices(true)}
          disabled={loading || isRefreshing}
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-mono text-muted-foreground hover:bg-white/[0.08] hover:text-white transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-95"
        >
          <RefreshCw size={12} className={cn("shrink-0", (loading || isRefreshing) && "animate-spin")} />
          <span>{isRefreshing ? 'REFRESHING...' : 'REFRESH'}</span>
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        /* Loading Skeletons */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="border-white/5 bg-card/40 animate-pulse">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-2.5 flex-1">
                  <div className="h-4 bg-white/10 rounded w-1/3" />
                  <div className="h-3 bg-white/5 rounded w-1/4" />
                </div>
                <div className="h-6 bg-white/10 rounded w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        /* Error Alert */
        <Card className="border-red-500/20 bg-red-500/[0.03] backdrop-blur-md">
          <CardContent className="flex flex-col sm:flex-row items-center gap-4 p-6 text-center sm:text-left">
            <div className="rounded-full bg-red-500/10 p-3 text-red-400">
              <AlertCircle size={24} />
            </div>
            <div className="space-y-1 flex-1">
              <h4 className="font-semibold text-white">Connection Error</h4>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <button
              onClick={() => fetchDevices()}
              className="mt-3 sm:mt-0 inline-flex min-h-9 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-all active:scale-95"
            >
              Retry Connection
            </button>
          </CardContent>
        </Card>
      ) : devices.length === 0 ? (
        /* Empty State */
        <Card className="border-white/5 bg-card/20">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-3">
            <div className="rounded-full bg-white/5 p-3 text-muted-foreground">
              <Server size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">No monitored devices found</p>
              <p className="text-xs text-muted-foreground mt-1">Add devices to your monitoring dashboard to track their status.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Device Status Cards */
        <m.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {devices.map((device) => {
            const status = getDeviceStatus(device);
            const isOnline = status === 'online';
            const isStale = status === 'stale';
            const relativeTime = getRelativeTime(device.last_timestamp);

            return (
              <m.div key={device.id} variants={cardVariants}>
                <Card className={cn(
                  "group relative overflow-hidden transition-all duration-300 border-white/5 hover:border-white/10 bg-card/45 backdrop-blur-md hover:scale-[1.01] hover:shadow-lg",
                  isOnline && "hover:shadow-emerald-500/[0.02]",
                  isStale && "hover:shadow-amber-500/[0.02]",
                  !isOnline && !isStale && "hover:shadow-red-500/[0.02]"
                )}>
                  {/* Glowing vertical indicator strip */}
                  <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-[3px] transition-colors duration-300",
                    isOnline && "bg-emerald-500/80 shadow-[0_0_10px_#10b981]",
                    isStale && "bg-amber-500/80 shadow-[0_0_10px_#f59e0b]",
                    !isOnline && !isStale && "bg-red-500/80 shadow-[0_0_10px_#ef4444]"
                  )} />

                  <CardContent className="p-5 flex items-center justify-between gap-4 pl-6">
                    <div className="flex items-center gap-4">
                      {/* Decorative Server Icon with background highlight */}
                      <div className={cn(
                        "p-2.5 rounded-lg border border-white/5 bg-white/[0.02] text-muted-foreground/70 transition-colors group-hover:text-white duration-300",
                        isOnline && "group-hover:border-emerald-500/20 group-hover:bg-emerald-500/[0.02]",
                        isStale && "group-hover:border-amber-500/20 group-hover:bg-amber-500/[0.02]",
                        !isOnline && !isStale && "group-hover:border-red-500/20 group-hover:bg-red-500/[0.02]"
                      )}>
                        {device.name.includes('agent') ? <Cpu size={20} /> : <Server size={20} />}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-white text-sm sm:text-base truncate max-w-[150px] sm:max-w-[200px]">
                            {device.name}
                          </h4>
                          <span className="font-mono text-[10px] text-muted-foreground bg-white/5 border border-white/10 px-1.5 py-0.5 rounded leading-none">
                            {device.id}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock size={11} className="shrink-0" />
                          <span className="truncate" title={new Date(device.last_timestamp).toLocaleString()}>
                            {isOnline ? `Pinged ${relativeTime}` : `Last active ${relativeTime}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Pill Badge */}
                    <div className="shrink-0">
                      {isOnline ? (
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-mono font-bold text-emerald-400 border border-emerald-500/25">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                          </span>
                          <span>ACTIVE</span>
                        </div>
                      ) : isStale ? (
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-mono font-bold text-amber-400 border border-amber-500/25">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                          </span>
                          <span>STALE</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-mono font-bold text-red-400 border border-red-500/25">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                          <span>OFFLINE</span>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  {/* Watermark Icon in background */}
                  <div className="absolute -bottom-4 -right-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                    {device.name.includes('agent') ? (
                      <Cpu size={80} className="text-white" />
                    ) : (
                      <Server size={80} className="text-white" />
                    )}
                  </div>
                </Card>
              </m.div>
            );
          })}
        </m.div>
      )}
    </div>
  );
};
