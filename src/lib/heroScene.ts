import {
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  LineSegments,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
  type Material,
  type Object3D,
} from 'three';
import {
  createAdaptivePixelRatioController,
  createHeroFrameClock,
  frameDamping,
  getHeroMaxPixelRatio,
  getHeroPixelRatio,
  HERO_TARGET_FPS,
} from './heroTiming';

export type HeroSceneQuality = 'full' | 'reduced';

export interface HeroSceneController {
  start: () => void;
  stop: () => void;
  resize: (width: number, height: number, pixelRatio: number) => void;
  setPointer: (x: number, y: number) => void;
  dispose: () => void;
}

type HeroProbeWindow = Window & {
  __heroFrameProbe?: { frames: number; renderMs?: number; maxRenderMs?: number };
};

function createTerrainGeometry(size: number, segments: number) {
  const geometry = new BufferGeometry();
  const vertices: number[] = [];
  const halfSize = size / 2;
  const step = size / segments;

  for (let line = 0; line <= segments; line += 1) {
    const offset = -halfSize + line * step;
    for (let segment = 0; segment < segments; segment += 1) {
      const start = -halfSize + segment * step;
      const end = start + step;
      vertices.push(start, 0, offset, end, 0, offset);
      vertices.push(offset, 0, start, offset, 0, end);
    }
  }

  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  return geometry;
}

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
  uniform float uViewportHeight;
  varying float vElevation;

  void main() {
    float glow = smoothstep(-0.45, 1.1, vElevation);
    float bottomFade = smoothstep(0.0, 0.18, gl_FragCoord.y / max(uViewportHeight, 1.0));
    vec3 lineColor = mix(vec3(0.24, 0.58, 0.95), vec3(0.42, 0.76, 1.0), glow);
    gl_FragColor = vec4(lineColor, (0.068 + glow * 0.15) * bottomFade);
  }
`;

export function createHeroScene(
  canvas: HTMLCanvasElement,
  quality: HeroSceneQuality
): HeroSceneController {
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance',
    precision: 'mediump',
  });
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();

  const camera = new PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.set(0, 2, 10);

  const world = new Group();
  scene.add(world);

  const segments = quality === 'full' ? 40 : 28;
  const terrainSize = 40;
  const cellSize = terrainSize / segments;
  const terrainGeometry = createTerrainGeometry(terrainSize, segments);

  const terrainUniforms = {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uViewportHeight: { value: 1 },
  };
  const terrainMaterial = new ShaderMaterial({
    uniforms: terrainUniforms,
    vertexShader: terrainVertexShader,
    fragmentShader: terrainFragmentShader,
    transparent: true,
    depthWrite: false,
  });
  const terrain = new LineSegments(terrainGeometry, terrainMaterial);
  terrain.position.set(0, -3.1, -10);
  world.add(terrain);

  let width = 1;
  let elapsed = 0;
  let animationFrame = 0;
  let disposed = false;
  let targetPointerX = 0;
  let targetPointerY = 0;
  let renderHeight = 1;
  let adaptiveResolution = createAdaptivePixelRatioController(1, 1);
  const frameClock = createHeroFrameClock(HERO_TARGET_FPS[quality]);

  const applyPixelRatio = (pixelRatio: number) => {
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, renderHeight, false);
    terrainUniforms.uViewportHeight.value = Math.max(1, Math.round(renderHeight * pixelRatio));
  };

  const render = (deltaSeconds = 0) => {
    const scroll = (elapsed * 1.8) % cellSize;
    terrain.position.z = -10 + scroll;
    terrainUniforms.uTime.value = elapsed % 2048;
    terrainUniforms.uScroll.value = scroll;

    const cameraDamping = frameDamping(1.4, deltaSeconds);
    camera.position.x += (targetPointerX * 2.2 - camera.position.x) * cameraDamping;
    camera.position.y += (2 - targetPointerY * 1.4 - camera.position.y) * cameraDamping;
    camera.lookAt(0, -0.35, -3.5);

    const probe = (window as HeroProbeWindow).__heroFrameProbe;
    const renderStartedAt = probe ? performance.now() : 0;
    renderer.render(scene, camera);
    if (probe) {
      const renderMs = performance.now() - renderStartedAt;
      probe.frames += 1;
      probe.renderMs = (probe.renderMs ?? 0) + renderMs;
      probe.maxRenderMs = Math.max(probe.maxRenderMs ?? 0, renderMs);
    }

    const nextPixelRatio = adaptiveResolution.recordFrame(deltaSeconds);
    if (nextPixelRatio !== null) applyPixelRatio(nextPixelRatio);
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
      renderHeight = Math.max(1, Math.round(nextHeight));
      const initialPixelRatio = getHeroPixelRatio(width, renderHeight, pixelRatio, quality);
      const maximumPixelRatio = getHeroMaxPixelRatio(
        width,
        renderHeight,
        pixelRatio,
        quality
      );
      adaptiveResolution = createAdaptivePixelRatioController(
        initialPixelRatio,
        maximumPixelRatio
      );
      applyPixelRatio(initialPixelRatio);
      camera.aspect = width / renderHeight;
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
      const geometries = new Set<BufferGeometry>();
      const materials = new Set<Material>();
      scene.traverse((object) => {
        const drawable = object as Object3D & {
          geometry?: BufferGeometry;
          material?: Material | Material[];
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
