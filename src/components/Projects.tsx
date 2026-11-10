import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { projects, type Project } from '../data/content';
import { site } from '../data/site';
import { pad, prefersReducedMotion } from '../lib/motion';
import { CardSignature } from './CardSignature';
import { ArrowUpRight, GitHubIcon } from './Icons';
import { SectionHead } from './SectionHead';

/**
 * Scroll-told projects. On large screens a stage pins on the left and shows the live system
 * for whichever project is in focus on the right (its signature visual and its pipeline lighting
 * up step by step); the stage cross-fades as you scroll from one project to the next.
 * On phones each project carries its own visual inline.
 */
export function Projects({ onOpen }: { onOpen: (index: number) => void }) {
  const listRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const items = Array.from(list.querySelectorAll<HTMLElement>('.case'));
    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = window.innerHeight * 0.5;
      let best = 0;
      let bestD = Infinity;
      items.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - mid);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
        // Per-case scroll progress through the viewport, for the rail and the parallax.
        const p = Math.min(Math.max((window.innerHeight - r.top) / (window.innerHeight + r.height), 0), 1);
        el.style.setProperty('--cp', p.toFixed(4));
      });
      setActive(best);
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
    };
  }, []);

  return (
    <section id="projects" className="section section-projects" aria-labelledby="proj-title">
      <SectionHead
        num="03"
        label="Featured Projects"
        id="proj-title"
        note="Open any project for the full case study: problem, approach, architecture and results."
      >
        Systems built for <em>real problems.</em>
      </SectionHead>

      <div className="cases">
        <div className="stage" aria-hidden="true">
          <div className="stage-frame">
            <div className="stage-bar">
              <span className="stage-dots">
                <i />
                <i />
                <i />
              </span>
              <span className="stage-path">~/projects/{projects[active].key}</span>
              <span className="stage-count">
                {pad(active + 1)} / {pad(projects.length)}
              </span>
            </div>
            <div className="stage-body">
              {projects.map((p, i) => (
                <StagePanel key={p.key} project={p} index={i} on={i === active} />
              ))}
            </div>
          </div>
        </div>

        <ol ref={listRef} className="case-list">
          {projects.map((p, i) => (
            <CaseItem key={p.key} project={p} index={i} on={i === active} onOpen={onOpen} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function StagePanel({ project: p, index, on }: { project: Project; index: number; on: boolean }) {
  return (
    <div className="stage-panel" data-on={on}>
      <div className="stage-glow" />
      <div className="stage-head">
        <span className="stage-num">{pad(index + 1)}</span>
        <span className="stage-domain">{p.domain}</span>
      </div>
      <div className="stage-sig">
        <CardSignature kind={p.key} />
      </div>
      <Pipeline project={p} on={on} />
    </div>
  );
}

function Pipeline({ project: p, on }: { project: Project; on: boolean }) {
  return (
    <ol className="pipe" data-on={on}>
      {p.flow.map((label, k) => (
        <li key={label} className="pipe-step" style={{ '--k': k } as CSSProperties}>
          <span className="pipe-chip">
            <span className="pipe-idx">{pad(k + 1)}</span>
            {label}
          </span>
          {k < p.flow.length - 1 && <span className="pipe-link" />}
        </li>
      ))}
    </ol>
  );
}

const stop = (e: MouseEvent) => e.stopPropagation();

function CaseItem({
  project: p,
  index,
  on,
  onOpen,
}: {
  project: Project;
  index: number;
  on: boolean;
  onOpen: (i: number) => void;
}) {
  const github = p.links?.github || site.github;
  const demo = p.links?.demo;

  const glow = (e: MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion()) return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <li className="case" data-on={on}>
      <article className="case-card" aria-labelledby={`project-${p.key}`} onClick={() => onOpen(index)} onMouseMove={glow}>
        <div className="case-spot" aria-hidden="true" />
        <div className="case-top">
          <span className="case-num">{pad(index + 1)}</span>
          <span className="case-domain">{p.domain}</span>
        </div>
        <h3 id={`project-${p.key}`} className="case-title">
          {p.name}
        </h3>
        <p className="case-desc">{p.desc}</p>

        {/* Phones: the live visual sits inside the card. */}
        <div className="case-inline" aria-hidden="true">
          <CardSignature kind={p.key} />
          <Pipeline project={p} on={on} />
        </div>

        <dl className="case-ps">
          <div>
            <dt>Problem</dt>
            <dd>{p.problemShort}</dd>
          </div>
          <div>
            <dt>Solution</dt>
            <dd>{p.solutionShort}</dd>
          </div>
          <div className="case-outcome">
            <dt>Outcome</dt>
            <dd>{p.outcome}</dd>
          </div>
        </dl>
        <ul className="tags" aria-label="Technology">
          {p.stack.map((t) => (
            <li key={t} className="tag">
              {t}
            </li>
          ))}
        </ul>
        <div className="case-foot">
          <button type="button" className="btn btn-primary btn-sm" data-project-cta={p.key}>
            View case study<span className="sr-only">: {p.name}</span>
            <ArrowUpRight />
          </button>
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            className="icon-btn"
            aria-label={`${p.name} on GitHub`}
            onClick={stop}
          >
            <GitHubIcon />
          </a>
          {demo && (
            <a href={demo} target="_blank" rel="noopener noreferrer" className="btn btn-glass btn-sm" onClick={stop}>
              Demo<span className="sr-only"> of {p.name}</span>
            </a>
          )}
        </div>
      </article>
    </li>
  );
}
