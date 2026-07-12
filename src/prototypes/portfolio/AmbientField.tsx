import { useEffect, useRef } from 'react';

type AmbientFieldProps = {
  mode: 'ribbons' | 'orbits';
  className?: string;
};

type LabProbeWindow = Window & {
  __portfolioLabFrameProbe?: { frames: number; mode: AmbientFieldProps['mode'] };
};

const MAX_RENDER_PIXELS = 900_000;

function renderScale(width: number, height: number) {
  const nativeRatio = Math.min(window.devicePixelRatio || 1, 1.5);
  const areaRatio = Math.sqrt(MAX_RENDER_PIXELS / Math.max(1, width * height));
  return Math.max(0.32, Math.min(nativeRatio, areaRatio));
}

function drawRibbons(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsed: number,
  pointerX: number,
  pointerY: number
) {
  const ribbonCount = width < 700 ? 10 : 12;
  const segments = width > 2400 ? 36 : 30;
  const travel = elapsed * 0.34;

  context.lineCap = 'round';

  for (let ribbon = 0; ribbon < ribbonCount; ribbon += 1) {
    const amount = ribbon / Math.max(1, ribbonCount - 1);
    const baseY = height * (0.2 + amount * 0.7);
    const amplitude = height * (0.028 + amount * 0.025);
    context.beginPath();
    for (let segment = 0; segment <= segments; segment += 1) {
      const progress = segment / segments;
      const x = progress * width;
      const envelope = Math.sin(progress * Math.PI);
      const y =
        baseY +
        Math.sin(progress * 7.4 + travel + ribbon * 0.34) * amplitude * envelope +
        Math.sin(progress * 2.3 - travel * 0.6 + ribbon) * amplitude * 0.46 +
        pointerY * height * 0.018 * envelope +
        pointerX * width * 0.008 * (amount - 0.5);
      if (segment === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.strokeStyle =
      ribbon % 5 === 0
        ? `rgba(52, 211, 153, ${0.055 + amount * 0.05})`
        : `rgba(186, 230, 253, ${0.07 + amount * 0.075})`;
    context.lineWidth = 0.65 + amount * 0.8;
    context.stroke();
  }

  const pulseCount = width < 700 ? 10 : 16;
  for (let index = 0; index < pulseCount; index += 1) {
    const seed = (index * 0.61803398875) % 1;
    const progress = (seed + elapsed * (0.018 + (index % 4) * 0.004)) % 1;
    const x = progress * width;
    const lane = index % ribbonCount;
    const amount = lane / Math.max(1, ribbonCount - 1);
    const baseY = height * (0.2 + amount * 0.7);
    const y = baseY + Math.sin(progress * 7.4 + travel + lane * 0.34) * height * 0.03;
    const radius = 0.8 + (index % 3) * 0.45;

    context.beginPath();
    context.arc(x, y, radius * 3.2, 0, Math.PI * 2);
    context.fillStyle = index % 5 === 0 ? 'rgba(52, 211, 153, 0.11)' : 'rgba(186, 230, 253, 0.1)';
    context.fill();
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fillStyle = index % 5 === 0 ? 'rgba(52, 211, 153, 0.72)' : 'rgba(186, 230, 253, 0.62)';
    context.fill();
  }
}

function drawOrbits(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsed: number,
  pointerX: number,
  pointerY: number
) {
  const centerX = width * (width < 760 ? 0.5 : 0.57) + pointerX * width * 0.018;
  const centerY = height * 0.5 + pointerY * height * 0.02;
  const radius = Math.min(width, height) * 0.34;
  const orbitCount = width < 700 ? 4 : 5;

  context.lineWidth = 1;
  for (let orbit = 0; orbit < orbitCount; orbit += 1) {
    const amount = (orbit + 1) / orbitCount;
    context.beginPath();
    context.ellipse(
      centerX,
      centerY,
      radius * amount * 1.28,
      radius * amount * 0.54,
      -0.28 + orbit * 0.08,
      0,
      Math.PI * 2
    );
    context.strokeStyle = orbit % 2 === 0 ? 'rgba(103, 232, 249, 0.16)' : 'rgba(163, 230, 53, 0.12)';
    context.stroke();
  }

  const nodeCount = width < 700 ? 14 : 22;
  const points: { x: number; y: number }[] = [];
  for (let index = 0; index < nodeCount; index += 1) {
    const orbit = (index % orbitCount) + 1;
    const amount = orbit / orbitCount;
    const angle =
      elapsed * (0.16 + (index % 3) * 0.025) +
      index * 2.399963229728653 +
      (orbit % 2 === 0 ? elapsed * -0.08 : 0);
    const rotation = -0.28 + orbit * 0.08;
    const localX = Math.cos(angle) * radius * amount * 1.28;
    const localY = Math.sin(angle) * radius * amount * 0.54;
    const x = centerX + localX * Math.cos(rotation) - localY * Math.sin(rotation);
    const y = centerY + localX * Math.sin(rotation) + localY * Math.cos(rotation);
    points.push({ x, y });
  }

  for (let index = 0; index < points.length; index += 1) {
    const point = points[index];
    const next = points[(index + 7) % points.length];
    const distance = Math.hypot(point.x - next.x, point.y - next.y);
    if (index % 3 === 0 && distance < radius * 1.15) {
      context.beginPath();
      context.moveTo(point.x, point.y);
      context.lineTo(next.x, next.y);
      context.strokeStyle = 'rgba(125, 211, 252, 0.055)';
      context.lineWidth = 0.75;
      context.stroke();
    }

    const nodeRadius = index % 6 === 0 ? 2.2 : 1.2;
    context.beginPath();
    context.arc(point.x, point.y, nodeRadius * 3.4, 0, Math.PI * 2);
    context.fillStyle = index % 5 === 0 ? 'rgba(190, 242, 100, 0.12)' : 'rgba(165, 243, 252, 0.1)';
    context.fill();
    context.beginPath();
    context.arc(point.x, point.y, nodeRadius, 0, Math.PI * 2);
    context.fillStyle = index % 5 === 0 ? 'rgba(190, 242, 100, 0.9)' : 'rgba(165, 243, 252, 0.72)';
    context.fill();
  }
  context.beginPath();
  context.arc(centerX, centerY, 4.5, 0, Math.PI * 2);
  context.fillStyle = 'rgba(248, 250, 252, 0.92)';
  context.fill();
}

export function AmbientField({ mode, className = '' }: AmbientFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    const context = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !parent || !context) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 1;
    let height = 1;
    let scale = 1;
    let frame = 0;
    let startedAt = performance.now();
    let visible = true;
    let pointerX = 0;
    let pointerY = 0;
    let targetPointerX = 0;
    let targetPointerY = 0;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      scale = renderScale(width, height);
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    const draw = (timestamp: number) => {
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.setTransform(scale, 0, 0, scale, 0, 0);
      pointerX += (targetPointerX - pointerX) * 0.035;
      pointerY += (targetPointerY - pointerY) * 0.035;
      const elapsed = (timestamp - startedAt) / 1000;

      if (mode === 'ribbons') drawRibbons(context, width, height, elapsed, pointerX, pointerY);
      else drawOrbits(context, width, height, elapsed, pointerX, pointerY);

      const probe = (window as LabProbeWindow).__portfolioLabFrameProbe;
      if (probe?.mode === mode) probe.frames += 1;
    };

    const loop = (timestamp: number) => {
      draw(timestamp);
      if (!reducedMotion && visible && !document.hidden) frame = requestAnimationFrame(loop);
    };

    const syncPlayback = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (mode === 'ribbons') {
        draw(performance.now());
      } else if (!reducedMotion && visible && !document.hidden) {
        startedAt = performance.now();
        frame = requestAnimationFrame(loop);
      } else {
        draw(performance.now());
      }
    };

    const handlePointer = (event: PointerEvent) => {
      targetPointerX = event.clientX / Math.max(1, window.innerWidth) - 0.5;
      targetPointerY = event.clientY / Math.max(1, window.innerHeight) - 0.5;
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        syncPlayback();
      },
      { rootMargin: '100px', threshold: 0.01 }
    );

    resizeObserver.observe(parent);
    intersectionObserver.observe(canvas);
    if (mode === 'orbits') window.addEventListener('pointermove', handlePointer, { passive: true });
    document.addEventListener('visibilitychange', syncPlayback);
    resize();
    syncPlayback();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      if (mode === 'orbits') window.removeEventListener('pointermove', handlePointer);
      document.removeEventListener('visibilitychange', syncPlayback);
    };
  }, [mode]);

  return (
    <canvas
      ref={canvasRef}
      className={`lab-ambient-field lab-ambient-field--${mode} ${className}`}
      aria-hidden
    />
  );
}
