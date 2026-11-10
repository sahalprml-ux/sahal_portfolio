// GLSL for the latent-space particle cloud (Scene3D.tsx).
// Every particle holds two positions (the shape it is leaving and the shape it is heading for)
// and the vertex shader blends between them, so the whole morph runs on the GPU.

export const cloudVertex = /* glsl */ `
attribute vec3 aFrom;
attribute vec3 aTo;
attribute float aSeed;

uniform float uMix;
uniform float uBurst;
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
uniform float uAlpha;
uniform float uAspect;
uniform float uPulse;
uniform vec2 uMouse;
uniform float uMouseOn;

varying vec3 vColor;
varying float vAlpha;

const vec3 C1 = vec3(1., .36, .4);
const vec3 C2 = vec3(.9, .09, .15);
const vec3 C3 = vec3(.55, .03, .07);

vec3 palette(float t) {
  return t < .5 ? mix(C1, C2, t * 2.) : mix(C2, C3, t * 2. - 1.);
}

void main() {
  // Particles leave at slightly different moments, so a morph ripples through the cloud.
  float delay = aSeed * .35;
  float m = smoothstep(delay, delay + .65, uMix);
  vec3 p = mix(aFrom, aTo, m);

  // Mid-morph the cloud loosens into a haze, then tightens into the next shape.
  float haze = sin(m * 3.14159) * uBurst;
  p += vec3(sin(aSeed * 91.7), cos(aSeed * 47.3), sin(aSeed * 13.1 + 1.)) * haze * .5;

  // Constant gentle drift.
  float t = uTime * .55 + aSeed * 6.2831;
  p += vec3(sin(t + p.y * 1.7), cos(t * .9 + p.z * 1.5), sin(t * 1.1 + p.x * 1.3)) * .03;

  // Click shockwave.
  p += normalize(p + 1e-4) * uPulse * (.25 + aSeed * .55);

  vec4 mv = modelViewMatrix * vec4(p, 1.);
  vec4 clip = projectionMatrix * mv;
  vec2 ndc = clip.xy / clip.w;

  // The pointer parts the cloud like a hand through smoke.
  vec2 d = (ndc - uMouse) * vec2(uAspect, 1.);
  float f = exp(-dot(d, d) * 16.) * uMouseOn;
  mv.xy += normalize(d + 1e-5) * f * .42;

  gl_Position = projectionMatrix * mv;
  float tw = .72 + .28 * sin(uTime * 2.1 + aSeed * 40.);
  // A few points render as large, soft bokeh orbs.
  float bokeh = step(.985, aSeed);
  gl_PointSize = uSize * uPixelRatio * (.5 + aSeed * .95) * tw * (1. + f * 1.4) * (1. + bokeh * 3.5) / -mv.z;

  float h = clamp(.5 + p.x * .16 + p.y * .12, 0., 1.);
  vColor = mix(palette(h), vec3(1., .82, .82), step(.94, aSeed) * (1. - bokeh) * .7 + f * .45);
  vAlpha = uAlpha * mix(.3, 1., smoothstep(12., 5., -mv.z)) * (.5 + .5 * tw) * (1. - bokeh * .45);
}
`;

export const cloudFragment = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - .5);
  float a = smoothstep(.5, 0., d);
  a *= a;
  if (a * vAlpha < .004) discard;
  gl_FragColor = vec4(vColor, a * vAlpha);
}
`;
