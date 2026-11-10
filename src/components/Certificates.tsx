import type { MouseEvent } from 'react';
import { certificates, type Certificate } from '../data/content';
import { hasFinePointer, prefersReducedMotion } from '../lib/motion';
import { ArrowUpRight } from './Icons';
import { SectionHead } from './SectionHead';

export function Certificates() {
  return (
    <section id="certificates" className="section" aria-labelledby="cert-title">
      <SectionHead num="05" label="Certificates" id="cert-title">
        Verified <em>learning.</em>
      </SectionHead>
      <div className="cert-grid">
        {certificates.map((c, i) => (
          <CertCard key={c.name} cert={c} delay={i * 120} />
        ))}
      </div>
    </section>
  );
}

/** A holographic credential: it tilts toward the pointer and a foil sheen slides across it. */
function CertCard({ cert: c, delay }: { cert: Certificate; delay: number }) {
  const track = (e: MouseEvent<HTMLElement>) => {
    if (!hasFinePointer() || prefersReducedMotion()) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--px', `${(x * 100).toFixed(1)}%`);
    el.style.setProperty('--py', `${(y * 100).toFixed(1)}%`);
    el.style.setProperty('--rx', `${((0.5 - y) * 9).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${((x - 0.5) * 12).toFixed(2)}deg`);
    el.dataset.tilting = 'true';
  };
  const reset = (e: MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    delete el.dataset.tilting;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  return (
    <div className="cert-wrap" data-reveal={delay}>
      <article className="cert-card" onMouseMove={track} onMouseLeave={reset}>
        <div className="cert-foil" aria-hidden="true" />
        <div className="cert-top">
          <span className="cert-kind">{c.kind}</span>
          <span className="cert-seal" aria-hidden="true">
            ✓ Verified
          </span>
        </div>
        <div className="cert-mono" aria-hidden="true">
          {c.mono}
        </div>
        <div className="cert-info">
          <h3 className="cert-name">{c.name}</h3>
          <div className="cert-facts">
            <span>
              <span className="cert-key">Issuer</span>
              {c.issuer}
            </span>
            {c.year && (
              <span>
                <span className="cert-key">Year</span>
                {c.year}
              </span>
            )}
          </div>
        </div>
        <div className="cert-skills">
          <span className="cert-key">Skills gained</span>
          <ul className="tags">
            {c.skills.map((s) => (
              <li key={s} className="tag">
                {s}
              </li>
            ))}
          </ul>
        </div>
        {c.url && (
          <a href={c.url} target="_blank" rel="noopener noreferrer" className="cert-link">
            View Certificate
            <ArrowUpRight size={15} />
          </a>
        )}
      </article>
    </div>
  );
}
