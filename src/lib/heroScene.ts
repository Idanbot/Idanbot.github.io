import type * as Three from 'three';
import { createHeroFrameClock, frameDamping, HERO_TARGET_FPS } from './heroTiming';

export type HeroSceneQuality = 'full' | 'reduced';

export interface HeroSceneController {
  start: () => void;
  stop: () => void;
  resize: (width: number, height: number, pixelRatio: number) => void;
  setPointer: (x: number, y: number) => void;
  dispose: () => void;
}

type HeroProbeWindow = Window & {
  __heroFrameProbe?: { frames: number };
};

const terrainVertexShader = `
  uniform float uTime;
  uniform float uScroll;
  varying float vElevation;

  float terrainHeight(vec2 point) {
    float swellA = sin(point.x * 0.20 + point.y * 0.30 + uTime * 1.05) * 0.62;
    float swellB = sin(point.x * -0.31 + point.y * 0.22 + uTime * 1.28) * 0.42;
    float signal = sin(point.x * 0.82 + point.y * 1.06 + uTime * 2.10) * 0.12;
    float roll = sin(point.x * 0.10 - point.y * 0.11 + uTime * 0.44) * 0.34;
    return swellA + swellB + signal + roll;
  }

  void main() {
    vec3 transformed = position;
    transformed.y = terrainHeight(vec2(position.x, position.z + uScroll));
    vElevation = transformed.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const terrainFragmentShader = `
  varying float vElevation;

  void main() {
    float glow = smoothstep(-0.8, 1.45, vElevation);
    gl_FragColor = vec4(0.30, 0.68, 1.0, 0.09 + glow * 0.17);
  }
`;

export function createHeroScene(
  THREE: typeof import('three'),
  canvas: HTMLCanvasElement,
  quality: HeroSceneQuality
): HeroSceneController {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x040405, 0.045);

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.set(0, 2, 10);

  const world = new THREE.Group();
  scene.add(world);

  const segments = quality === 'full' ? 48 : 30;
  const terrainSize = 40;
  const cellSize = terrainSize / segments;
  const terrainGeometry = new THREE.PlaneGeometry(
    terrainSize,
    terrainSize,
    segments,
    segments
  );
  terrainGeometry.rotateX(-Math.PI / 2);

  const terrainUniforms = {
    uTime: { value: 0 },
    uScroll: { value: 0 },
  };
  const terrainMaterial = new THREE.ShaderMaterial({
    uniforms: terrainUniforms,
    vertexShader: terrainVertexShader,
    fragmentShader: terrainFragmentShader,
    wireframe: true,
    transparent: true,
    depthWrite: false,
  });
  const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
  terrain.position.set(0, -3.1, -10);
  world.add(terrain);

  let width = 1;
  let elapsed = 0;
  let animationFrame = 0;
  let disposed = false;
  let targetPointerX = 0;
  let targetPointerY = 0;
  const frameClock = createHeroFrameClock(HERO_TARGET_FPS[quality]);
  const maxRenderPixels = quality === 'full' ? 1_800_000 : 1_000_000;

  const render = (deltaSeconds = 0) => {
    const scroll = (elapsed * 1.8) % cellSize;
    terrain.position.z = -10 + scroll;
    terrainUniforms.uTime.value = elapsed;
    terrainUniforms.uScroll.value = scroll;

    const cameraDamping = frameDamping(1.4, deltaSeconds);
    camera.position.x += (targetPointerX * 2.2 - camera.position.x) * cameraDamping;
    camera.position.y += (2 - targetPointerY * 1.4 - camera.position.y) * cameraDamping;
    camera.lookAt(0, -0.35, -3.5);

    renderer.render(scene, camera);
    const probe = (window as HeroProbeWindow).__heroFrameProbe;
    if (probe) probe.frames += 1;
  };

  const frameLoop = (timestamp: number) => {
    if (disposed) return;
    const delta = frameClock.tick(timestamp);
    if (delta !== null) {
      elapsed += delta;
      render(delta);
    }
    animationFrame = window.requestAnimationFrame(frameLoop);
  };

  const stop = () => {
    if (!animationFrame) return;
    window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    frameClock.reset();
  };

  return {
    start: () => {
      if (!animationFrame && !disposed) animationFrame = window.requestAnimationFrame(frameLoop);
    },
    stop,
    resize: (nextWidth, nextHeight, pixelRatio) => {
      width = Math.max(1, Math.round(nextWidth));
      const height = Math.max(1, Math.round(nextHeight));
      const renderPixelBudget = height > width ? maxRenderPixels * 0.72 : maxRenderPixels;
      const areaPixelRatio = Math.sqrt(renderPixelBudget / Math.max(1, width * height));
      const cappedPixelRatio = Math.max(
        0.4,
        Math.min(pixelRatio || 1, quality === 'full' ? 1.25 : 1, areaPixelRatio)
      );
      renderer.setPixelRatio(cappedPixelRatio);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.fov = width < 768 ? 68 : 60;
      camera.updateProjectionMatrix();
      world.position.y = width < 768 ? 0.8 : 0;
      render();
    },
    setPointer: (x, y) => {
      targetPointerX = Math.max(-0.5, Math.min(0.5, x));
      targetPointerY = Math.max(-0.5, Math.min(0.5, y));
    },
    dispose: () => {
      disposed = true;
      stop();
      const geometries = new Set<Three.BufferGeometry>();
      const materials = new Set<Three.Material>();
      scene.traverse((object) => {
        const drawable = object as Three.Object3D & {
          geometry?: Three.BufferGeometry;
          material?: Three.Material | Three.Material[];
        };
        if (drawable.geometry) geometries.add(drawable.geometry);
        if (drawable.material) {
          const objectMaterials = Array.isArray(drawable.material)
            ? drawable.material
            : [drawable.material];
          objectMaterials.forEach((material) => materials.add(material));
        }
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      renderer.dispose();
    },
  };
}
