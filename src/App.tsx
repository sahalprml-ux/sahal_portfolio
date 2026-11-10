import { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { About } from './components/About';
import { Certificates } from './components/Certificates';
import { Contact } from './components/Contact';
import { Cursor } from './components/Cursor';
import { Experience } from './components/Experience';
import { Exploring } from './components/Exploring';
import { Footer } from './components/Footer';
import { Header, MobileMenu } from './components/Header';
import { Hero } from './components/Hero';
import { Marquee } from './components/Marquee';
import { ProjectModal } from './components/ProjectModal';
import { Projects } from './components/Projects';
import { Skills } from './components/Skills';
import { projects } from './data/content';
import { site } from './data/site';
import {
  MOBILE_QUERY,
  prefersReducedMotion,
  useMediaQuery,
  useScrollLock,
  useScrollReveal,
} from './lib/motion';
import { webglAvailable } from './lib/webgl';

// Three.js loads in its own chunk after the page is up, so it never delays first paint.
const Scene3D = lazy(() => import('./three/Scene3D'));

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const closeTimer = useRef(0);
  const openIndexRef = useRef<number | null>(null);
  openIndexRef.current = openIndex;

  // The page renders client-side, after the browser's own jump to a #section link, so redo it once mounted.
  useLayoutEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'instant' });
  }, []);

  // If the window grows past the mobile breakpoint, the menu button disappears, so close the menu with it.
  const mobile = useMediaQuery(MOBILE_QUERY);
  useEffect(() => {
    if (!mobile) setMenuOpen(false);
  }, [mobile]);

  useScrollReveal();
  useScrollLock(menuOpen || openIndex !== null);

  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const openProject = useCallback((i: number) => {
    clearTimeout(closeTimer.current);
    setOpenIndex(i);
    setModalVisible(false);
    // Two frames so the panel mounts in its "from" state before transitioning in.
    requestAnimationFrame(() => requestAnimationFrame(() => setModalVisible(true)));
  }, []);

  const closeProject = useCallback(() => {
    setModalVisible(false);
    clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(
      () => {
        const last = openIndexRef.current;
        setOpenIndex(null);
        if (last !== null) {
          document
            .querySelector<HTMLElement>(`[data-project-cta="${projects[last].key}"]`)
            ?.focus({ preventScroll: true });
        }
      },
      prefersReducedMotion() ? 0 : 420,
    );
  }, []);

  const stepProject = useCallback((d: number) => {
    setOpenIndex((i) => (i === null ? i : (i + d + projects.length) % projects.length));
  }, []);

  return (
    <div className="page">
      <a href="#about" className="skip-link">
        Skip to content
      </a>
      <div className="noise" aria-hidden="true" />
      <div className="aurora" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="dotgrid" aria-hidden="true" />
      {webglAvailable() && (
        <Suspense fallback={null}>
          <Scene3D />
        </Suspense>
      )}
      {site.customCursor && <Cursor />}

      <Header menuOpen={menuOpen} onOpenMenu={openMenu} />
      {menuOpen && <MobileMenu onClose={closeMenu} />}

      <main id="top">
        <Hero />
        <Marquee />
        <About />
        <Experience />
        <Projects onOpen={openProject} />
        <Skills />
        <Certificates />
        <Exploring />
        <Contact />
      </main>

      <Footer />

      {openIndex !== null && (
        <ProjectModal index={openIndex} visible={modalVisible} onClose={closeProject} onStep={stepProject} />
      )}
    </div>
  );
}
