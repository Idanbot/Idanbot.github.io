import { useEffect, useState, useRef } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { useInView, useReducedMotion } from 'framer-motion';

export const ParticleNetwork = () => {
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

  const particleCount = isCoarsePointer ? 26 : 44;
  const fpsLimit = isCoarsePointer ? 45 : 72;

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
                onHover: { enable: !isCoarsePointer, mode: 'repulse' },
                resize: { enable: true },
              },
              modes: {
                repulse: { distance: 80, duration: 0.35 },
              },
            },
            particles: {
              color: { value: '#d92121' },
              links: {
                color: '#8e929c',
                distance: 140,
                enable: true,
                opacity: 0.32,
                width: 1,
              },
              move: {
                direction: 'none',
                enable: true,
                outModes: { default: 'bounce' },
                random: false,
                speed: 0.72,
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
