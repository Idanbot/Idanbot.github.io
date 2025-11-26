import { motion } from 'framer-motion';

export const TracingBeams = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <svg className="w-full h-full opacity-20">
        <defs>
          <linearGradient id="beam-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#00f0ff" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* Left vertical line */}
        <motion.path
          d="M50 0 V 10000"
          stroke="url(#beam-gradient)"
          strokeWidth="2"
          strokeDasharray="100 1000"
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: -1100 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />

         {/* Right vertical line */}
         <motion.path
          d="M95% 0 V 10000"
          stroke="url(#beam-gradient)"
          strokeWidth="2"
          strokeDasharray="100 1000"
          initial={{ strokeDashoffset: -500 }}
          animate={{ strokeDashoffset: -1600 }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
        />

        {/* Diagonal Cross 1 */}
        <motion.path
          d="M0 0 L 100% 100%"
          stroke="url(#beam-gradient)"
          strokeWidth="1"
          strokeDasharray="50 500"
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: -550 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          opacity="0.5"
        />
      </svg>
    </div>
  );
};
