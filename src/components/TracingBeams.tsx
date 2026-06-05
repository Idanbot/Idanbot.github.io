import { m, useReducedMotion } from 'framer-motion';
import { memo } from 'react';

const beams = [
  { x: '10%', duration: 8, delay: 0 },
  { x: '30%', duration: 12, delay: 2 },
  { x: '50%', duration: 10, delay: 1 },
  { x: '70%', duration: 15, delay: 3 },
  { x: '90%', duration: 9, delay: 0.5 },
];

function TracingBeamsInner() {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <svg className="h-full w-full opacity-20">
        <defs>
          <linearGradient id="beam-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {beams.map((beam, i) => (
          <m.line
            key={i}
            x1={beam.x}
            y1="-20%"
            x2={beam.x}
            y2="120%"
            stroke="url(#beam-gradient)"
            strokeWidth="2"
            strokeDasharray="200 2000"
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: -2200 }}
            transition={{
              duration: beam.duration,
              repeat: Infinity,
              ease: 'linear',
              delay: beam.delay,
            }}
          />
        ))}

        <m.line
          x1="0"
          y1="0"
          x2="100%"
          y2="100%"
          stroke="url(#beam-gradient)"
          strokeWidth="2"
          strokeDasharray="200 2000"
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: -2200 }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          opacity="0.35"
        />
      </svg>
    </div>
  );
}

export const TracingBeams = memo(TracingBeamsInner);
TracingBeams.displayName = 'TracingBeams';
