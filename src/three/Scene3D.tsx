import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { prefersReducedMotion } from '../lib/motion';
import { cloudFragment, cloudVertex } from './shaders';

/**
 * Latent space: one cloud of particles behind the whole page that re-forms into a different
 * machine-learning structure for every section as you scroll:
 *
 *   Hero → latent sphere · About → neural layers · Experience → growth helix ·
 *   Projects → k-means clusters · Skills → loss landscape (with a gradient-descent path) ·
 *   Certificates / Exploring → orbit ring · Contact → embedding galaxy
 *
 * The pointer parts the cloud, clicking empty space sends a shockwave through it,
 * and a small readout names the structure on screen.
 */

const TAU = Math.PI * 2;
const INTERACTIVE = 'a, button, input, textarea, select, label, summary, [role="dialog"], [role="button"]';

type Rand = () => number;

function mulberry32(seed: number): Rand {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const gauss = (r: Rand) => Math.sqrt(-2 * Math.log(r() || 1e-6)) * Math.cos(TAU * r());

/** Rotates every point in place: first about X, then about Z. */
function tilt(a: Float32Array, rx: number, rz = 0) {
  const cx = Math.cos(rx);
  const sx = Math.sin(rx);
  const cz = Math.cos(rz);
  const sz = Math.sin(rz);
  for (let i = 0; i < a.length; i += 3) {
    const x = a[i];
    const y = a[i + 1] * cx - a[i + 2] * sx;
    const z = a[i + 1] * sx + a[i + 2] * cx;
    a[i] = x * cz - y * sz;
    a[i + 1] = x * sz + y * cz;
    a[i + 2] = z;
  }
  return a;
}

/* ---------- Shapes ---------- */

function sphere(n: number, r: Rand) {
  const a = new Float32Array(n * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    let x: number, y: number, z: number, rad: number;
    if (i % 9 === 0) {
      // A little volume inside the shell.
      const th = r() * TAU;
      const ph = Math.acos(2 * r() - 1);
      rad = 2.05 * Math.cbrt(r());
      x = Math.sin(ph) * Math.cos(th);
      y = Math.cos(ph);
      z = Math.sin(ph) * Math.sin(th);
    } else {
      y = 1 - (2 * (i + 0.5)) / n;
      const ring = Math.sqrt(1 - y * y);
      x = Math.cos(i * golden) * ring;
      z = Math.sin(i * golden) * ring;
      rad = 2.1 * (0.97 + r() * 0.06);
    }
    a.set([x * rad, y * rad, z * rad], i * 3);
  }
  return a;
}

function layers(n: number, r: Rand) {
  const a = new Float32Array(n * 3);
  const grids = [5, 8, 8, 8, 4];
  const nodes: number[][][] = grids.map((g, l) => {
    const x = (l - (grids.length - 1) / 2) * 1.2;
    const s = 3 / g;
    const out: number[][] = [];
    for (let i = 0; i < g; i++)
      for (let j = 0; j < g; j++) out.push([x, (i - (g - 1) / 2) * s, (j - (g - 1) / 2) * s]);
    return out;
  });
  for (let i = 0; i < n; i++) {
    if (r() < 0.42) {
      // Neuron: a tight knot of particles.
      const layer = nodes[Math.floor(r() * nodes.length)];
      const p = layer[Math.floor(r() * layer.length)];
      a.set([p[0] + gauss(r) * 0.035, p[1] + gauss(r) * 0.035, p[2] + gauss(r) * 0.035], i * 3);
    } else {
      // Weight: particles strung along a connection between neighbouring layers.
      const l = Math.floor(r() * (nodes.length - 1));
      const p = nodes[l][Math.floor(r() * nodes[l].length)];
      const q = nodes[l + 1][Math.floor(r() * nodes[l + 1].length)];
      const t = r();
      a.set([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t], i * 3);
    }
  }
  return tilt(a, 0.25, 0.08);
}

function helix(n: number, r: Rand) {
  const a = new Float32Array(n * 3);
  const turns = 2.4;
  const rungs = 34;
  for (let i = 0; i < n; i++) {
    const strandPoint = (t: number, s: number) => {
      const ang = t * turns * TAU + s * Math.PI;
      return [Math.cos(ang) * 1.05, -2.7 + t * 5.4, Math.sin(ang) * 1.05];
    };
    if (r() < 0.68) {
      const p = strandPoint(r(), r() < 0.5 ? 0 : 1);
      a.set([p[0] + gauss(r) * 0.05, p[1] + gauss(r) * 0.05, p[2] + gauss(r) * 0.05], i * 3);
    } else {
      const t = (Math.floor(r() * rungs) + 0.5) / rungs;
      const p = strandPoint(t, 0);
      const q = strandPoint(t, 1);
      const u = r();
      a.set([p[0] + (q[0] - p[0]) * u, p[1] + gauss(r) * 0.012, p[2] + (q[2] - p[2]) * u], i * 3);
    }
  }
  return tilt(a, 0.12, -0.32);
}

function clusters(n: number, r: Rand) {
  const a = new Float32Array(n * 3);
  const centres = Array.from({ length: 5 }, (_, k) => {
    const ang = (k / 5) * TAU + 0.4;
    return { c: [Math.cos(ang) * 1.85, Math.sin(k * 2.3) * 0.75, Math.sin(ang) * 1.85], s: 0.26 + (k % 3) * 0.09 };
  });
  for (let i = 0; i < n; i++) {
    if (r() < 0.9) {
      const { c, s } = centres[Math.floor(r() * centres.length)];
      a.set([c[0] + gauss(r) * s, c[1] + gauss(r) * s, c[2] + gauss(r) * s], i * 3);
    } else {
      a.set([(r() - 0.5) * 5.4, (r() - 0.5) * 3.2, (r() - 0.5) * 5.4], i * 3);
    }
  }
  return tilt(a, 0.32);
}

const loss = (x: number, z: number) =>
  0.34 * Math.sin(1.5 * x) * Math.cos(1.25 * z) +
  0.16 * Math.sin(2.6 * x + 1) * Math.sin(2.1 * z) -
  1.15 * Math.exp(-((x - 0.55) ** 2 + (z + 0.35) ** 2) / 0.85) +
  0.05 * (x * x + z * z);

function landscape(n: number, r: Rand) {
  const a = new Float32Array(n * 3);
  const pathCount = Math.floor(n * 0.07);
  const side = Math.floor(Math.sqrt(n - pathCount));
  let i = 0;
  for (let gx = 0; gx < side; gx++) {
    for (let gz = 0; gz < side; gz++) {
      const x = (gx / (side - 1) - 0.5) * 6 + (r() - 0.5) * 0.02;
      const z = (gz / (side - 1) - 0.5) * 6 + (r() - 0.5) * 0.02;
      a.set([x, loss(x, z), z], i++ * 3);
    }
  }
  // Gradient descent: a bright path rolling downhill into the minimum.
  let x = -2.5;
  let z = 2.3;
  const path: number[][] = [];
  for (let s = 0; s < 220; s++) {
    path.push([x, loss(x, z) + 0.06, z]);
    const e = 0.01;
    const gx = (loss(x + e, z) - loss(x - e, z)) / (2 * e);
    const gz = (loss(x, z + e) - loss(x, z - e)) / (2 * e);
    x -= gx * 0.05 + 0.006;
    z -= gz * 0.05 + 0.008;
  }
  for (; i < n; i++) {
    const p = path[Math.floor(r() * path.length)];
    a.set([p[0] + gauss(r) * 0.03, p[1] + gauss(r) * 0.03, p[2] + gauss(r) * 0.03], i * 3);
  }
  for (let k = 0; k < a.length; k += 3) a[k + 1] -= 0.1;
  return tilt(a, 0.5);
}

function ring(n: number, r: Rand) {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const u = r() * TAU;
    if (r() < 0.8) {
      const v = r() * TAU;
      const R = 2.05 + Math.cos(v) * 0.26;
      a.set([Math.cos(u) * R, Math.sin(v) * 0.26, Math.sin(u) * R], i * 3);
    } else {
      // Orbiting dust in a thin outer band.
      const R = 2.55 + r() * 0.65;
      a.set([Math.cos(u) * R, gauss(r) * 0.04, Math.sin(u) * R], i * 3);
    }
  }
  return tilt(a, 1.12, 0.22);
}

function galaxy(n: number, r: Rand) {
  const a = new Float32Array(n * 3);
  const arms = 3;
  for (let i = 0; i < n; i++) {
    if (r() < 0.14) {
      a.set([gauss(r) * 0.32, gauss(r) * 0.2, gauss(r) * 0.32], i * 3);
      continue;
    }
    const rad = Math.pow(r(), 0.65) * 3;
    const arm = Math.floor(r() * arms);
    const spread = (0.32 / (rad + 0.35)) * gauss(r);
    const ang = (arm / arms) * TAU + rad * 1.9 + spread;
    a.set([Math.cos(ang) * rad, gauss(r) * 0.1 * (1.2 - rad / 3), Math.sin(ang) * rad], i * 3);
  }
  return tilt(a, 0.95, 0.1);
}

const SHAPES = [
  { name: 'Latent sphere', build: sphere },
  { name: 'Neural layers', build: layers },
  { name: 'Growth helix', build: helix },
  { name: 'k-means clusters', build: clusters },
  { name: 'Loss landscape', build: landscape },
  { name: 'Orbit ring', build: ring },
  { name: 'Embedding galaxy', build: galaxy },
];

/** Section → shape, plus where the cloud sits and how bright it is there. */
const STOPS = [
  { sel: '.hero', shape: 0, x: 0.48, y: 0.02, scale: 0.92, alpha: 1 },
  { sel: '#about', shape: 1, x: 0.18, y: 0, scale: 1, alpha: 0.42 },
  { sel: '#experience', shape: 2, x: 0, y: 0.05, scale: 0.95, alpha: 0.5 },
  { sel: '#projects', shape: 3, x: -0.02, y: 0, scale: 1.05, alpha: 0.4 },
  { sel: '#skills', shape: 4, x: 0, y: -0.05, scale: 1.12, alpha: 0.55 },
  { sel: '#certificates', shape: 5, x: 0, y: 0, scale: 1, alpha: 0.5 },
  { sel: '#exploring', shape: 5, x: 0, y: 0, scale: 1.15, alpha: 0.45 },
  { sel: '#contact', shape: 6, x: 0, y: 0, scale: 1.1, alpha: 0.75 },
];

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const smooth = (v: number) => v * v * (3 - 2 * v);

export default function Scene3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const indexRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
    } catch {
      return;
    }
    renderer.setClearColor(0x000000, 0);

    const reduced = prefersReducedMotion();
    const small = window.matchMedia('(max-width: 879px)').matches;
    const N = small ? 6500 : 13000;

    const shapes = SHAPES.map((s, k) => s.build(N, mulberry32(11 + k * 7)));
    const seed = new Float32Array(N);
    const rs = mulberry32(3);
    for (let i = 0; i < N; i++) seed[i] = rs();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
    camera.position.set(0, 0, 8);
    const group = new THREE.Group();
    scene.add(group);

    const fromArr = new Float32Array(shapes[0]);
    const toArr = new Float32Array(shapes[0]);
    const geo = new THREE.BufferGeometry();
    const fromAttr = new THREE.BufferAttribute(fromArr, 3);
    const toAttr = new THREE.BufferAttribute(toArr, 3);
    geo.setAttribute('position', toAttr);
    geo.setAttribute('aFrom', fromAttr);
    geo.setAttribute('aTo', toAttr);
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));

    const uniforms = {
      uMix: { value: 1 },
      uBurst: { value: reduced ? 0 : 1 },
      uTime: { value: 0 },
      uSize: { value: small ? 62 : 70 },
      uPixelRatio: { value: 1 },
      uAlpha: { value: 0 },
      uAspect: { value: 1 },
      uPulse: { value: 0 },
      uMouse: { value: new THREE.Vector2(9, 9) },
      uMouseOn: { value: 0 },
    };
    const mat = new THREE.ShaderMaterial({
      vertexShader: cloudVertex,
      fragmentShader: cloudFragment,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const cloud = new THREE.Points(geo, mat);
    cloud.frustumCulled = false;
    group.add(cloud);

    // ---- Sizing ----
    let halfW = 1;
    let halfH = 1;
    let dirty = true;
    const resize = () => {
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      halfW = halfH * camera.aspect;
      uniforms.uPixelRatio.value = dpr;
      uniforms.uAspect.value = camera.aspect;
      dirty = true;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    // ---- Input ----
    const pointer = { x: 0, y: 0, nx: 0, ny: 0, on: 0, non: 0 };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      pointer.nx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ny = -(e.clientY / window.innerHeight) * 2 + 1;
      pointer.non = 1;
    };
    const onLeave = () => (pointer.non = 0);
    const onDown = (e: PointerEvent) => {
      if (reduced || (e.target as Element | null)?.closest?.(INTERACTIVE)) return;
      uniforms.uPulse.value = 1;
    };
    const onScroll = () => (dirty = true);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    // ---- Loop ----
    const stops = STOPS.map((s) => ({ ...s, el: document.querySelector<HTMLElement>(s.sel) }));
    const view = { mix: 1, x: 0, y: 0, scale: 1, alpha: 0, rotY: 0 };
    let pair = '0-0';
    let label = -1;
    let raf = 0;
    let prev = performance.now();
    const start = prev;
    let first = true;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;
      const dt = Math.min(Math.max((now - prev) / 1000, 0), 0.05);
      prev = now;
      const time = (now - start) / 1000;
      const vh = window.innerHeight;

      // Which two sections are we between, and how far through the change?
      let idx = 0;
      let target = 1;
      for (let i = 1; i < stops.length; i++) {
        const el = stops[i].el;
        if (!el) continue;
        const m = clamp01((vh * 0.85 - el.getBoundingClientRect().top) / (vh * 0.6));
        if (m > 0) {
          idx = i;
          target = m;
        }
      }
      const a = stops[Math.max(idx - 1, 0)];
      const b = stops[idx];
      const key = `${a.shape}-${b.shape}`;
      if (key !== pair) {
        // Hand over: the shape we were heading for becomes the one we leave from.
        pair = key;
        fromArr.set(shapes[a.shape]);
        toArr.set(shapes[b.shape]);
        fromAttr.needsUpdate = true;
        toAttr.needsUpdate = true;
        view.mix = target;
      }
      const k = 1 - Math.exp(-dt * 4);
      view.mix = reduced || first ? target : view.mix + (target - view.mix) * k;

      // Placement eases between the two sections' stops.
      const s = smooth(clamp01(view.mix));
      const narrow = camera.aspect < 0.95;
      const fit = Math.min(1, halfW / (narrow ? 2.45 : 3.6));
      const tx = narrow ? 0 : (a.x + (b.x - a.x) * s) * halfW;
      const ty = (a.y + (b.y - a.y) * s) * halfH;
      const tScale = (a.scale + (b.scale - a.scale) * s) * fit;
      const tAlpha = (a.alpha + (b.alpha - a.alpha) * s) * (narrow && idx > 0 ? 0.6 : 1);
      const tRotY = reduced ? 0.5 : time * 0.07 + (window.scrollY / vh) * 0.18;

      if (reduced || first) Object.assign(view, { x: tx, y: ty, scale: tScale, rotY: tRotY });
      if (reduced) view.alpha = tAlpha;
      first = false;
      const kp = 1 - Math.exp(-dt * 3);
      view.x += (tx - view.x) * kp;
      view.y += (ty - view.y) * kp;
      view.scale += (tScale - view.scale) * kp;
      view.rotY += (tRotY - view.rotY) * kp;
      view.alpha += (tAlpha - view.alpha) * (1 - Math.exp(-dt * 1.6));

      if (!reduced) {
        const kq = 1 - Math.exp(-dt * 4);
        pointer.x += (pointer.nx - pointer.x) * kq;
        pointer.y += (pointer.ny - pointer.y) * kq;
        pointer.on += (pointer.non - pointer.on) * kq;
      }

      group.position.set(view.x, view.y, 0);
      group.scale.setScalar(view.scale);
      group.rotation.set(-pointer.y * 0.12, view.rotY + pointer.x * 0.25, 0);

      uniforms.uMix.value = view.mix;
      uniforms.uTime.value = reduced ? 0 : time;
      uniforms.uAlpha.value = view.alpha;
      uniforms.uMouse.value.set(pointer.nx, pointer.ny);
      uniforms.uMouseOn.value = reduced ? 0 : pointer.on;
      uniforms.uPulse.value *= Math.exp(-dt * 3.2);

      // Readout names the structure currently on screen.
      const showing = view.mix > 0.5 ? b.shape : a.shape;
      if (showing !== label) {
        label = showing;
        if (indexRef.current) indexRef.current.textContent = String(showing + 1).padStart(2, '0');
        if (nameRef.current) nameRef.current.textContent = SHAPES[showing].name;
      }

      if (reduced && !dirty) return;
      dirty = false;
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('scroll', onScroll);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="scene3d" aria-hidden="true" />
      <div className="scene-hud" aria-hidden="true">
        <span className="scene-hud-title">Latent space</span>
        <span className="scene-hud-shape">
          <b ref={indexRef}>01</b>
          <span ref={nameRef}>{SHAPES[0].name}</span>
        </span>
      </div>
    </>
  );
}
