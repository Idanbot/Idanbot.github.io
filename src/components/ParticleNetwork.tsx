import { useEffect, useState, useRef } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { useInView, useReducedMotion } from 'framer-motion';

export const ParticleNetwork = ({ quality = 'full' }: { quality?: 'full' | 'reduced' }) => {
  const [init, setInit] = useState(false);
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { amount: 0.12, margin: '80px' });
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    setIsCoarsePointer(mq.matches);
    const fn = () => setIsCoarsePointer(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);

  useEffect(() => {
    if (reduceMotion || !inView) return;

    let cancelled = false;
    const start = () => {
      initParticlesEngine(async (engine) => {
        await loadSlim(engine);
      }).then(() => {
        if (!cancelled) setInit(true);
      });
    };

    const id = window.setTimeout(() => start(), 280);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [reduceMotion, inView]);

  useEffect(() => {
    if (!inView || reduceMotion) setInit(false);
  }, [inView, reduceMotion]);

  const isReducedQuality = quality === 'reduced';
  const particleCount = isReducedQuality ? (isCoarsePointer ? 16 : 24) : isCoarsePointer ? 26 : 44;
  const fpsLimit = isReducedQuality ? (isCoarsePointer ? 30 : 42) : isCoarsePointer ? 45 : 72;
  const moveSpeed = isReducedQuality ? 0.45 : 0.72;
  const linkOpacity = isReducedQuality ? 0.22 : 0.32;

  if (reduceMotion) {
    return <div ref={containerRef} className="absolute inset-0 pointer-events-none" aria-hidden />;
  }

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none">
      {init && inView ? (
        <Particles
          id="tsparticles"
          className="absolute inset-0"
          options={{
            fullScreen: { enable: false },
            background: { color: { value: 'transparent' } },
            fpsLimit,
            interactivity: {
              events: {
                onHover: { enable: !isCoarsePointer && !isReducedQuality, mode: 'repulse' },
                resize: { enable: true },
              },
              modes: {
                repulse: { distance: 80, duration: 0.35 },
              },
            },
            particles: {
              color: { value: '#60a5fa' },
              links: {
                color: '#8e929c',
                distance: 140,
                enable: true,
                opacity: linkOpacity,
                width: 1,
              },
              move: {
                direction: 'none',
                enable: true,
                outModes: { default: 'bounce' },
                random: false,
                speed: moveSpeed,
                straight: false,
              },
              number: {
                density: { enable: true, width: 900, height: 900 },
                value: particleCount,
              },
              opacity: { value: 0.26 },
              shape: { type: 'circle' },
              size: { value: { min: 1, max: 2.5 } },
            },
            detectRetina: true,
          }}
        />
      ) : null}
    </div>
  );
};
