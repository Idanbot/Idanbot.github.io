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
  const segments = quality === 'full' ? 54 : 27; // Reduced by ~10% linearly (reduces vertices by ~20%)
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

  // Layer: Cyber Monoliths
  const monolithsGroup = new THREE.Group();
  const monolithGeo = new THREE.BoxGeometry(1.5, 12, 1.5);
  
  // 1. Height-Based Gradients via Vertex Colors
  const mPos = monolithGeo.attributes.position;
  const mColors = [];
  const mColorTop = new THREE.Color(0x0f172a);
  const mColorBot = new THREE.Color(0x000000);
  for (let i = 0; i < mPos.count; i++) {
    const y = mPos.getY(i);
    const t = Math.max(0, Math.min(1, (y + 6) / 12));
    const c = mColorBot.clone().lerp(mColorTop, t);
    mColors.push(c.r, c.g, c.b);
  }
  monolithGeo.setAttribute('color', new THREE.Float32BufferAttribute(mColors, 3));
  
  const monolithMat = new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
  });
  
  const monolithEdges = new THREE.EdgesGeometry(monolithGeo);
  const ePos = monolithEdges.attributes.position;
  const eColors = [];
  const eColorTop = new THREE.Color(0x38bdf8);
  const eColorBot = new THREE.Color(0x000000);
  for (let i = 0; i < ePos.count; i++) {
    const y = ePos.getY(i);
    const t = Math.max(0, Math.min(1, (y + 6) / 12));
    const c = eColorBot.clone().lerp(eColorTop, Math.pow(t, 2)); // Sharper curve for glowing tips
    eColors.push(c.r, c.g, c.b);
  }
  monolithEdges.setAttribute('color', new THREE.Float32BufferAttribute(eColors, 3));
  const edgeMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.525 });

  // 2. Scanning Lasers
  const scannerGeo = new THREE.BoxGeometry(1.7, 0.05, 1.7);
  const scannerMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8 });
  const scannerEdges = new THREE.EdgesGeometry(scannerGeo);
  const scannerEdgeMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
  
  const monolithData: { mesh: Three.Mesh, targetY: number, scanner: Three.Mesh, randomPhase: number }[] = [];
  
  for(let i=0; i<8; i++) {
    const mesh = new THREE.Mesh(monolithGeo, monolithMat);
    const edges = new THREE.LineSegments(monolithEdges, edgeMat);
    mesh.add(edges);
    
    // Add scanner to this monolith
    const scanner = new THREE.Mesh(scannerGeo, scannerMat);
    const sEdges = new THREE.LineSegments(scannerEdges, scannerEdgeMat);
    scanner.add(sEdges);
    mesh.add(scanner);

    const targetY = (Math.random() - 0.5) * 4;
    mesh.position.set((Math.random() - 0.5) * 35, -30, -10 - Math.random() * 25);
    monolithsGroup.add(mesh);
    monolithData.push({ mesh, targetY, scanner, randomPhase: Math.random() * Math.PI * 2 });
  }
  group.add(monolithsGroup);

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



    // Animate Terrain
    const posAttr = terrainGeo.attributes.position as Three.BufferAttribute;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const localZ = posAttr.getZ(i);
      const worldZ = localZ + terrain.position.z;
      
      // Ocean wave simulation
      // Main directional swell rolling diagonally
      const swell1 = Math.sin(x * 0.2 + worldZ * 0.3 + elapsed * 1.2) * 0.7;
      
      // Cross directional swell for intersecting wave peaks
      const swell2 = Math.sin(x * -0.3 + worldZ * 0.2 + elapsed * 1.5) * 0.5;
      
      // Smaller choppy surface waves moving faster
      const chop = Math.sin(x * 0.8 + worldZ * 1.1 + elapsed * 2.5) * 0.15;
      
      // Deep, slow overall rolling motion
      const deepRoll = Math.sin(x * 0.1 - worldZ * 0.1 + elapsed * 0.5) * 0.4;
      
      const y = swell1 + swell2 + chop + deepRoll;
      posAttr.setY(i, y);
    }
    posAttr.needsUpdate = true;

    // Parallax
    camera.position.x += (currentPointerX * 3 - camera.position.x) * 0.05;
    camera.position.y += (2 - currentPointerY * 2 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    // 4. Pulsing "Breathing" Glow (Global)
    const pulse = Math.sin(elapsed * 2) * 0.5 + 0.5; // 0 to 1
    edgeMat.opacity = 0.3 + pulse * 0.4;
    scannerMat.opacity = 0.5 + pulse * 0.5;

    // Animate Monoliths
    monolithData.forEach(data => {
      const { mesh, targetY, scanner, randomPhase } = data;
      mesh.position.z += 0.08;
      
      if (mesh.position.y < targetY) {
        mesh.position.y += (targetY - mesh.position.y) * 0.1 + 0.1;
        if (mesh.position.y > targetY) mesh.position.y = targetY;
      }

      // Animate Scanner
      // Box height is 12, so local Y goes from -6 to +6.
      scanner.position.y = Math.sin(elapsed * 2 + randomPhase) * 5.5;

      if (mesh.position.z > 5) {
        mesh.position.z -= 35;
        mesh.position.x = (Math.random() - 0.5) * 35;
        mesh.position.y = -20;
        data.targetY = (Math.random() - 0.5) * 4;
      }
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
