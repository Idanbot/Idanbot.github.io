import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Log {
  id: number;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'SUCCESS' | 'DEBUG';
  message: string;
}

// Module-level singleton service so timers / scroll handlers persist across mounts
class LogService {
  logs: Log[] = [];
  subscribers = new Set<(logs: Log[]) => void>();
  private logId = 0;
  private lastScrollY = 0;
  private lastLogTime = 0;
  private initialized = false;

  init() {
    if (this.initialized) return;
    this.initialized = true;

    // initial logs only once
    this.add('INFO', 'System initialized. Logger attached.');
    this.add('DEBUG', 'Rendering viewport components...');

    const getSectionFromScroll = (y: number) => {
      if (y < 500) return 'Hero';
      if (y < 1500) return 'Source/History';
      if (y < 2500) return 'Build';
      if (y < 3500) return 'Test';
      return 'Deploy/Monitor';
    };

    const handleScroll = () => {
      const now = Date.now();
      if (now - this.lastLogTime < 2000) return;

      const currentScroll = window.scrollY;
      const diff = Math.abs(currentScroll - this.lastScrollY);

      if (diff > 50) {
        const direction = currentScroll > this.lastScrollY ? 'DOWN' : 'UP';
        const section = getSectionFromScroll(currentScroll);
        this.add('INFO', `Scroll detected: ${direction} -> ${section}`);
        this.lastScrollY = currentScroll;
        this.lastLogTime = now;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    setInterval(() => {
      // 50 realistic noise messages grouped/sorted by level: DEBUG, INFO, SUCCESS, WARN
      const noise = [
        // DEBUG (20)
        () => this.add('DEBUG', `Memory usage: ${Math.floor(Math.random() * 30 + 50)}MB`),
        () => this.add('DEBUG', `JS heap size: ${Math.floor(Math.random() * 30 + 60)}MB`),
        () => this.add('DEBUG', 'Garbage collection completed in 12ms'),
        () => this.add('DEBUG', 'Cache miss: /assets/logo.svg'),
        () => this.add('DEBUG', 'Service worker ping'),
        () => this.add('DEBUG', 'Socket reconnect attempt #1'),
        () => this.add('DEBUG', 'WebRTC candidate gathered'),
        () => this.add('DEBUG', 'LRU cache pruning 4 entries'),
        () => this.add('DEBUG', 'Feature flag `new-ui` evaluated: false'),
        () => this.add('DEBUG', 'Prefetch queue size: 3'),
        () => this.add('DEBUG', 'IndexedDB transaction started'),
        () => this.add('DEBUG', 'Render pass 2 completed'),
        () => this.add('DEBUG', 'Style recompute: 8ms'),
        () => this.add('DEBUG', 'Input latency: 14ms'),
        () => this.add('DEBUG', 'XHR cache-control: max-age=3600'),
        () => this.add('DEBUG', 'LocalStorage quota check OK'),
        () => this.add('DEBUG', 'Animation frame budget healthy'),
        () => this.add('DEBUG', 'Route change diff: 2 components'),
        () => this.add('DEBUG', 'Worker thread spawned'),
        () => this.add('DEBUG', 'Task scheduler flushed'),

        // INFO (15)
        () => this.add('INFO', 'Heartbeat check: OK'),
        () => this.add('INFO', 'User session validated'),
        () => this.add('INFO', 'CDN purge request queued'),
        () => this.add('INFO', 'AWS Lambda function executed successfully'),
        () => this.add('INFO', 'AWS S3 bucket backup completed'),
        () => this.add('INFO', 'AWS EC2 instance started'),
        () => this.add('INFO', 'AWS RDS database backup completed'),
        () => this.add('INFO', 'New deployment detected: v1.4.2'),
        () => this.add('INFO', 'Configuration reloaded from /etc/app/config'),
        () => this.add('INFO', 'Healthcheck passed: api/v1/status'),
        () => this.add('INFO', 'Telemetry flushed to metrics pipeline'),
        () => this.add('INFO', 'Connected to upstream cache'),
        () => this.add('INFO', 'Background job completed: thumbnails'),
        () => this.add('INFO', 'Sitemap updated'),
        () => this.add('INFO', 'License check OK'),

        // SUCCESS (10)
        () => this.add('SUCCESS', 'Asset cache hit'),
        () => this.add('SUCCESS', 'AWS CloudFormation stack created'),
        () => this.add('SUCCESS', 'User uploaded avatar processed'),
        () => this.add('SUCCESS', 'Image optimization finished'),
        () => this.add('SUCCESS', 'Email delivery confirmed'),
        () => this.add('SUCCESS', 'Backup archive verified'),
        () => this.add('SUCCESS', 'Workflow job succeeded: test-suite'),
        () => this.add('SUCCESS', 'Database migration applied'),
        () => this.add('SUCCESS', 'Cache warmed for route /docs'),
        () => this.add('SUCCESS', 'Certificate renewed successfully'),

        // WARN (5)
        () => this.add('WARN', 'API rate limit near threshold'),
        () => this.add('WARN', 'Disk usage 82% on /var'),
        () => this.add('WARN', 'Slow query detected: 1.2s'),
        () => this.add('WARN', 'Deprecated API call used by client'),
        () => this.add('WARN', 'Unusual login location detected'),
      ];

      const randomLog = noise[Math.floor(Math.random() * noise.length)];
      if (Math.random() > 0.7) randomLog();
    }, 1000);
  }

  add(level: Log['level'], message: string) {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newLog: Log = { id: this.logId++, timestamp: timeString, level, message };
    this.logs = [...this.logs, newLog];
    if (this.logs.length > 15) this.logs.shift();
    this.emit();
  }

  emit() {
    this.subscribers.forEach(fn => fn(this.logs));
  }

  subscribe(fn: (logs: Log[]) => void) {
    this.subscribers.add(fn);
    fn(this.logs);
    return () => this.subscribers.delete(fn);
  }
}

const logService = new LogService();

export const LogStreamBackground = ({ activeSection }: { activeSection: string }) => {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    const unsub = logService.subscribe(setLogs);
    // ensure service is initialized (idempotent)
    logService.init();
    return () => { unsub(); };
  }, []);

  // Start invisible and only animate opacity (fast fade)
  // Remain visible after user reaches `build`; hide when in `hero` or when
  // the user scrolls back up into `history` (source).
  const targetOpacity = (activeSection === 'hero' || activeSection === 'history') ? 0 : 0.3;

  return (
    <motion.div
      initial={false}
      style={{ opacity: 0 }}
      animate={{ opacity: targetOpacity }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className="fixed left-4 top-[5vh] h-[90vh] w-lg pointer-events-none z-30 hidden lg:flex flex-col justify-start pb-10 font-mono text-[10px] md:text-xs mix-blend-screen overflow-hidden"
    >
      <AnimatePresence mode='popLayout'>
        {logs.map((log) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            layout
            className="mb-1 whitespace-nowrap"
          >
            <span className="text-gray-500">[{log.timestamp}]</span>{' '}
            <span className={`${log.level === 'INFO' ? 'text-blue-400' :
              log.level === 'WARN' ? 'text-yellow-400' :
                log.level === 'SUCCESS' ? 'text-green-400' :
                  'text-gray-400'
              }`}>[{log.level}]</span>{' '}
            <span className="text-gray-300">{log.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="h-10 bg-linear-to-t from-[#050505] to-transparent absolute bottom-0 w-full" />
    </motion.div>
  );
};
