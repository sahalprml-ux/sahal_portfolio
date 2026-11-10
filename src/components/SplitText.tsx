import { Children, isValidElement, type CSSProperties, type ElementType, type ReactElement, type ReactNode } from 'react';

interface SplitTextProps {
  as?: ElementType;
  id?: string;
  className?: string;
  /** Extra delay (ms) before the first word rises. */
  delay?: number;
  /** Plain text, with <em> for the serif-italic accent phrase and optional <br /> line breaks. */
  children: ReactNode;
}

/**
 * A headline whose words rise into view one after another.
 * Wrap the accent phrase in <em> to set it in the serif italic.
 * Screen readers get the plain sentence; the animated words are hidden from them.
 */
export function SplitText({ as: Tag = 'h2', id, className = '', delay = 0, children }: SplitTextProps) {
  const words: ReactNode[] = [];
  const plain: string[] = [];
  let n = 0;

  const addWords = (text: string, accent: boolean) => {
    plain.push(text);
    for (const part of text.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        words.push(' ');
        continue;
      }
      words.push(
        <span key={n} className="sw">
          <span className={accent ? 'swi accent' : 'swi'} style={{ '--wi': n } as CSSProperties}>
            {part}
          </span>
        </span>,
      );
      n++;
    }
  };

  Children.forEach(children, (child) => {
    if (typeof child === 'string' || typeof child === 'number') addWords(String(child), false);
    else if (isValidElement(child) && child.type === 'em')
      addWords(String((child as ReactElement<{ children: ReactNode }>).props.children), true);
    else if (isValidElement(child) && child.type === 'br') {
      words.push(<br key={`br${n}`} />);
      plain.push(' ');
    }
  });

  return (
    <Tag
      id={id}
      className={`split ${className}`.trim()}
      data-split=""
      style={{ '--split-delay': `${delay}ms` } as CSSProperties}
    >
      <span className="sr-only">{plain.join('')}</span>
      <span aria-hidden="true">{words}</span>
    </Tag>
  );
}
