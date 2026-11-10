let cached: boolean | undefined;

/** True when the browser can create a WebGL context (the 3D scene needs one). */
export function webglAvailable() {
  if (cached !== undefined) return cached;
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    cached = !!gl;
    (gl as WebGLRenderingContext | null)?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    cached = false;
  }
  return cached;
}
