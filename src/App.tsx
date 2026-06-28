import React, { useEffect } from 'react';
import Navigation from './components/Navigation';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';
import AnimatedBackground from './components/AnimatedBackground';

function App() {
  useEffect(() => {
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const root = document.documentElement;
    let raf = 0;

    const update = () => {
      raf = 0;
      const angle = (window.scrollY * 0.12) % 360;
      root.style.setProperty('--glass-angle', `${angle}deg`);
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-page)] relative overflow-x-hidden">
      <div className="absolute inset-0 bg-[var(--bg-page-overlay)] pointer-events-none z-0" />

      <Navigation />
      <AnimatedBackground />

      <main id="main" role="main" className="relative z-10">
        <About />
        <Projects />
        <Contact />
      </main>
    </div>
  );
}

export default App;