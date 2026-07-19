import { afterEach, describe, expect, it, vi } from 'vitest';
import { hasHardwareAcceleratedWebGL } from './webglCapability';

const originalGetContext = HTMLCanvasElement.prototype.getContext;

function stubWebGL(renderer: string | null) {
  const getParameter = vi.fn(() => renderer);
  const getExtension = vi.fn((name: string) =>
    name === 'WEBGL_debug_renderer_info' ? { UNMASKED_RENDERER_WEBGL: 0x9246 } : null
  );
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    getExtension,
    getParameter,
  })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
}

afterEach(() => {
  HTMLCanvasElement.prototype.getContext = originalGetContext;
});

describe('hasHardwareAcceleratedWebGL', () => {
  it('returns false when WebGL is unavailable', () => {
    HTMLCanvasElement.prototype.getContext = vi.fn(
      () => null
    ) as unknown as typeof HTMLCanvasElement.prototype.getContext;

    expect(hasHardwareAcceleratedWebGL()).toBe(false);
  });

  it('returns false for software rasterizers', () => {
    stubWebGL('ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)), SwiftShader driver)');
    expect(hasHardwareAcceleratedWebGL()).toBe(false);

    stubWebGL('llvmpipe (LLVM 15.0.6, 256 bits)');
    expect(hasHardwareAcceleratedWebGL()).toBe(false);
  });

  it('returns true for hardware renderers', () => {
    stubWebGL('ANGLE (NVIDIA, NVIDIA GeForce RTX 3080, OpenGL 4.5)');
    expect(hasHardwareAcceleratedWebGL()).toBe(true);
  });

  it('assumes hardware when the renderer string is unavailable', () => {
    stubWebGL(null);
    expect(hasHardwareAcceleratedWebGL()).toBe(true);
  });
});
