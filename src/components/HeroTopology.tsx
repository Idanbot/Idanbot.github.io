import { useEffect, useRef } from 'react';

type TopologyQuality = 'full' | 'reduced';

type TopologyNode = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  tone: 'cloud' | 'platform';
};

const NODE_BLUEPRINTS: TopologyNode[] = [
  { x: 0.08, y: 0.22, vx: 0.008, vy: 0.006, radius: 2.1, tone: 'cloud' },
  { x: 0.18, y: 0.56, vx: -0.006, vy: 0.007, radius: 1.5, tone: 'platform' },
  { x: 0.28, y: 0.34, vx: 0.007, vy: -0.005, radius: 1.8, tone: 'cloud' },
  { x: 0.38, y: 0.74, vx: -0.004, vy: -0.007, radius: 1.4, tone: 'cloud' },
  { x: 0.47, y: 0.18, vx: 0.005, vy: 0.008, radius: 2.2, tone: 'platform' },
  { x: 0.56, y: 0.48, vx: -0.007, vy: 0.004, radius: 1.5, tone: 'cloud' },
  { x: 0.65, y: 0.72, vx: 0.005, vy: -0.006, radius: 1.8, tone: 'platform' },
  { x: 0.73, y: 0.28, vx: -0.005, vy: 0.006, radius: 1.4, tone: 'cloud' },
  { x: 0.84, y: 0.58, vx: 0.006, vy: -0.004, radius: 2, tone: 'cloud' },
  { x: 0.92, y: 0.18, vx: -0.007, vy: 0.005, radius: 1.5, tone: 'platform' },
  { x: 0.12, y: 0.84, vx: 0.004, vy: -0.006, radius: 1.3, tone: 'cloud' },
  { x: 0.78, y: 0.88, vx: -0.004, vy: -0.005, radius: 1.6, tone: 'platform' },
];

const cloneNodes = (quality: TopologyQuality) =>
  NODE_BLUEPRINTS.slice(0, quality === 'full' ? 12 : 8).map((node) => ({ ...node }));

export function HeroTopology({ quality }: { quality: TopologyQuality }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const nodes = cloneNodes(quality);
    const fps = quality === 'full' ? 30 : 24;
    const maxPixelRatio = quality === 'full' ? 1.25 : 1;
    let width = 1;
    let height = 1;
    let animationFrame = 0;
    let lastFrame = 0;
    let visible = true;
    let disposed = false;

    const draw = () => {
      context.clearRect(0, 0, width, height);

      const connectionDistance = Math.min(width, height) * (quality === 'full' ? 0.31 : 0.28);
      for (let index = 0; index < nodes.length; index += 1) {
        const from = nodes[index];
        for (let nextIndex = index + 1; nextIndex < nodes.length; nextIndex += 1) {
          const to = nodes[nextIndex];
          const dx = (from.x - to.x) * width;
          const dy = (from.y - to.y) * height;
          const distance = Math.hypot(dx, dy);
          if (distance > connectionDistance) continue;

          const opacity = (1 - distance / connectionDistance) * (quality === 'full' ? 0.18 : 0.12);
          context.beginPath();
          context.moveTo(from.x * width, from.y * height);
          context.lineTo(to.x * width, to.y * height);
          context.strokeStyle = `rgba(147, 197, 253, ${opacity})`;
          context.lineWidth = 1;
          context.stroke();
        }
      }

      for (const node of nodes) {
        const x = node.x * width;
        const y = node.y * height;
        const color = node.tone === 'platform' ? '52, 211, 153' : '96, 165, 250';
        const glow = context.createRadialGradient(x, y, 0, x, y, node.radius * 6);
        glow.addColorStop(0, `rgba(${color}, 0.38)`);
        glow.addColorStop(1, `rgba(${color}, 0)`);
        context.fillStyle = glow;
        context.beginPath();
        context.arc(x, y, node.radius * 6, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = `rgba(${color}, 0.9)`;
        context.beginPath();
        context.arc(x, y, node.radius, 0, Math.PI * 2);
        context.fill();
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, maxPixelRatio);
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      draw();
    };

    const stop = () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    };

    const tick = (timestamp: number) => {
      if (disposed || !visible || document.hidden) {
        animationFrame = 0;
        return;
      }

      if (!lastFrame || timestamp - lastFrame >= 1000 / fps) {
        const delta = Math.min((timestamp - lastFrame || 16) / 1000, 0.05);
        for (const node of nodes) {
          node.x += node.vx * delta;
          node.y += node.vy * delta;
          if (node.x < 0.025 || node.x > 0.975) node.vx *= -1;
          if (node.y < 0.08 || node.y > 0.92) node.vy *= -1;
          node.x = Math.min(0.975, Math.max(0.025, node.x));
          node.y = Math.min(0.92, Math.max(0.08, node.y));
        }
        draw();
        lastFrame = timestamp;
      }
      animationFrame = window.requestAnimationFrame(tick);
    };

    const start = () => {
      if (!animationFrame && visible && !document.hidden && !disposed) {
        animationFrame = window.requestAnimationFrame(tick);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          draw();
          start();
        } else {
          stop();
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(canvas);

    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();
    start();

    return () => {
      disposed = true;
      stop();
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [quality]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-80" aria-hidden />;
}
