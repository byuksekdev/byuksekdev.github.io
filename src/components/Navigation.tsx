import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Github, Linkedin, Mail, Menu, X } from "lucide-react";

const LINKS = [
  { id: "about", label: "About Me" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
];

const SOCIALS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/burak-yuksek/", Icon: Linkedin },
  { label: "GitHub", href: "https://github.com/burakyu", Icon: Github },
  { label: "Email", href: "mailto:burakyuksek572@gmail.com", Icon: Mail },
];

// The capsule firms up (denser glass, shadow) once the page is scrolled past this many pixels
const SCROLLED_AT = 24;

const Navigation: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>(LINKS[0].id);
  const drawerRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLAnchorElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLUListElement>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  // Scroll progress is written straight to the DOM, so the nav only re-renders when "scrolled" flips
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
      }
      setScrolled(window.scrollY > SCROLLED_AT);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

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

  // Sliding highlight behind the active link
  useLayoutEffect(() => {
    const measure = () => {
      // Measure the <li>: its offsets are relative to the <ul>, which the highlight is positioned in
      const item = linksRef.current?.querySelector<HTMLElement>(`a[href="#${activeId}"]`)?.closest("li");
      if (item) setIndicator({ left: item.offsetLeft, width: item.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activeId]);

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
    // Release the mobile drawer's scroll lock first, otherwise the scroll is ignored
    document.documentElement.classList.remove("overflow-hidden");
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

  const glass = scrolled
    ? "bg-[rgba(var(--nav-bg-rgb),0.72)] border-white/[0.09] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.65)]"
    : "bg-[rgba(var(--nav-bg-rgb),0.35)] border-white/[0.06] shadow-none";

  return (
    <>
      {/* Backdrop (mobile menu) */}
      <button
        aria-hidden={!mobileOpen}
        tabIndex={-1}
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 md:hidden ${mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      <header
        className={`fixed inset-x-0 top-0 z-[60] px-3 sm:px-4 transition-[padding] duration-500 ${scrolled ? "pt-2.5" : "pt-4"}`}
      >
        {/* Skip link */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-amber-400 text-black px-3 py-2 rounded"
        >
          Skip to content
        </a>

        <nav aria-label="Primary" className="max-w-6xl mx-auto">
          {/* Capsule */}
          <div
            className={`liquid-glass relative grid h-14 grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center rounded-full border pl-2.5 pr-2 transition-[background-color,border-color,box-shadow] duration-500 ${glass}`}
          >
            {/* Brand */}
            <button
              onClick={toTop}
              className="justify-self-start flex items-center gap-2.5 group rounded-full pr-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              aria-label="Scroll to top"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center ring-1 ring-white/15 shadow-md group-hover:rotate-[-10deg] transition-transform duration-500">
                <img
                  src="/BY.webp"
                  alt="Burak Yüksek logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-[var(--text-primary)]">
                Burak <span className="text-[var(--accent)]">Yüksek</span>
              </span>
            </button>

            {/* Desktop links with a sliding highlight */}
            <ul ref={linksRef} className="relative hidden md:flex items-center gap-1 rounded-full bg-white/[0.035] p-1 ring-1 ring-inset ring-white/[0.06]">
              {indicator && (
                <span
                  aria-hidden
                  className="absolute top-1 bottom-1 rounded-full bg-white/[0.09] ring-1 ring-inset ring-white/[0.08] shadow-[0_1px_0_rgba(255,255,255,0.06)_inset] transition-[left,width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ left: indicator.left, width: indicator.width }}
                >
                  <span className="absolute -bottom-px left-1/2 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                </span>
              )}
              {LINKS.map((l) => {
                const isActive = activeId === l.id;
                return (
                  <li key={l.id} className="relative z-[1]">
                    <a
                      href={`#${l.id}`}
                      onClick={handleAnchorClick(l.id)}
                      aria-current={isActive ? "page" : undefined}
                      className={`block rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                        isActive ? "text-white" : "text-white/55 hover:text-white"
                      }`}
                    >
                      {l.label}
                    </a>
                  </li>
                );
              })}
            </ul>

            {/* Right: socials (desktop) / menu button (mobile) */}
            <div className="justify-self-end flex items-center gap-1">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="hidden md:flex w-9 h-9 items-center justify-center rounded-full text-white/55 transition-colors duration-300 hover:text-[var(--accent)] hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                  <Icon className="w-[18px] h-[18px]" />
                </a>
              ))}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                className="md:hidden flex w-10 h-10 items-center justify-center rounded-full bg-white/[0.05] ring-1 ring-inset ring-white/[0.08] text-white/90 transition-colors duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                aria-label="Toggle navigation"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            {/* Scroll progress: a glow on the capsule's bottom edge that grows outward from the center */}
            <div className="pointer-events-none absolute inset-x-10 -bottom-px h-px" aria-hidden>
              <div
                ref={progressRef}
                className="h-full origin-center bg-gradient-to-r from-transparent via-amber-400 to-transparent"
                style={{ transform: "scaleX(0)" }}
              />
            </div>
          </div>

          {/* Mobile drawer */}
          <div
            id="mobile-menu"
            ref={drawerRef}
            className={`md:hidden origin-top transition-[opacity,transform] duration-300 ease-out ${
              mobileOpen ? "opacity-100 translate-y-0 scale-100" : "pointer-events-none opacity-0 -translate-y-2 scale-[0.98]"
            }`}
          >
            <div className="liquid-glass mt-2 rounded-3xl border border-white/[0.09] bg-[rgba(var(--nav-bg-rgb),0.92)] p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)]">
              <ul>
                {LINKS.map((l, idx) => {
                  const isActive = activeId === l.id;
                  return (
                    <li key={l.id}>
                      <a
                        ref={idx === 0 ? firstFocusRef : undefined}
                        href={`#${l.id}`}
                        onClick={handleAnchorClick(l.id)}
                        tabIndex={mobileOpen ? 0 : -1}
                        aria-current={isActive ? "page" : undefined}
                        className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                          isActive ? "bg-white/[0.08] text-white" : "text-white/65 hover:bg-white/[0.04] hover:text-white"
                        }`}
                      >
                        {l.label}
                        {isActive && <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden />}
                      </a>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-2 flex items-center justify-center gap-2 border-t border-white/[0.06] pt-3 pb-1">
                {SOCIALS.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    aria-label={label}
                    tabIndex={mobileOpen ? 0 : -1}
                    className="flex w-11 h-11 items-center justify-center rounded-full bg-white/[0.04] ring-1 ring-inset ring-white/[0.07] text-white/70 transition-colors duration-300 hover:text-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  >
                    <Icon className="w-[18px] h-[18px]" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* Reduced motion */}
        <style>{`
          @media (prefers-reduced-motion: reduce) {
            .transition-all, .transition-transform, .transition-colors,
            .duration-300, .duration-200 { transition: none !important; }
          }
        `}</style>
      </header>
    </>
  );
};

export default Navigation;
