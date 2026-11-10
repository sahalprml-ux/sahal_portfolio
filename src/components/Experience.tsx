import { useEffect, useRef } from 'react';
import { journey } from '../data/content';
import { pad, prefersReducedMotion } from '../lib/motion';
import { ArrowUpRight } from './Icons';
import { SectionHead } from './SectionHead';

/**
 * The journey as a horizontal timeline. On large screens the section pins and vertical scrolling
 * drives the track sideways; each milestone lights up as it reaches the playhead. On phones (and
 * under reduced motion) it is a plain vertical list.
 */
export function Experience() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || prefersReducedMotion()) return;
    const items = Array.from(track.querySelectorAll<HTMLElement>('.xp-card'));
    let pinned = false;
    let distance = 0;

    const layout = () => {
      pinned = window.innerWidth >= 880 && window.innerHeight >= 560;
      section.toggleAttribute('data-pin', pinned);
      track.style.transform = '';
      if (!pinned) {
        section.style.removeProperty('--xp-h');
        return;
      }
      distance = Math.max(0, track.scrollWidth - track.clientWidth);
      section.style.setProperty('--xp-h', `${distance + window.innerHeight}px`);
    };

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      if (pinned) {
        const r = section.getBoundingClientRect();
        const p = Math.min(Math.max(-r.top / Math.max(r.height - vh, 1), 0), 1);
        track.style.transform = `translate3d(${(-p * distance).toFixed(1)}px,0,0)`;
        if (barRef.current) barRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
        const head = window.innerWidth * 0.62;
        items.forEach((el) => el.toggleAttribute('data-on', el.getBoundingClientRect().left < head));
      } else {
        items.forEach((el) => el.toggleAttribute('data-on', el.getBoundingClientRect().top < vh * 0.7));
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      layout();
      schedule();
    };
    layout();
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', onResize);
      section.removeAttribute('data-pin');
      section.style.removeProperty('--xp-h');
      track.style.transform = '';
      items.forEach((el) => el.removeAttribute('data-on'));
    };
  }, []);

  return (
    <section ref={sectionRef} id="experience" className="section section-xp" aria-labelledby="exp-title">
      <div className="xp-pin">
        <SectionHead
          num="02"
          label="Experience"
          id="exp-title"
          note="From computer science foundations to formal AI training and an industry internship, and from there into building products."
        >
          A path built on <em>fundamentals.</em>
        </SectionHead>

        <div className="xp-rail">
          <ol ref={trackRef} className="xp-track">
            {journey.map((j, i) => (
              <li key={j.title} className="xp-card" data-reveal={i * 60}>
                <div className="xp-node" aria-hidden="true">
                  <span />
                </div>
                <div className="xp-meta">
                  <span className="xp-idx">{pad(i + 1)}</span>
                  <span className="xp-tag">{j.tag}</span>
                  {j.period && <span className="xp-period">{j.period}</span>}
                </div>
                <h3 className="xp-title">{j.title}</h3>
                <div className="xp-org">{j.org}</div>
                <p className="xp-text">{j.text}</p>
                {j.link && (
                  <a href={j.link.href} target="_blank" rel="noopener noreferrer" className="xp-link">
                    {j.link.label}
                    <span className="sr-only"> (PDF, opens in a new tab)</span>
                    <ArrowUpRight size={15} />
                  </a>
                )}
              </li>
            ))}
          </ol>
        </div>

        <div className="xp-progress" aria-hidden="true">
          <span className="xp-progress-label">Foundation</span>
          <span className="xp-progress-track">
            <span ref={barRef} className="xp-progress-bar" />
          </span>
          <span className="xp-progress-label">Building</span>
        </div>
      </div>
    </section>
  );
}
