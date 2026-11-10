import { useEffect, useRef } from 'react';
import { hasFinePointer, prefersReducedMotion } from '../lib/motion';

/**
 * A ring that trails the pointer. It grows over links and buttons, and over
 * elements with `data-cursor-label` it fills in and shows the label (e.g. "Open").
 * Only runs on fine-pointer devices without reduced motion.
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const text = textRef.current;
    if (!el || !text || !hasFinePointer() || prefersReducedMotion()) return;

    let x = -100;
    let y = -100;
    let cx = -100;
    let cy = -100;
    let raf = 0;

    const move = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      el.dataset.visible = 'true';
    };
    const over = (e: MouseEvent) => {
      if (!(e.target instanceof Element)) return;
      const t = e.target;
      const interactive = t.closest('a,button,[data-cursor-label],input,textarea,label');
      const labelled = t.closest<HTMLElement>('[data-cursor-label]');
      const inner = t.closest('a,button');
      const onOwnControl = labelled && inner && inner !== labelled && !inner.hasAttribute('data-cursor-inherit');
      const label = labelled && !onOwnControl ? labelled.dataset.cursorLabel ?? '' : '';
      if (label) text.textContent = label;
      el.dataset.state = label ? 'label' : interactive && !t.closest('input,textarea') ? 'link' : 'idle';
    };
    const out = (e: MouseEvent) => {
      if (!e.relatedTarget) el.dataset.visible = 'false';
    };
    const loop = () => {
      cx += (x - cx) * 0.2;
      cy += (y - cy) * 0.2;
      el.style.transform = `translate3d(${cx}px,${cy}px,0)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', move);
    document.addEventListener('mouseover', over);
    document.addEventListener('mouseout', out);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', over);
      document.removeEventListener('mouseout', out);
    };
  }, []);

  return (
    <div ref={ref} className="cursor" data-state="idle" aria-hidden="true">
      <span ref={textRef} className="cursor-text" />
    </div>
  );
}
