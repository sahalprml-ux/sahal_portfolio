import { useEffect, useRef } from 'react';
import { mailto, site } from '../data/site';
import { prefersReducedMotion } from '../lib/motion';

export function Footer() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);

  // A light passes over the wordmark: it follows the pointer, and drifts on its own when idle.
  useEffect(() => {
    const wrap = wrapRef.current;
    const light = lightRef.current;
    if (!wrap || !light) return;
    let lastMove = 0;
    let inView = false;
    let raf = 0;
    const set = (x: number, y: number) => {
      light.style.setProperty('--fx', `${x}px`);
      light.style.setProperty('--fy', `${y}px`);
    };
    const move = (e: MouseEvent) => {
      const r = light.getBoundingClientRect();
      lastMove = performance.now();
      set(e.clientX - r.left, e.clientY - r.top);
    };
    const idle = (t: number) => {
      if (inView && t - lastMove > 1800 && !prefersReducedMotion()) {
        const r = light.getBoundingClientRect();
        set(r.width * (0.5 + 0.42 * Math.sin(t * 0.00035)), r.height * (0.5 + 0.35 * Math.sin(t * 0.0009)));
      }
      raf = requestAnimationFrame(idle);
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
    });
    io.observe(wrap);
    wrap.addEventListener('mousemove', move);
    raf = requestAnimationFrame(idle);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      wrap.removeEventListener('mousemove', move);
    };
  }, []);

  // The giant wordmark sets the name on two lines.
  const [first, ...rest] = site.name.split(' ');
  const stacked = (
    <>
      {first}
      <br />
      {rest.join(' ')}
    </>
  );

  return (
    <div className="footer-zone">
      <footer className="site-footer">
        <div className="footer-id">
          <span className="footer-name">{site.name}</span>
          <span className="footer-tagline">{site.tagline}</span>
        </div>
        <div className="footer-right">
          <nav className="footer-links" aria-label="Social">
            <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            <a href={site.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href={mailto}>Email</a>
          </nav>
          <div className="footer-bottom">
            <span className="footer-copy">
              © {new Date().getFullYear()} {site.name}. All rights reserved.
            </span>
            <a href="#top" className="back-top">
              Back to top
              <span className="back-top-arrow" aria-hidden="true">
                ↑
              </span>
            </a>
          </div>
        </div>
      </footer>
      <div ref={wrapRef} className="wordmark" aria-hidden="true">
        <div className="wordmark-text wordmark-base">{stacked}</div>
        <div ref={lightRef} className="wordmark-text wordmark-light">
          {stacked}
        </div>
      </div>
    </div>
  );
}
