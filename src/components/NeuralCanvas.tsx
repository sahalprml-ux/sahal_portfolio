import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../lib/motion';

interface Node {
  li: number;
  bx: number;
  by: number;
  x: number;
  y: number;
  ph: number;
  r: number;
  act: number;
  inf: number;
}
interface Edge {
  a: Node;
  b: Node;
}
interface Pulse {
  e: Edge;
  t: number;
  s: number;
}
interface Dust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}
interface Ripple {
  x: number;
  y: number;
  t0: number;
}

/**
 * Layered "neural network" that fires signal pulses left to right.
 * Nodes near the pointer light up and fire; a click anywhere in the hero sends a ripple through it.
 */
export function NeuralCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduced = prefersReducedMotion();
    let W = 0;
    let H = 0;
    let nodes: Node[] = [];
    let edges: Edge[] = [];
    let out = new Map<Node, Edge[]>();
    let pulses: Pulse[] = [];
    let dust: Dust[] = [];
    let ripples: Ripple[] = [];
    let mx = -999;
    let my = -999;
    let last = 0;
    let visible = true;
    let raf = 0;
    const timers = new Set<number>();

    const build = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const mobile = W < 880;
      const layers = mobile ? [3, 5, 6, 5, 3] : [4, 7, 9, 9, 7, 3];
      const x0 = mobile ? 0.08 : 0.5;
      const x1 = mobile ? 0.92 : 0.95;
      const y0 = mobile ? 0.6 : 0.14;
      const y1 = mobile ? 0.94 : 0.84;

      nodes = [];
      edges = [];
      out = new Map();
      pulses = [];
      layers.forEach((n, li) => {
        const x = W * (x0 + ((x1 - x0) * li) / (layers.length - 1));
        for (let i = 0; i < n; i++) {
          const y = H * (y0 + ((y1 - y0) * (i + 0.5)) / n);
          nodes.push({
            li,
            bx: x + (Math.random() - 0.5) * 24,
            by: y + (Math.random() - 0.5) * 16,
            x,
            y,
            ph: Math.random() * 6.28,
            r: 1.3 + Math.random() * 1.5,
            act: 0,
            inf: 0,
          });
        }
      });
      for (let li = 0; li < layers.length - 1; li++) {
        const from = nodes.filter((n) => n.li === li);
        const to = nodes.filter((n) => n.li === li + 1);
        from.forEach((p) => {
          const o: Edge[] = [];
          to.forEach((q) => {
            if (Math.random() < 0.45) {
              const e = { a: p, b: q };
              edges.push(e);
              o.push(e);
            }
          });
          if (!o.length) {
            const e = { a: p, b: to[Math.floor(Math.random() * to.length)] };
            edges.push(e);
            o.push(e);
          }
          out.set(p, o);
        });
      }
      dust = Array.from({ length: mobile ? 28 : 70 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: Math.random() + 0.2,
      }));
    };

    const spawn = (from: Node) => {
      const o = out.get(from);
      if (!o) return;
      pulses.push({ e: o[Math.floor(Math.random() * o.length)], t: 0, s: 0.012 + Math.random() * 0.012 });
    };

    const draw = (t: number, still: boolean) => {
      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = 'rgba(242,239,232,.16)';
      for (const d of dust) {
        if (!still) {
          d.x += d.vx;
          d.y += d.vy;
          if (d.x < 0) d.x = W;
          if (d.x > W) d.x = 0;
          if (d.y < 0) d.y = H;
          if (d.y > H) d.y = 0;
        }
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, 6.28);
        ctx.fill();
      }

      for (const n of nodes) {
        n.x = n.bx + Math.sin(t * 0.0005 + n.ph) * 5;
        n.y = n.by + Math.cos(t * 0.0004 + n.ph) * 4;
        n.inf = Math.max(0, 1 - Math.hypot(n.x - mx, n.y - my) / 170);
      }

      ctx.lineWidth = 0.6;
      for (const e of edges) {
        const k = Math.max(e.a.inf, e.b.inf);
        ctx.strokeStyle = `rgba(242,239,232,${0.05 + k * 0.25})`;
        ctx.beginPath();
        ctx.moveTo(e.a.x, e.a.y);
        ctx.lineTo(e.b.x, e.b.y);
        ctx.stroke();
      }

      if (!still) {
        if (t - last > 140) {
          last = t;
          const firsts = nodes.filter((n) => n.li === 0);
          if (firsts.length) spawn(firsts[Math.floor(Math.random() * firsts.length)]);
        }
        nodes.forEach((n) => {
          if (n.inf > 0.6 && Math.random() < 0.02) spawn(n);
        });
      }

      ctx.shadowColor = '#e5202e';
      ctx.shadowBlur = 10;
      pulses = pulses.filter((p) => {
        if (!still) p.t += p.s;
        if (p.t >= 1) {
          p.e.b.act = 1;
          if (Math.random() < 0.7) spawn(p.e.b);
          return false;
        }
        const { a, b } = p.e;
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        const tt = Math.max(0, p.t - 0.18);
        const tx = a.x + (b.x - a.x) * tt;
        const ty = a.y + (b.y - a.y) * tt;
        const g = ctx.createLinearGradient(tx, ty, x, y);
        g.addColorStop(0, 'rgba(229, 32, 46,0)');
        g.addColorStop(1, 'rgba(229, 32, 46,.9)');
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.fillStyle = '#e5202e';
        ctx.beginPath();
        ctx.arc(x, y, 1.6, 0, 6.28);
        ctx.fill();
        return true;
      });
      ctx.shadowBlur = 0;

      const now = performance.now();
      ripples = ripples.filter((rp) => {
        const k = (now - rp.t0) / 1400;
        if (k >= 1) return false;
        for (let j = 0; j < 2; j++) {
          const kk = Math.max(0, k - j * 0.12);
          ctx.strokeStyle = `rgba(229, 32, 46,${(1 - kk) * (j ? 0.25 : 0.55)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(rp.x, rp.y, 6 + kk * 300, 0, 6.28);
          ctx.stroke();
        }
        return true;
      });

      for (const n of nodes) {
        const a = Math.max(n.act, n.inf);
        if (a > 0.02) {
          ctx.strokeStyle = `rgba(229, 32, 46,${a * 0.55})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + 3 + (1 - n.act) * 6, 0, 6.28);
          ctx.stroke();
        }
        ctx.fillStyle = `rgba(242,239,232,${0.3 + a * 0.6})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + a, 0, 6.28);
        ctx.fill();
        if (!still) n.act *= 0.955;
      }
    };

    const loop = (t: number) => {
      if (visible) draw(t, false);
      raf = requestAnimationFrame(loop);
    };

    build();
    if (reduced) draw(0, true);
    else raf = requestAnimationFrame(loop);

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    };
    const onClick = (e: MouseEvent) => {
      if (reduced) return;
      if (e.target instanceof Element && e.target.closest('a,button,input,textarea,[role=dialog]')) return;
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > W || y > H) return;
      ripples.push({ x, y, t0: performance.now() });
      nodes.forEach((n) => {
        const d = Math.hypot(n.x - x, n.y - y);
        if (d < 260) {
          const id = window.setTimeout(() => {
            timers.delete(id);
            n.act = 1;
            spawn(n);
            spawn(n);
          }, d * 2.2);
          timers.add(id);
        }
      });
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('click', onClick);

    const vis = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    vis.observe(canvas);

    let lw = W;
    let lh = H;
    const ro = new ResizeObserver(() => {
      const r = canvas.getBoundingClientRect();
      if (Math.abs(r.width - lw) > 1 || Math.abs(r.height - lh) > 1) {
        lw = r.width;
        lh = r.height;
        build();
        if (reduced) draw(0, true);
      }
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('click', onClick);
      vis.disconnect();
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="hero-canvas" aria-hidden="true" />;
}
