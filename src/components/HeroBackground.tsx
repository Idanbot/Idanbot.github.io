import { useEffect, useRef } from 'react';
import type * as Three from 'three';

type SceneQuality = 'full' | 'reduced';

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

function createThreeScene(
  THREE: typeof import('three'),
  container: HTMLDivElement,
  canvas: HTMLCanvasElement,
  quality: SceneQuality
) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.82;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
  camera.position.set(0, 0, 9.2);

  const network = new THREE.Group();
  scene.add(network);

  const grid = new THREE.GridHelper(8, quality === 'full' ? 18 : 12, 0x3b82f6, 0x1d4f7a);
  const gridMaterials = Array.isArray(grid.material) ? grid.material : [grid.material];
  for (const material of gridMaterials) {
    material.transparent = true;
    material.opacity = quality === 'full' ? 0.2 : 0.14;
    material.depthWrite = false;
  }
  grid.position.set(0, -2.2, -1.4);
  grid.rotation.set(Math.PI * 0.42, 0, -0.12);
  network.add(grid);

  const frame = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(4.8, 2.9, 1.35)),
    new THREE.LineBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: quality === 'full' ? 0.34 : 0.24,
      depthWrite: false,
    })
  );
  frame.rotation.set(0.24, 0.18, -0.08);
  network.add(frame);

  const routeMaterial = (color: number, opacity: number) =>
    new THREE.LineDashedMaterial({
      color,
      transparent: true,
      opacity,
      dashSize: 0.12,
      gapSize: 0.16,
      scale: 1,
      depthWrite: false,
    });

  const routeDefinitions = [
    {
      color: 0x60a5fa,
      opacity: 0.82,
      points: [
        new THREE.Vector3(-2.5, -0.85, 0.35),
        new THREE.Vector3(-1.1, 0.9, -0.15),
        new THREE.Vector3(0.35, -0.35, 0.5),
        new THREE.Vector3(2.45, 0.82, -0.28),
      ],
    },
    {
      color: 0x34d399,
      opacity: 0.72,
      points: [
        new THREE.Vector3(-2.25, 0.9, -0.38),
        new THREE.Vector3(-0.72, -0.48, 0.48),
        new THREE.Vector3(0.92, 0.72, -0.12),
        new THREE.Vector3(2.52, -0.66, 0.24),
      ],
    },
    {
      color: 0x7dd3fc,
      opacity: 0.56,
      points: [
        new THREE.Vector3(-1.9, -1.24, -0.22),
        new THREE.Vector3(-0.2, 0.08, 0.6),
        new THREE.Vector3(1.4, -0.92, -0.12),
        new THREE.Vector3(2.7, 0.18, 0.42),
      ],
    },
  ];

  const dashedMaterials: Three.LineDashedMaterial[] = [];
  for (const definition of routeDefinitions.slice(0, quality === 'full' ? 3 : 2)) {
    const geometry = new THREE.BufferGeometry().setFromPoints(
      new THREE.CatmullRomCurve3(definition.points).getPoints(quality === 'full' ? 72 : 48)
    );
    const material = routeMaterial(definition.color, definition.opacity);
    const line = new THREE.Line(geometry, material);
    line.computeLineDistances();
    dashedMaterials.push(material);
    network.add(line);
  }

  const nodes = [
    [-2.5, -0.85, 0.35],
    [-2.25, 0.9, -0.38],
    [-1.1, 0.9, -0.15],
    [-0.72, -0.48, 0.48],
    [-0.2, 0.08, 0.6],
    [0.35, -0.35, 0.5],
    [0.92, 0.72, -0.12],
    [1.4, -0.92, -0.12],
    [2.45, 0.82, -0.28],
    [2.52, -0.66, 0.24],
    [2.7, 0.18, 0.42],
  ];
  const nodeGeometry = new THREE.BufferGeometry();
  nodeGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(
      nodes.slice(0, quality === 'full' ? nodes.length : 8).flat(),
      3
    )
  );
  const nodeCloud = new THREE.Points(
    nodeGeometry,
    new THREE.PointsMaterial({
      color: 0xbfdbfe,
      size: quality === 'full' ? 0.065 : 0.05,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      depthWrite: false,
    })
  );
  network.add(nodeCloud);

  let width = 1;
  let height = 1;
  let animationFrame = 0;
  let lastFrame = 0;
  let elapsed = 0;
  let visible = true;
  let disposed = false;
  let pointerX = 0;
  let pointerY = 0;
  let currentPointerX = 0;
  let currentPointerY = 0;

  const setResponsiveLayout = () => {
    const compact = width < 768;
    network.position.set(compact ? 0 : 2.1, compact ? -0.24 : 0.02, -0.15);
    network.scale.setScalar(compact ? 0.72 : 1);
  };

  const render = () => {
    network.rotation.x = currentPointerY * 0.08 + Math.sin(elapsed * 0.46) * 0.035;
    network.rotation.y = 0.16 + currentPointerX * 0.16 + elapsed * 0.052;
    network.rotation.z = Math.sin(elapsed * 0.34) * 0.032;

    dashedMaterials.forEach((material, index) => {
      material.dashSize = 0.12 + Math.sin(elapsed * (0.9 + index * 0.15) + index) * 0.035;
    });

    renderer.render(scene, camera);
  };

  const resize = () => {
    const rect = container.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, quality === 'full' ? 1.25 : 1);
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    setResponsiveLayout();
    render();
  };

  const stop = () => {
    if (!animationFrame) return;
    window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  };

  const frameLoop = (timestamp: number) => {
    if (disposed || !visible || document.hidden) {
      animationFrame = 0;
      return;
    }

    const fps = quality === 'full' ? 30 : 24;
    if (!lastFrame || timestamp - lastFrame >= 1000 / fps) {
      const delta = Math.min((timestamp - lastFrame || 16) / 1000, 0.05);
      elapsed += delta;
      currentPointerX += (pointerX - currentPointerX) * 0.045;
      currentPointerY += (pointerY - currentPointerY) * 0.045;
      render();
      lastFrame = timestamp;
    }

    animationFrame = window.requestAnimationFrame(frameLoop);
  };

  const start = () => {
    if (!animationFrame && visible && !document.hidden && !disposed) {
      animationFrame = window.requestAnimationFrame(frameLoop);
    }
  };

  const intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        render();
        start();
      } else {
        stop();
      }
    },
    { rootMargin: '120px 0px', threshold: 0.02 }
  );
  intersectionObserver.observe(container);

  const onVisibilityChange = () => {
    if (document.hidden) stop();
    else start();
  };

  const supportsPointerParallax = window.matchMedia('(pointer: fine)').matches;
  const onPointerMove = (event: PointerEvent) => {
    if (!supportsPointerParallax) return;
    const rect = container.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right) return;
    pointerX = (event.clientX - rect.left) / rect.width - 0.5;
    pointerY = (event.clientY - rect.top) / rect.height - 0.5;
  };

  const resizeObserver = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(resize);
  resizeObserver?.observe(container);
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('visibilitychange', onVisibilityChange);

  resize();
  start();

  return () => {
    disposed = true;
    stop();
    intersectionObserver.disconnect();
    resizeObserver?.disconnect();
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    scene.traverse((object) => {
      const drawable = object as Three.Object3D & {
        geometry?: Three.BufferGeometry;
        material?: Three.Material | Three.Material[];
      };
      drawable.geometry?.dispose();
      const materials = drawable.material
        ? Array.isArray(drawable.material)
          ? drawable.material
          : [drawable.material]
        : [];
      materials.forEach((material) => material.dispose());
    });
    renderer.dispose();
  };
}

export function HeroBackground({
  quality,
  animate,
}: {
  quality: SceneQuality;
  animate: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!animate) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let cancelled = false;
    let disposeScene: (() => void) | undefined;
    let animationFrame = 0;
    let idleHandle: number | undefined;
    const idleWindow = window as IdleWindow;

    const start = async () => {
      try {
        const THREE = await import('three');
        if (!cancelled) disposeScene = createThreeScene(THREE, container, canvas, quality);
      } catch {
        // Keep the CSS backdrop when WebGL is unavailable.
      }
    };

    if (idleWindow.requestIdleCallback) {
      idleHandle = idleWindow.requestIdleCallback(() => {
        void start();
      }, { timeout: 700 });
    } else {
      animationFrame = window.requestAnimationFrame(() => {
        void start();
      });
    }

    return () => {
      cancelled = true;
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      if (idleHandle !== undefined) idleWindow.cancelIdleCallback?.(idleHandle);
      disposeScene?.();
    };
  }, [animate, quality]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-x-0 -top-px bottom-0 z-0 overflow-hidden bg-[var(--background)]"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_76%_at_50%_0%,rgba(59,130,246,0.18),transparent_60%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_34%)]" />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-95 [mask-image:linear-gradient(to_bottom,black_0%,black_78%,transparent_100%)]"
      />
      <div className="absolute inset-0 opacity-[0.075] [background-image:linear-gradient(rgba(148,163,184,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.07)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:linear-gradient(to_bottom,black_0%,black_70%,transparent_96%)]" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/78 to-transparent" />
    </div>
  );
}
