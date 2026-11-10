import { Fragment, useEffect, useRef, type CSSProperties } from 'react';
import { prefersReducedMotion } from '../lib/motion';

/**
 * A paragraph that "reads itself": words go from faint to full ink, in order, as the paragraph
 * scrolls up through the viewport. Plain text stays in the DOM, so screen readers get the sentence.
 */
export function ScrubText({ className = '', children }: { className?: string; children: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = children.trim().split(/\s+/);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    el.setAttribute('data-scrub', '');
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(Math.max((vh * 0.85 - r.top) / (r.height + vh * 0.3), 0), 1);
      el.style.setProperty('--p', p.toFixed(4));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      el.removeAttribute('data-scrub');
    };
  }, []);

  return (
    <p ref={ref} className={`scrub ${className}`.trim()} style={{ '--n': words.length } as CSSProperties}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="scrub-w" style={{ '--wi': i } as CSSProperties}>
            {w}
          </span>
          {i < words.length - 1 && ' '}
        </Fragment>
      ))}
    </p>
  );
}
