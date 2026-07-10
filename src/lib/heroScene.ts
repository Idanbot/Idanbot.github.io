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
    gl_FragColor = vec4(0.30, 0.66, 1.0, 0.052 + glow * 0.095);
  }
`;

const nodeVertexShader = `
  uniform float uTime;
  uniform float uScroll;
  uniform float uPixelRatio;
  varying float vStrength;

  float terrainHeight(vec2 point) {
    float swellA = sin(point.x * 0.20 + point.y * 0.30 + uTime * 1.05) * 0.62;
    float swellB = sin(point.x * -0.31 + point.y * 0.22 + uTime * 1.28) * 0.42;
    float signal = sin(point.x * 0.82 + point.y * 1.06 + uTime * 2.10) * 0.12;
    float roll = sin(point.x * 0.10 - point.y * 0.11 + uTime * 0.44) * 0.34;
    return swellA + swellB + signal + roll;
  }

  void main() {
    vec3 transformed = position;
    transformed.y = terrainHeight(vec2(position.x, position.z + uScroll)) + 0.025;
    vStrength = smoothstep(-0.5, 1.3, transformed.y);
    vec4 modelPosition = modelViewMatrix * vec4(transformed, 1.0);
    gl_PointSize = (1.2 + vStrength * 1.7) * uPixelRatio;
    gl_Position = projectionMatrix * modelPosition;
  }
`;

const pointFragmentShader = `
  varying float vStrength;

  void main() {
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    if (distanceToCenter > 0.5) discard;
    gl_FragColor = vec4(0.42, 0.78, 1.0, 0.18 + vStrength * 0.48);
  }
`;

const packetVertexShader = `
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vOpacity;

  void main() {
    vec3 transformed = position;
    transformed.z = mod(position.z + uTime * (1.4 + position.y * 0.12) + 48.0, 48.0) - 38.0;
    transformed.y += sin(uTime * 0.8 + position.x) * 0.08;
    vOpacity = smoothstep(-38.0, -24.0, transformed.z) * (1.0 - smoothstep(-3.0, 4.0, transformed.z));
    vec4 modelPosition = modelViewMatrix * vec4(transformed, 1.0);
    gl_PointSize = 2.4 * uPixelRatio;
    gl_Position = projectionMatrix * modelPosition;
  }
`;

const packetFragmentShader = `
  varying float vOpacity;

  void main() {
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    if (distanceToCenter > 0.5) discard;
    gl_FragColor = vec4(0.38, 0.82, 1.0, vOpacity * 0.72);
  }
`;

function createSeededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function createHeroScene(
  THREE: typeof import('three'),
  canvas: HTMLCanvasElement,
  quality: HeroSceneQuality
): HeroSceneController {
  const random = createSeededRandom(0x1da0b07);
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

  const segments = quality === 'full' ? 58 : 32;
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

  const nodeUniforms = {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uPixelRatio: { value: 1 },
  };
  const nodeMaterial = new THREE.ShaderMaterial({
    uniforms: nodeUniforms,
    vertexShader: nodeVertexShader,
    fragmentShader: pointFragmentShader,
    transparent: true,
    depthWrite: false,
  });
  const terrainNodes = new THREE.Points(terrainGeometry, nodeMaterial);
  terrainNodes.position.copy(terrain.position);
  world.add(terrainNodes);

  const packetCount = quality === 'full' ? 56 : 28;
  const packetPositions = new Float32Array(packetCount * 3);
  for (let index = 0; index < packetCount; index += 1) {
    packetPositions[index * 3] = (random() - 0.5) * 34;
    packetPositions[index * 3 + 1] = -1.5 + random() * 5;
    packetPositions[index * 3 + 2] = -38 + random() * 42;
  }
  const packetGeometry = new THREE.BufferGeometry();
  packetGeometry.setAttribute('position', new THREE.BufferAttribute(packetPositions, 3));
  const packetUniforms = {
    uTime: { value: 0 },
    uPixelRatio: { value: 1 },
  };
  const packetMaterial = new THREE.ShaderMaterial({
    uniforms: packetUniforms,
    vertexShader: packetVertexShader,
    fragmentShader: packetFragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  world.add(new THREE.Points(packetGeometry, packetMaterial));

  const monolithGeometry = new THREE.BoxGeometry(1.2, 9, 1.2);
  const monolithPosition = monolithGeometry.attributes.position;
  const monolithColors: number[] = [];
  const monolithBottom = new THREE.Color(0x020308);
  const monolithTop = new THREE.Color(0x10233d);
  for (let index = 0; index < monolithPosition.count; index += 1) {
    const amount = Math.max(0, Math.min(1, (monolithPosition.getY(index) + 4.5) / 9));
    const color = monolithBottom.clone().lerp(monolithTop, amount);
    monolithColors.push(color.r, color.g, color.b);
  }
  monolithGeometry.setAttribute(
    'color',
    new THREE.Float32BufferAttribute(monolithColors, 3)
  );

  const monolithMaterial = new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.72,
  });
  const edgeGeometry = new THREE.EdgesGeometry(monolithGeometry);
  const edgeMaterial = new THREE.LineBasicMaterial({
    color: 0x56b7f5,
    transparent: true,
    opacity: 0.4,
  });
  const monoliths: { mesh: Three.Mesh; targetY: number; speed: number }[] = [];
  const monolithGroup = new THREE.Group();
  const monolithCount = quality === 'full' ? 8 : 5;

  for (let index = 0; index < monolithCount; index += 1) {
    const mesh = new THREE.Mesh(monolithGeometry, monolithMaterial);
    mesh.add(new THREE.LineSegments(edgeGeometry, edgeMaterial));
    const targetY = (random() - 0.5) * 3.5;
    const scale = 0.55 + random() * 0.72;
    mesh.scale.set(0.72 + random() * 0.45, scale, 0.72 + random() * 0.45);
    mesh.position.set((random() - 0.5) * 34, targetY, -8 - random() * 31);
    mesh.rotation.y = (random() - 0.5) * 0.16;
    monolithGroup.add(mesh);
    monoliths.push({ mesh, targetY, speed: 0.9 + random() * 0.55 });
  }
  world.add(monolithGroup);

  let width = 1;
  let elapsed = 0;
  let animationFrame = 0;
  let disposed = false;
  let targetPointerX = 0;
  let targetPointerY = 0;
  const frameClock = createHeroFrameClock(HERO_TARGET_FPS[quality]);

  const render = (deltaSeconds = 0) => {
    const scroll = (elapsed * 1.8) % cellSize;
    terrain.position.z = -10 + scroll;
    terrainNodes.position.z = terrain.position.z;
    terrainUniforms.uTime.value = elapsed;
    terrainUniforms.uScroll.value = scroll;
    nodeUniforms.uTime.value = elapsed;
    nodeUniforms.uScroll.value = scroll;
    packetUniforms.uTime.value = elapsed;

    const cameraDamping = frameDamping(1.4, deltaSeconds);
    camera.position.x += (targetPointerX * 2.2 - camera.position.x) * cameraDamping;
    camera.position.y += (2 - targetPointerY * 1.4 - camera.position.y) * cameraDamping;
    camera.lookAt(0, -0.35, -3.5);

    const pulse = Math.sin(elapsed * 1.5) * 0.5 + 0.5;
    edgeMaterial.opacity = 0.28 + pulse * 0.26;
    const riseDamping = frameDamping(2.5, deltaSeconds);
    for (const monolith of monoliths) {
      monolith.mesh.position.z += monolith.speed * 1.35 * deltaSeconds;
      if (monolith.mesh.position.y < monolith.targetY) {
        monolith.mesh.position.y +=
          (monolith.targetY - monolith.mesh.position.y) * riseDamping;
      }
      if (monolith.mesh.position.z > 6) {
        monolith.mesh.position.z = -34 - random() * 8;
        monolith.mesh.position.x = (random() - 0.5) * 34;
        monolith.targetY = (random() - 0.5) * 3.5;
        monolith.mesh.position.y = monolith.targetY - 10;
      }
    }

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
      const cappedPixelRatio = Math.min(pixelRatio || 1, quality === 'full' ? 1.25 : 1);
      renderer.setPixelRatio(cappedPixelRatio);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.fov = width < 768 ? 68 : 60;
      camera.updateProjectionMatrix();
      world.position.y = width < 768 ? 0.8 : 0;
      nodeUniforms.uPixelRatio.value = cappedPixelRatio;
      packetUniforms.uPixelRatio.value = cappedPixelRatio;
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
