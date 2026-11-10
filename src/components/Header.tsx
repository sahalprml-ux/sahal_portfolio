import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { mailto, site } from '../data/site';
import { EASE, pad, prefersReducedMotion } from '../lib/motion';

export const NAV_ITEMS = [
  { label: 'About', id: 'about' },
  { label: 'Experience', id: 'experience' },
  { label: 'Projects', id: 'projects' },
  { label: 'Skills', id: 'skills' },
  { label: 'Certificates', id: 'certificates' },
  { label: 'Contact', id: 'contact' },
];

interface HeaderProps {
  menuOpen: boolean;
  onOpenMenu: () => void;
}

export function Header({ menuOpen, onOpenMenu }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('');
  const progressRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(y > 24);
      if (progressRef.current) progressRef.current.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
      let current = '';
      for (const { id } of NAV_ITEMS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) current = id;
      }
      setActive(current);
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

  // A glass pill slides under the active section's link.
  useLayoutEffect(() => {
    const place = () => {
      const pill = pillRef.current;
      const link = linksRef.current?.querySelector<HTMLElement>('[aria-current="true"]');
      if (!pill) return;
      if (!link) {
        pill.style.opacity = '0';
        return;
      }
      pill.style.opacity = '1';
      pill.style.width = `${link.offsetWidth}px`;
      pill.style.transform = `translateX(${link.offsetLeft}px)`;
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [active]);

  return (
    <header className="site-header" data-scrolled={scrolled}>
      <nav className="nav" aria-label="Primary">
        <a href="#top" className="brand" aria-label={site.name}>
          <span className="brand-name" aria-hidden="true">
            <span className="brand-initial">{site.name.charAt(0)}</span>
            {site.name.slice(1)}
            <span className="brand-dot">.</span>
          </span>
        </a>
        <div ref={linksRef} className="nav-links">
          <span ref={pillRef} className="nav-pill" aria-hidden="true" />
          {NAV_ITEMS.map((n) => (
            <a key={n.id} href={`#${n.id}`} className="nav-link" aria-current={active === n.id ? 'true' : undefined}>
              {n.label}
            </a>
          ))}
        </div>
        <div className="nav-actions">
          <span className="nav-cta">
            <a href="#contact" className="btn btn-primary btn-sm">
              Let's Talk
            </a>
          </span>
          <button
            type="button"
            className="menu-btn"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={onOpenMenu}
          >
            <span />
            <span />
          </button>
        </div>
        <div ref={progressRef} className="nav-progress" aria-hidden="true" />
      </nav>
    </header>
  );
}

export function MobileMenu({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    if (!prefersReducedMotion()) {
      dialogRef.current?.querySelectorAll<HTMLElement>('[data-menu-item]').forEach((el, i) =>
        el.animate(
          [
            { opacity: 0, transform: 'translateY(24px)' },
            { opacity: 1, transform: 'none' },
          ],
          { duration: 600, delay: 60 + i * 50, easing: EASE, fill: 'both' },
        ),
      );
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') trapFocus(e, dialogRef.current);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (opener && document.contains(opener) && opener.offsetParent !== null) opener.focus();
    };
  }, [onClose]);

  const go = (id: string) => (e: ReactMouseEvent) => {
    e.preventDefault();
    onClose();
    requestAnimationFrame(() =>
      document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' }),
    );
  };

  return (
    <div ref={dialogRef} id="mobile-menu" className="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="mobile-menu-top">
        <span className="mobile-menu-name">{site.name}</span>
        <button ref={closeRef} type="button" className="mobile-menu-close" aria-label="Close menu" onClick={onClose}>
          ✕
        </button>
      </div>
      <nav className="mobile-menu-links" aria-label="Sections">
        {NAV_ITEMS.map((n, i) => (
          <a key={n.id} href={`#${n.id}`} className="mobile-menu-link" data-menu-item="" onClick={go(n.id)}>
            <span className="mobile-menu-num">{pad(i + 1)}</span>
            {n.label}
          </a>
        ))}
      </nav>
      <div className="mobile-menu-foot">
        <a href="#contact" className="btn btn-primary mobile-menu-cta" onClick={go('contact')}>
          Let's Talk
        </a>
        <div className="mobile-menu-social">
          <a href={site.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href={site.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href={mailto}>Email</a>
        </div>
      </div>
    </div>
  );
}

/** Keeps Tab / Shift+Tab focus inside `container`. */
export function trapFocus(e: KeyboardEvent, container: HTMLElement | null) {
  if (!container) return;
  const focusable = Array.from(
    container.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])'),
  ).filter((el) => el.offsetParent !== null || el === document.activeElement);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  } else if (!container.contains(document.activeElement)) {
    e.preventDefault();
    first.focus();
  }
}
