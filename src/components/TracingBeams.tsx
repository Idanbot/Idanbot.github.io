import { motion } from 'framer-motion';
import { memo } from 'react';

const beams = [
  { x: '10%', duration: 8, delay: 0 },
  { x: '30%', duration: 12, delay: 2 },
  { x: '50%', duration: 10, delay: 1 },
  { x: '70%', duration: 15, delay: 3 },
  { x: '90%', duration: 9, delay: 0.5 },
];

const _TracingBeams = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <svg className="w-full h-full opacity-30">
        <defs>
          <linearGradient id="beam-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {beams.map((beam, i) => (
          <motion.line
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
              ease: "linear",
              delay: beam.delay
            }}
          />
        ))}

        {/* Diagonal Beam */}
        <motion.line
          x1="0" y1="0" x2="100%" y2="100%"
          stroke="url(#beam-gradient)"
          strokeWidth="2"
          strokeDasharray="200 2000"
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: -2200 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          opacity="0.5"
        />
      </svg>
    </div>
  );
};

export const TracingBeams = memo(_TracingBeams);
TracingBeams.displayName = 'TracingBeams';
