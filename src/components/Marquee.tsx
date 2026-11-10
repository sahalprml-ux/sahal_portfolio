import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../lib/motion';

const ITEMS = [
  'Machine Learning',
  'Generative AI',
  'Retrieval-Augmented Generation',
  'Computer Vision',
  'Voice AI',
  'AI Agents',
  'Data Science',
  'LLM Applications',
];

/**
 * An endless band of focus areas that reacts to scrolling: it drifts on its own, speeds up with
 * scroll velocity, follows the scroll direction, and leans into fast scrolls.
 * Purely decorative: the same areas are listed in Skills.
 */
export function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || prefersReducedMotion()) return;
    track.setAttribute('data-js', '');
    let x = 0;
    let dir = -1;
    let vel = 0;
    let lastY = window.scrollY;
    let prev = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(Math.max((now - prev) / 1000, 0), 0.05);
      prev = now;
      const y = window.scrollY;
      const v = dt > 0 ? (y - lastY) / dt : 0;
      lastY = y;
      vel += (v - vel) * 0.1;
      if (Math.abs(vel) > 40) dir = vel > 0 ? -1 : 1;
      const half = track.scrollWidth / 2;
      x += dir * (60 + Math.min(Math.abs(vel) * 0.6, 1400)) * dt;
      if (half > 0) x = ((x % half) - half) % half;
      const skew = Math.max(-8, Math.min(8, -vel * 0.004));
      track.style.transform = `translate3d(${x.toFixed(1)}px,0,0) skewX(${skew.toFixed(2)}deg)`;
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      track.removeAttribute('data-js');
      track.style.transform = '';
    };
  }, []);

  const row = (copy: number) => (
    <ul className="marquee-row" key={copy}>
      {ITEMS.map((item, i) => (
        <li key={item} className={i % 2 ? 'marquee-item is-serif' : 'marquee-item'}>
          {item}
          <span className="marquee-star">✦</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="marquee" aria-hidden="true">
      <div ref={trackRef} className="marquee-track">
        {[0, 1].map(row)}
      </div>
    </div>
  );
}
