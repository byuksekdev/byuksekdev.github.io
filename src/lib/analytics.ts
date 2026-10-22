// Visitor analytics on top of Umami (cookieless, no personal data, nothing stored on the visitor's device).
//
// The Umami script is loaded in index.html with auto-tracking off. This module decides what gets sent:
// - Bot filter: a visit only counts once the visitor actually engages (scrolls, moves the pointer, taps,
//   presses a key, or keeps the page open and visible for a few seconds). Link scanners such as LinkedIn's,
//   which load the page and leave, are never counted.
// - Then: time on site, scroll depth, sections reached, nav and link clicks, project panels (which ones,
//   for how long), media opened, video watch time, card hovers, and a "Visit summary" when the visitor
//   leaves or switches tabs.
//
// Every call is safe at any time: events wait for Umami to load and for the visitor to engage,
// and are silently dropped if Umami never loads (ad blockers, localhost, the ?notrack opt-out).

type EventData = Record<string, string | number>;

declare global {
  interface Window {
    umami?: {
      track: (event?: string, data?: EventData) => void;
    };
  }
}

/** Seconds of visible, active time after which a visitor counts even without any interaction. */
const ENGAGE_AFTER_SECONDS = 8;
/** Visitors idle this long (no input, no video playing) stop accruing active time. */
const IDLE_AFTER_SECONDS = 60;
const TIME_MARKS = [10, 30, 60, 120, 300, 600];
const SCROLL_MARKS = [25, 50, 75, 100];
const MAX_TEXT = 400;

const visit = {
  engaged: false,
  activeSeconds: 0,
  lastInput: performance.now(),
  videoPlaying: false,
  maxScroll: 0,
  sections: [] as string[],
  projects: [] as string[],
  mediaOpened: 0,
  links: [] as string[],
  timeMarks: new Set<number>(),
  scrollMarks: new Set<number>(),
  hovered: new Set<string>(),
  summarySentAt: -1,
};

let queue: [string | undefined, EventData | undefined][] = [];

const send = (event?: string, data?: EventData) => {
  if (!window.umami) return false;
  window.umami.track(event, data);
  return true;
};

const flush = (tries = 20) => {
  if (!window.umami) {
    if (tries > 0) setTimeout(() => flush(tries - 1), 500);
    return;
  }
  queue.forEach(([e, d]) => send(e, d));
  queue = [];
};

/** Queue an event. Nothing leaves the browser until the visitor has engaged. */
export const track = (event: string, data?: EventData) => {
  queue.push([event, data]);
  if (visit.engaged) flush();
};

const engage = () => {
  if (visit.engaged) return;
  visit.engaged = true;
  queue.unshift([undefined, undefined]); // the page view itself goes first
  flush();
};

const clip = (list: string[]) => list.join(', ').slice(0, MAX_TEXT);

const addOnce = (list: string[], value: string) => {
  if (!list.includes(value)) list.push(value);
};

// ─── Called from components ───────────────────────────────────────────

export const projectOpened = (title: string, group: string) => {
  addOnce(visit.projects, title);
  track('View project', { title, group });
};

export const projectClosed = (title: string, seconds: number) => {
  if (seconds >= 1) track('Project time', { title, seconds: Math.round(seconds) });
};

export const mediaOpened = (title: string, type: 'video' | 'screenshot') => {
  visit.mediaOpened += 1;
  track('Open media', { title, type });
};

export const videoWatched = (title: string, video: HTMLVideoElement | null) => {
  if (!video) return;
  let seconds = 0;
  for (let i = 0; i < video.played.length; i++) seconds += video.played.end(i) - video.played.start(i);
  if (seconds >= 1) {
    const percent = video.duration ? Math.min(100, Math.round((seconds / video.duration) * 100)) : 0;
    track('Video watched', { title, seconds: Math.round(seconds), percent });
  }
};

export const setVideoPlaying = (playing: boolean) => {
  visit.videoPlaying = playing;
};

export const cardHovered = (title: string) => {
  if (visit.hovered.has(title)) return;
  visit.hovered.add(title);
  track('Card hover', { title });
};

// ─── Site-wide listeners ──────────────────────────────────────────────

// Outbound links are named by where they go, so the dashboard reads "LinkedIn", "Resume", …
const linkName = (url: URL) => {
  if (url.protocol === 'mailto:') return 'Email';
  if (url.hostname.includes('linkedin.com')) return 'LinkedIn';
  if (url.hostname.includes('github.com')) return 'GitHub';
  if (url.hostname.includes('drive.google.com')) return 'Resume';
  if (url.hostname.includes('apps.apple.com')) return 'App Store';
  if (url.hostname.includes('play.google.com')) return 'Google Play';
  return url.hostname;
};

const sendSummary = () => {
  if (!visit.engaged || visit.activeSeconds - visit.summarySentAt < 5) return;
  visit.summarySentAt = visit.activeSeconds;
  // Sent directly (not queued) so it goes out before the page is frozen or closed
  send('Visit summary', {
    active_seconds: visit.activeSeconds,
    max_scroll: visit.maxScroll,
    sections: clip(visit.sections) || '-',
    projects: clip(visit.projects) || '-',
    projects_count: visit.projects.length,
    media_opened: visit.mediaOpened,
    links: clip(visit.links) || '-',
  });
};

/** Starts site-wide tracking. Sections to watch are marked with data-track-section="Name". */
export const initAnalytics = () => {
  const cleanups: (() => void)[] = [];
  const on = <K extends keyof WindowEventMap>(target: Window | Document, type: K | string, fn: (e: Event) => void, opts?: AddEventListenerOptions) => {
    target.addEventListener(type, fn, opts);
    cleanups.push(() => target.removeEventListener(type, fn, opts));
  };

  // Real input engages the visit and resets the idle timer
  const onInput = () => {
    visit.lastInput = performance.now();
    engage();
  };
  ['pointerdown', 'pointermove', 'keydown', 'touchstart', 'wheel'].forEach((t) => on(window, t, onInput, { passive: true }));

  // Active time, once per second: only while the tab is visible and the visitor isn't idle
  let visibleSeconds = 0;
  const tick = window.setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    visibleSeconds += 1;
    if (!visit.engaged && visibleSeconds >= ENGAGE_AFTER_SECONDS) engage();
    const idle = (performance.now() - visit.lastInput) / 1000 > IDLE_AFTER_SECONDS;
    if (!visit.engaged || (idle && !visit.videoPlaying)) return;
    visit.activeSeconds += 1;
    for (const mark of TIME_MARKS) {
      if (visit.activeSeconds >= mark && !visit.timeMarks.has(mark)) {
        visit.timeMarks.add(mark);
        track('Time on site', { seconds: mark });
      }
    }
  }, 1000);
  cleanups.push(() => window.clearInterval(tick));

  // Scroll depth
  let scrollRaf = 0;
  on(window, 'scroll', () => {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      if (max <= 0) return;
      const percent = Math.min(100, Math.round(((window.scrollY + 2) / max) * 100));
      if (percent > visit.maxScroll) visit.maxScroll = percent;
      if (window.scrollY > 40) onInput();
      for (const mark of SCROLL_MARKS) {
        if (percent >= mark && !visit.scrollMarks.has(mark)) {
          visit.scrollMarks.add(mark);
          track('Scroll depth', { percent: mark });
        }
      }
    });
  }, { passive: true });

  // Sections reached: counted when a section fills a good part of the screen
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const name = (entry.target as HTMLElement).dataset.trackSection;
        if (!entry.isIntersecting || !name || visit.sections.includes(name)) return;
        addOnce(visit.sections, name);
        track('Section seen', { section: name });
      });
    },
    { threshold: 0, rootMargin: '-40% 0px -40% 0px' }
  );
  // Sections render with the app; observe them on the next frame
  requestAnimationFrame(() => document.querySelectorAll('[data-track-section]').forEach((el) => sectionObserver.observe(el)));
  cleanups.push(() => sectionObserver.disconnect());

  // Clicks: outbound links, and top bar navigation
  on(document, 'click', (e) => {
    const link = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!link) return;
    const href = link.getAttribute('href') ?? '';
    if (href.startsWith('#')) {
      if (link.closest('header')) track('Nav click', { target: href.slice(1) || 'top' });
      return;
    }
    const url = new URL(link.href, window.location.href);
    if (url.origin === window.location.origin) return;
    const name = linkName(url);
    addOnce(visit.links, name);
    const section = link.closest('header') ? 'top bar' : link.closest('[role=dialog]') ? 'project details' : link.closest('section')?.id ?? 'page';
    track('Link click', { link: name, section });
  }, { capture: true });

  // Leaving or switching away: send the summary while the page can still make requests
  on(document, 'visibilitychange', () => document.visibilityState === 'hidden' && sendSummary());
  on(window, 'pagehide', sendSummary);

  return () => cleanups.forEach((fn) => fn());
};
