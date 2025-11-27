import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Log {
  id: number;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'SUCCESS' | 'DEBUG';
  message: string;
}

export const LogStreamBackground = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const logIdCounter = useRef(0);
  const lastScrollY = useRef(0);

  const lastLogTime = useRef(0);

  const addLog = (level: Log['level'], message: string) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    const newLog: Log = {
      id: logIdCounter.current++,
      timestamp: timeString,
      level,
      message,
    };

    setLogs(prev => {
      const updated = [...prev, newLog];
      if (updated.length > 15) updated.shift(); // Keep last 15 logs
      return updated;
    });
  };

  useEffect(() => {
    addLog('INFO', 'System initialized. Logger attached.');
    addLog('DEBUG', 'Rendering viewport components...');

    const handleScroll = () => {
      const now = Date.now();
      if (now - lastLogTime.current < 2000) return;

      const currentScroll = window.scrollY;
      const diff = Math.abs(currentScroll - lastScrollY.current);
      
      if (diff > 50) { // Reduced threshold slightly as we have time throttling now
        const direction = currentScroll > lastScrollY.current ? 'DOWN' : 'UP';
        const section = getSectionFromScroll(currentScroll);
        addLog('INFO', `Scroll detected: ${direction} -> ${section}`);
        lastScrollY.current = currentScroll;
        lastLogTime.current = now;
      }
    };

    const getSectionFromScroll = (y: number) => {
        if (y < 500) return 'Hero';
        if (y < 1500) return 'Source/History';
        if (y < 2500) return 'Build';
        if (y < 3500) return 'Test';
        return 'Deploy/Monitor';
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Random background noise logs
    const interval = setInterval(() => {
        const noise = [
            () => addLog('DEBUG', `Memory usage: ${Math.floor(Math.random() * 20 + 40)}MB`),
            () => addLog('INFO', 'Heartbeat check: OK'),
            () => addLog('DEBUG', 'Garbage collection skipped'),
            () => addLog('SUCCESS', 'Asset cache hit'),
        ];
        const randomLog = noise[Math.floor(Math.random() * noise.length)];
        if (Math.random() > 0.7) randomLog();
    }, 4000);

    return () => {
        window.removeEventListener('scroll', handleScroll);
        clearInterval(interval);
    };
  }, []);

  return (
    <div className="fixed left-4 top-1/3 bottom-0 w-128 pointer-events-none z-0 hidden lg:flex flex-col justify-end pb-10 font-mono text-[10px] md:text-xs opacity-15 mix-blend-screen overflow-hidden">
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
            <span className={`${
              log.level === 'INFO' ? 'text-blue-400' :
              log.level === 'WARN' ? 'text-yellow-400' :
              log.level === 'SUCCESS' ? 'text-green-400' :
              'text-gray-400'
            }`}>[{log.level}]</span>{' '}
            <span className="text-gray-300">{log.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="h-10 bg-gradient-to-t from-[#050505] to-transparent absolute bottom-0 w-full" />
    </div>
  );
};
