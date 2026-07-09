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
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.05);

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.set(0, 2, 10);
  camera.lookAt(0, 0, 0);

  const group = new THREE.Group();
  scene.add(group);

  // Terrain Grid
  const gridWidth = 40;
  const gridHeight = 40;
  const segments = quality === 'full' ? 60 : 30;
  const cellSize = gridHeight / segments;
  const terrainGeo = new THREE.PlaneGeometry(gridWidth, gridHeight, segments, segments);
  terrainGeo.rotateX(-Math.PI / 2);

  const terrainMat = new THREE.MeshBasicMaterial({
    color: 0x3b82f6,
    wireframe: true,
    transparent: true,
    opacity: 0.15,
  });
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  terrain.position.set(0, -3, -10);
  group.add(terrain);

  // Nodes on terrain
  const nodeMat = new THREE.PointsMaterial({
    color: 0x60a5fa,
    size: 0.075,
    transparent: true,
    opacity: 0.8
  });
  const nodes = new THREE.Points(terrainGeo, nodeMat);
  nodes.position.copy(terrain.position);
  group.add(nodes);

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
    group.position.set(compact ? 0 : 0, compact ? 1 : 0, 0);
  };

  const render = () => {
    // Scroll terrain forward and loop by cell size for seamless grid motion
    const scrollZ = (elapsed * 3) % cellSize;
    terrain.position.z = -10 + scrollZ;
    nodes.position.z = terrain.position.z;

    // Dynamically update vertex Y positions based on their absolute world Z position
    // This makes the mountain noise stay locked in world space while the grid lines flow towards the camera
    const posAttr = terrainGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const localZ = posAttr.getZ(i);
      const worldZ = localZ + terrain.position.z;
      
      // Calculate smooth noise for terrain with stochastic morphing
      const baseTerrain = Math.sin(x * 0.4) * Math.cos(worldZ * 0.4) * 1.5;
      const dynamicWave = Math.sin(x * 0.3 + elapsed * 0.5) * Math.cos(worldZ * 0.2 - elapsed * 0.3) * 0.5;
      const detail = Math.sin(x * 1.2 - elapsed * 0.8) * Math.cos(worldZ * 1.5 + elapsed * 0.4) * 0.15;
      
      const y = baseTerrain + dynamicWave + detail;
      posAttr.setY(i, y);
    }
    posAttr.needsUpdate = true;

    // Parallax
    camera.position.x += (currentPointerX * 3 - camera.position.x) * 0.05;
    camera.position.y += (2 - currentPointerY * 2 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

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
