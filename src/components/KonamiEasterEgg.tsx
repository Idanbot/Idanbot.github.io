import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export const KonamiEasterEgg = () => {
  const [active, setActive] = useState(false);
  const buffer = React.useRef<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      buffer.current = [...buffer.current, e.key].slice(-KONAMI_CODE.length);
      if (JSON.stringify(buffer.current) === JSON.stringify(KONAMI_CODE)) {
        setActive(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black text-green-500 font-mono overflow-hidden pointer-events-auto"
          onClick={() => setActive(false)}
        >
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <h1 className="text-9xl font-bold glitch-text mb-8">GOD MODE</h1>
            <p className="text-2xl blink">ACCESS GRANTED - SYSTEM OVERRIDE</p>
            <p className="mt-8 text-sm text-gray-500">Click anywhere to exit matrix</p>
          </div>
          
          {/* Matrix Rain Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
             {Array.from({ length: 50 }).map((_, i) => (
               <div 
                 key={i}
                 className="absolute top-0 text-xs animate-matrix"
                 style={{
                   left: `${Math.random() * 100}%`,
                   animationDuration: `${Math.random() * 2 + 1}s`,
                   animationDelay: `${Math.random() * 2}s`
                 }}
               >
                 {Array.from({ length: 20 }).map(() => String.fromCharCode(0x30A0 + Math.random() * 96)).join('\n')}
               </div>
             ))}
          </div>

          <style>{`
            @keyframes matrix {
              0% { transform: translateY(-100%); }
              100% { transform: translateY(100vh); }
            }
            .animate-matrix {
              animation-name: matrix;
              animation-timing-function: linear;
              animation-iteration-count: infinite;
            }
            .glitch-text {
              text-shadow: 2px 2px #ff00ff, -2px -2px #00ffff;
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

