// Thin wrapper around Umami (cookieless analytics, loaded in index.html).
// The script is deferred and only active on the live domain, so every call is safe to make
// at any time: it waits briefly for Umami to load and silently does nothing if it never does.

type EventData = Record<string, string | number>;

declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: EventData) => void;
    };
  }
}

const whenReady = (fn: () => void, tries = 20) => {
  if (window.umami) fn();
  else if (tries > 0) setTimeout(() => whenReady(fn, tries - 1), 500);
};

export const track = (event: string, data?: EventData) => whenReady(() => window.umami?.track(event, data));

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

/** Tracks every outbound link click (résumé, LinkedIn, GitHub, email, App Store) with the section it was clicked in. */
export const initAnalytics = () => {
  const onClick = (e: MouseEvent) => {
    const link = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!link || link.getAttribute('href')?.startsWith('#')) return;
    const url = new URL(link.href, window.location.href);
    if (url.origin === window.location.origin) return;
    const section = link.closest('header') ? 'top bar' : link.closest('[role=dialog]') ? 'project details' : link.closest('section')?.id ?? 'page';
    track('Link click', { link: linkName(url), section });
  };
  document.addEventListener('click', onClick, true);
  return () => document.removeEventListener('click', onClick, true);
};
