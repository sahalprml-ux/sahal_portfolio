import type { CSSProperties } from 'react';
import { researchBoard } from '../data/content';
import { pad } from '../lib/motion';
import { SectionHead } from './SectionHead';

/** What's in progress, as a pipeline: ideas move from reading, to prototypes, to things being built. */
export function Exploring() {
  const updated = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <section id="exploring" className="section" aria-labelledby="explore-title">
      <SectionHead num="06" label="Research" id="explore-title" note={`Updated ${updated}`}>
        Currently <em>Exploring</em>
      </SectionHead>
      <ol className="explore">
        {researchBoard.map((col, i) => (
          <li key={col.name} className="explore-stage" data-reveal={i * 110} style={{ '--lvl': i + 1 } as CSSProperties}>
            <div className="explore-head">
              <span className="explore-step">Stage {pad(i + 1)}</span>
              <span className="explore-meter" aria-hidden="true">
                {researchBoard.map((_, k) => (
                  <i key={k} data-on={k <= i} />
                ))}
              </span>
            </div>
            <h3 className="explore-name">
              {col.name}
              <span className="explore-count">{pad(col.items.length)}</span>
            </h3>
            <ul className="explore-items">
              {col.items.map((it) => (
                <li key={it.title} className="explore-item">
                  <span className="explore-item-title">{it.title}</span>
                  <p>{it.text}</p>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
