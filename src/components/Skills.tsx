import { useState, type MouseEvent } from 'react';
import { skillCategories, skills } from '../data/content';
import { pad, prefersReducedMotion } from '../lib/motion';
import { SectionHead } from './SectionHead';

/**
 * The toolkit as a bento of modules, one per area. Hover, focus or tap a tool and the module's
 * readout explains how it is used.
 */
export function Skills() {
  return (
    <section id="skills" className="section" aria-labelledby="skills-title">
      <SectionHead
        num="04"
        label="Skills"
        id="skills-title"
        note={`${skills.length} technologies across ${skillCategories.length} areas. Hover or tap a tool to see how it fits.`}
      >
        A connected toolkit, <em>not a checklist.</em>
      </SectionHead>

      <div className="skill-bento">
        {skillCategories.map((c, i) => (
          <SkillModule key={c.name} index={i} name={c.name} info={c.info} />
        ))}
      </div>
    </section>
  );
}

function SkillModule({ index, name, info }: { index: number; name: string; info: string }) {
  const tools = skills.filter((s) => s.category === name);
  const [picked, setPicked] = useState<string | null>(null);
  const tool = tools.find((t) => t.name === picked);

  const glow = (e: MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion()) return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <article
      className={`skill-mod skill-mod-${index + 1}`}
      data-reveal={(index % 3) * 80}
      onMouseMove={glow}
      onMouseLeave={() => setPicked(null)}
    >
      <div className="skill-spot" aria-hidden="true" />
      <div className="skill-mod-head">
        <span className="skill-mod-idx">{pad(index + 1)}</span>
        <span className="skill-mod-count">{pad(tools.length)} tools</span>
      </div>
      <h3 className="skill-mod-name">{name}</h3>
      <ul className="skill-tools">
        {tools.map((t) => (
          <li key={t.name}>
            <button
              type="button"
              className="skill-tool"
              aria-pressed={picked === t.name}
              onMouseEnter={() => setPicked(t.name)}
              onFocus={() => setPicked(t.name)}
              onClick={() => setPicked(t.name)}
            >
              {t.name}
            </button>
          </li>
        ))}
      </ul>
      <p className="skill-readout" aria-live="polite">
        <span className="skill-readout-key">{tool ? tool.name : 'Area'}</span>
        {tool ? tool.info : info}
      </p>
    </article>
  );
}
