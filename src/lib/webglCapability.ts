const SOFTWARE_RENDERER_PATTERN = /swiftshader|llvmpipe|softpipe|software|basic render/i;

/**
 * Detects hardware-accelerated WebGL. Software rasterizers (SwiftShader,
 * llvmpipe, Basic Render Driver) turn the animated hero into main-thread
 * jank, so those environments keep the static poster instead.
 * Unknown renderer strings assume hardware to preserve the full experience.
 */
export function hasHardwareAcceleratedWebGL(): boolean {
  try {
    const probe = document.createElement('canvas');
    const gl =
      (probe.getContext('webgl2') as WebGLRenderingContext | null) ??
      (probe.getContext('webgl') as WebGLRenderingContext | null);
    if (!gl) return false;

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo
      ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
      : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();

    if (!renderer) return true;
    return !SOFTWARE_RENDERER_PATTERN.test(renderer);
  } catch {
    return false;
  }
}
