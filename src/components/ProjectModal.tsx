import { useEffect, useRef } from 'react';
import { projects } from '../data/content';
import { site } from '../data/site';
import { pad } from '../lib/motion';
import { trapFocus } from './Header';

interface ProjectModalProps {
  index: number;
  visible: boolean;
  onClose: () => void;
  onStep: (delta: number) => void;
}

export function ProjectModal({ index, visible, onClose, onStep }: ProjectModalProps) {
  const p = projects[index];
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 });
  }, [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') onStep(1);
      else if (e.key === 'ArrowLeft') onStep(-1);
      else if (e.key === 'Tab') trapFocus(e, panelRef.current);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, onStep]);

  const github = p.links?.github || site.github;
  const demo = p.links?.demo;
  const titleId = `case-title-${p.key}`;

  return (
    <div className="modal-backdrop" data-open={visible} onClick={onClose}>
      <div
        ref={panelRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-bar">
          <span className="modal-count">
            <span className="modal-count-prefix">Case study · </span>
            {pad(index + 1)} / {pad(projects.length)}
          </span>
          <div className="modal-actions">
            <button type="button" className="square-btn" aria-label="Previous project" onClick={() => onStep(-1)}>
              ←
            </button>
            <button type="button" className="square-btn" aria-label="Next project" onClick={() => onStep(1)}>
              →
            </button>
            <button ref={closeRef} type="button" className="close-btn" aria-label="Close case study" onClick={onClose}>
              Close <span aria-hidden="true">✕</span>
            </button>
          </div>
        </div>

        <header className="modal-hero">
          <div className="modal-hero-glow" aria-hidden="true" />
          <div className="modal-hero-text">
            <div className="modal-kicker">
              <span className="eyebrow-num">{pad(index + 1)}</span>
              {p.domain}
            </div>
            <h2 id={titleId} className="modal-title">
              {p.name}
            </h2>
            <p className="modal-desc">{p.desc}</p>
          </div>
          <div className="pipeline">
            <div className="label-mono pipeline-label">Pipeline</div>
            <ol className="pipeline-steps">
              {p.flow.map((label, k) => (
                <li key={label} className="flow-step">
                  <span className="pipeline-chip">
                    <span className="pipeline-idx">{pad(k + 1)}</span>
                    {label}
                  </span>
                  {k < p.flow.length - 1 && (
                    <span className="flow-arrow" aria-hidden="true">
                      →
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </header>

        <div className="modal-content">
          <aside className="modal-aside">
            <div className="modal-aside-inner">
              <div className="modal-block">
                <span className="label-mono">Technology</span>
                <ul className="tags">
                  {p.stack.map((t) => (
                    <li key={t} className="tag tag-static">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="modal-links">
                <a href={github} target="_blank" rel="noopener noreferrer" className="modal-link">
                  GitHub<span aria-hidden="true">↗</span>
                </a>
                {demo && (
                  <a href={demo} target="_blank" rel="noopener noreferrer" className="modal-link is-primary">
                    Live Demo<span aria-hidden="true">↗</span>
                  </a>
                )}
              </div>
            </div>
          </aside>

          <div className="modal-main">
            <section className="case-block">
              <h3 className="case-heading">Overview</h3>
              <p className="case-lead">{p.overview}</p>
            </section>
            <div className="case-split">
              <section className="case-block">
                <h3 className="case-heading">Problem</h3>
                <p className="case-text">{p.problem}</p>
              </section>
              <section className="case-block">
                <h3 className="case-heading">Approach</h3>
                <p className="case-text">{p.approach}</p>
              </section>
            </div>
            <section className="case-block">
              <h3 className="case-heading">Architecture</h3>
              <p className="case-text">{p.architecture}</p>
            </section>
            <section className="case-block">
              <h3 className="case-heading">Challenges</h3>
              <ol className="challenges">
                {p.challenges.map((c, k) => (
                  <li key={c}>
                    <span className="challenge-num">{pad(k + 1)}</span>
                    {c}
                  </li>
                ))}
              </ol>
            </section>
            <section className="case-block">
              <h3 className="case-heading">Results</h3>
              <p className="case-text is-bright">{p.results}</p>
            </section>
            {p.screenshots && p.screenshots.length > 0 && (
              <section className="case-block">
                <h3 className="case-heading">Screenshots</h3>
                <div className="shots">
                  {p.screenshots.map((s) => (
                    <figure key={s.src} className="shot">
                      <img src={s.src} alt={s.alt} loading="lazy" />
                    </figure>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
