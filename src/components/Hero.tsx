import { useEffect, useLayoutEffect, useRef } from 'react';
import { heroTags } from '../data/content';
import { site } from '../data/site';
import { EASE, prefersReducedMotion } from '../lib/motion';
import { webglAvailable } from '../lib/webgl';
import { ArrowRight, DownloadIcon } from './Icons';
import { NeuralCanvas } from './NeuralCanvas';
import { SplitText } from './SplitText';

const LEAD =
  'AI Engineer & Data Scientist focused on building practical AI systems, intelligent applications, and data-driven products.';

export function Hero() {
  const rootRef = useRef<HTMLElement>(null);

  // Entrance: the headline's words rise in (SplitText); everything else fades up around it.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const anims: Animation[] = [];
    root.querySelectorAll<HTMLElement>('[data-hero]').forEach((el, i) => {
      anims.push(
        el.animate(
          [
            { opacity: 0, transform: 'translateY(18px)', filter: 'blur(8px)' },
            { opacity: 1, transform: 'none', filter: 'blur(0px)' },
          ],
          { duration: 1000, delay: i === 0 ? 60 : 520 + i * 110, easing: EASE, fill: 'both' },
        ),
      );
    });
    return () => anims.forEach((a) => a.cancel());
  }, []);

  // Exit: as you scroll away the hero content lifts and fades (--hx, 0 → 1).
  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const p = Math.min(Math.max(window.scrollY / (root.offsetHeight * 0.85), 0), 1);
      root.style.setProperty('--hx', p.toFixed(4));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      root.style.removeProperty('--hx');
    };
  }, []);

  return (
    <section ref={rootRef} className="hero" aria-label="Introduction">
      <div className="hero-card">
        {/* The page-wide 3D scene takes over when WebGL is available; this 2D network is the fallback. */}
        {!webglAvailable() && (
          <>
            <NeuralCanvas />
            <div className="hero-fade" aria-hidden="true" />
          </>
        )}
        <span className="hero-shard hero-shard-1" aria-hidden="true" />
        <span className="hero-shard hero-shard-2" aria-hidden="true" />
        <span className="hero-shard hero-shard-3" aria-hidden="true" />
        <span className="hero-rings" aria-hidden="true" />

        <div className="hero-inner">
          <p className="hero-eyebrow" data-hero="">
            Building intelligent systems <span aria-hidden="true">•</span> for the real world
          </p>
          <SplitText as="h1" className="hero-title" delay={180}>
            Mohamed
            <br />
            Sahal<em>.</em>
          </SplitText>
          <p className="hero-roles" data-hero="">
            AI Engineer <span aria-hidden="true">/</span> Data Scientist
          </p>
          <p className="hero-lead" data-hero="">
            {LEAD}
          </p>
          <div className="hero-ctas" data-hero="">
            <a href="#projects" className="btn btn-primary">
              View My Work
              <ArrowRight />
            </a>
            {site.resume ? (
              <a href={site.resume} className="btn btn-glass" download>
                Download CV
                <DownloadIcon />
              </a>
            ) : (
              <a href="#contact" className="btn btn-glass">
                Let's Connect
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="hero-foot" data-hero="">
        <span className="pill">
          <span className="status-dot" aria-hidden="true" />
          {site.availability}
        </span>
        <ul className="hero-tags" aria-label="Focus areas">
          {heroTags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
