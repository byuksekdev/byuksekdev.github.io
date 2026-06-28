import React, { useEffect, useMemo, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

const LINKS = [
  { id: "about", label: "About Me" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
];

// Fade behaviour settings
const FADE_DISTANCE = 220;     // pixels until close-to-full opacity
const MAX_BG_OPACITY = 0.70;   // maximum opacity for zinc-900

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const Navigation: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>(LINKS[0].id);
  const drawerRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLAnchorElement>(null);
  const rafRef = useRef<number>();

  // Optimized scroll handling with throttling
  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      rafRef.current = requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };
    
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Calculate progress from scrollY
  const progress = useMemo(() => {
    const doc = document.documentElement;
    const maxScroll = doc.scrollHeight - doc.clientHeight;
    return maxScroll > 0 ? Math.min((scrollY / maxScroll) * 100, 100) : 0;
  }, [scrollY]);

  // Active section highlight
  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];
    if (!sections.length) return;
    
    const obs = new IntersectionObserver(
      (entries) => {
        // Find the most visible section
        let maxRatio = 0;
        let activeSection = '';
        
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            activeSection = entry.target.id;
          }
        });
        
        // If no section is visible, determine by scroll position
        if (!activeSection) {
          const scrollPosition = window.scrollY + window.innerHeight / 2;
          
          for (let i = sections.length - 1; i >= 0; i--) {
            const section = sections[i];
            if (section && scrollPosition >= section.offsetTop) {
              activeSection = section.id;
              break;
            }
          }
        }
        
        if (activeSection) {
          setActiveId(activeSection);
        }
      },
      { 
        root: null, 
        rootMargin: "-20% 0px -20% 0px", 
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0] 
      }
    );
    
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  // Mobile drawer: ESC, focus trap, body scroll lock
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!mobileOpen) return;
      if (e.key === "Escape") setMobileOpen(false);
      if (e.key === "Tab") {
        const focusables = drawerRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex="0"]'
        );
        if (!focusables?.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          (last as HTMLElement).focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          (first as HTMLElement).focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    if (mobileOpen) {
      document.documentElement.classList.add("overflow-hidden");
      setTimeout(() => firstFocusRef.current?.focus(), 0);
    } else {
      document.documentElement.classList.remove("overflow-hidden");
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("overflow-hidden");
    };
  }, [mobileOpen]);

  // Smooth hash scroll
  const smoothScrollTo = (el: HTMLElement) => {
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
  };
  const handleAnchorClick = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    smoothScrollTo(el);
    history.replaceState(null, "", `#${id}`);
    setMobileOpen(false);
  };
  const toTop = () => {
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    history.replaceState(null, "", "#");
    setMobileOpen(false);
  };

  // Calculate background opacity (zinc-900 rgba)
  const t = clamp(scrollY / FADE_DISTANCE, 0, 1);
  const bgOpacity = +(t * MAX_BG_OPACITY).toFixed(3); // stabilize
  const showShadow = t > 0.15;
  const showBorder = t > 0.35;

  // Class names
  const navClass = useMemo(
    () =>
      [
        "fixed top-0 left-0 right-0 z-[60] transition-[background-color,transform,box-shadow,border-color] duration-300",
        "supports-[backdrop-filter]:backdrop-blur-md",
        showShadow ? "shadow-lg" : "shadow-none",
        showBorder ? "border-b border-white/10" : "border-b border-transparent",
      ].join(" "),
    [showShadow, showBorder]
  );

  const linkBase =
    "relative font-medium px-1 py-0.5 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]";
  const underline =
    "after:absolute after:left-0 after:right-0 after:-bottom-[6px] after:h-0.5 after:rounded-full after:bg-[var(--accent)] after:origin-left after:scale-x-0 after:transition-transform after:duration-300";
  const underlineActive = "after:scale-x-100";

  return (
    <>
      {/* Backdrop (mobile menu) */}
      <button
        aria-hidden={!mobileOpen}
        tabIndex={-1}
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-50 bg-black/20 transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />
      <header
        className={navClass}
        style={{
          backgroundColor: `rgba(var(--nav-bg-rgb),${bgOpacity})`,
        }}
      >
        {/* Progress bar */}
        <div
          className="absolute top-0 left-0 h-0.5 bg-[var(--accent)] progress-bar"
          style={{ width: `${progress}%` }}
          aria-hidden
        />

        {/* Skip link */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-amber-400 text-black px-3 py-2 rounded"
        >
          Skip to content
        </a>

        <nav aria-label="Primary" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-safe">
          <div className="flex h-16 items-center justify-between">
            {/* Brand */}
            <button
              onClick={toTop}
              className="flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
              aria-label="Scroll to top"
            >
              <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-300">
                <img
                  src="/BY.png"
                  alt="Burak Yüksek logo"
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-[var(--text-primary)]">
                Burak <span className="text-[var(--accent)]">Yüksek</span>
              </span>
            </button>

            {/* Desktop links */}
            <ul className="hidden md:flex items-center gap-8">
              {LINKS.map((l) => {
                const isActive = activeId === l.id;
                return (
                  <li key={l.id}>
                    <a
                      href={`#${l.id}`}
                      onClick={handleAnchorClick(l.id)}
                      className={`${linkBase} ${underline} ${isActive ? underlineActive : ""}`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {l.label}
                    </a>
                  </li>
                );
              })}
            </ul>

            {/* Mobile button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileOpen((v) => !v)}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                className="p-2 rounded-lg transition-colors duration-200 text-white/90 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                aria-label="Toggle navigation"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile drawer */}
          <div
            id="mobile-menu"
            ref={drawerRef}
            className={`md:hidden overflow-hidden transition-[max-height,opacity,transform] duration-300 ${
              mobileOpen ? "max-h-96 opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-2"
            }`}
          >
            <ul className="mt-2 rounded-2xl p-2 bg-[rgba(var(--nav-bg-rgb),0.96)] supports-[backdrop-filter]:backdrop-blur-md shadow-xl ring-1 ring-black/10">
              {LINKS.map((l, idx) => {
                const isActive = activeId === l.id;
                const item =
                  "block w-full text-left px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]";
                return (
                  <li key={l.id}>
                    <a
                      ref={idx === 0 ? firstFocusRef : undefined}
                      href={`#${l.id}`}
                      onClick={handleAnchorClick(l.id)}
                      className={`${item} ${isActive ? "bg-white/10" : ""}`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {l.label}
                    </a>
                  </li>
                );
              })}
              <li className="flex justify-end px-2">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[var(--text-secondary)] hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                  Close
                </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* Reduced motion + safe area */}
        <style>{`
          @media (prefers-reduced-motion: reduce) {
            .transition-all, .transition-transform, .transition-colors,
            .duration-300, .duration-200 { transition: none !important; }
          }
          .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
        `}</style>
      </header>
    </>
  );
};

export default Navigation;
