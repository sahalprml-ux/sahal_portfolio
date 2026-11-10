import { useEffect, useLayoutEffect, useState } from 'react';

export const EASE = 'cubic-bezier(.2,.7,.2,1)';

export const pad = (n: number) => String(n).padStart(2, '0');

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const hasFinePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

export const MOBILE_QUERY = '(max-width: 879px)';
/** Narrow screens, or any device without hover (phones, tablets): use tap interactions. */
export const TOUCH_QUERY = '(max-width: 879px), (hover: none)';

/* ---------- Scroll reveal ---------- */

/**
 * Fades up every `[data-reveal]` element as it enters the viewport.
 * `data-reveal="120"` sets a delay in ms.
 * Uses WAAPI rather than CSS transitions so it never clobbers an element's own hover transitions.
 */
export function useScrollReveal() {
  // Split headlines (<SplitText>): words rise in once the heading is on screen.
  useEffect(() => {
    const splits = Array.from(document.querySelectorAll<HTMLElement>('[data-split]'));
    if (prefersReducedMotion()) {
      splits.forEach((el) => el.setAttribute('data-in', ''));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute('data-in', '');
          io.unobserve(entry.target);
        }),
      { threshold: 0.15, rootMargin: '0px 0px -6% 0px' },
    );
    splits.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const pending = new Set<HTMLElement>();
    const vh = window.innerHeight;

    els.forEach((el) => {
      if (el.getBoundingClientRect().top < vh * 0.92) return;
      el.style.opacity = '0';
      pending.add(el);
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          io.unobserve(el);
          if (!pending.delete(el)) return;
          const delay = Number(el.dataset.reveal) || 0;
          el.style.opacity = '';
          el.animate(
            [
              { opacity: 0, translate: '0 28px', filter: 'blur(6px)' },
              { opacity: 1, translate: '0 0', filter: 'blur(0px)' },
            ],
            { duration: 900, delay, easing: EASE, fill: 'backwards' },
          );
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    pending.forEach((el) => io.observe(el));

    return () => {
      io.disconnect();
      pending.forEach((el) => (el.style.opacity = ''));
    };
  }, []);
}

/** Locks page scroll while `locked` is true. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}
