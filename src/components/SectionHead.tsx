import type { ReactNode } from 'react';
import { Eyebrow } from './Eyebrow';
import { SplitText } from './SplitText';

/** Section opener: index + label, a split headline, and an optional note on the right. */
export function SectionHead({
  num,
  label,
  id,
  note,
  className = '',
  children,
}: {
  num: string;
  label: string;
  id: string;
  note?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`section-head ${className}`.trim()}>
      <div className="section-head-main">
        <Eyebrow num={num} label={label} />
        <SplitText id={id} className="section-title">
          {children}
        </SplitText>
      </div>
      {note && (
        <p className="section-note" data-reveal="80">
          {note}
        </p>
      )}
    </div>
  );
}
