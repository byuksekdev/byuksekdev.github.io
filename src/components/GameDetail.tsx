import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Maximize2, Play, X } from 'lucide-react';
import LazyVideo from './LazyVideo';
import { mediaOpened, projectClosed, projectOpened, setVideoPlaying, videoWatched } from '../lib/analytics';

export interface GameEntry {
  title: string;
  icon: string;
  /** Optional: an in-app feature may only have screenshots. */
  videoUrl?: string;
  /** More gameplay videos shown next to the main one (e.g. several offer types). */
  extraVideos?: string[];
  screenshots: string[];
  description: string;
  /** Standalone titles have their own subtitle (e.g. "Survival Adventure Game"). */
  subtitle?: string;
  /** Games that ship inside a platform (Spark Win Cash) link back to it. */
  platform?: { title: string; subtitle: string; icon: string; iosLink?: string };
  iosLink?: string;
  androidLink?: string;
  /** In-app features (Plinko, offers, …) are labelled as such in the panel. */
  kind?: 'game' | 'feature';
}

interface GameDetailProps {
  games: GameEntry[];
  index: number;
  onNavigate: (index: number) => void;
  onClose: () => void;
}

type Media = { type: 'video' | 'image'; src: string; thumb: string };

// gameplay.mp4 → preview.mp4 / preview.webp, gameplay-2.mp4 → preview-2.mp4 / preview-2.webp
const previewOf = (videoUrl: string) => videoUrl.replace(/gameplay(-\d+)?\.mp4$/, 'preview$1.mp4');
const posterOf = (videoUrl: string) => videoUrl.replace(/gameplay(-\d+)?\.mp4$/, 'preview$1.webp');
const thumbOf = (url: string) => url.replace(/\.(webp|png|jpe?g)$/i, '-thumb.webp');

// Start the video right away; if the browser blocks autoplay with sound, fall back to muted
const startPlayback = (video: HTMLVideoElement | null) => {
  if (!video) return;
  video.play().catch(() => {
    video.muted = true;
    video.play().catch(() => {});
  });
};

const StoreBadges = ({ iosLink, androidLink }: { iosLink?: string; androidLink?: string }) =>
  iosLink || androidLink ? (
    <div className="flex flex-wrap items-center gap-3">
      {iosLink && (
        <a href={iosLink} target="_blank" rel="noopener noreferrer" className="app-store-btn">
          <img src="/apple-badge.0e21ce91.png" alt="Download on the App Store" className="h-11 w-auto" />
        </a>
      )}
      {androidLink && (
        <a href={androidLink} target="_blank" rel="noopener noreferrer" className="app-store-btn">
          <img src="/google-badge.78b7ab97.png" alt="Get it on Google Play" className="h-11 w-auto" />
        </a>
      )}
    </div>
  ) : null;

const navButton =
  'flex h-9 items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] text-sm text-white/75 transition-colors hover:border-[var(--accent-border)] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]';

/**
 * Panel for one game: details on top, gameplay video and screenshots side by side below.
 * Any tile opens full size in a viewer inside the panel.
 */
const GameDetail = ({ games, index, onNavigate, onClose }: GameDetailProps) => {
  const game = games[index];
  const media: Media[] = [
    ...[game.videoUrl, ...(game.extraVideos ?? [])]
      .filter((v): v is string => !!v)
      .map((src) => ({ type: 'video' as const, src, thumb: posterOf(src) })),
    ...game.screenshots.map((src) => ({ type: 'image' as const, src, thumb: thumbOf(src) })),
  ];
  const videoCount = media.filter((m) => m.type === 'video').length;
  const [viewing, setViewing] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  // Plain string so the effect below runs once per game, not on every re-render
  const viewGroup = game.kind === 'feature' ? 'In-app feature' : game.platform ? game.platform.title : 'Other project';

  // New game: close the viewer, scroll back to the top, and count the view (also when paging with Next/Previous).
  // When the visitor moves on or closes the panel, record how long they spent on this game.
  useEffect(() => {
    setViewing(null);
    scrollRef.current?.scrollTo({ top: 0 });
    projectOpened(game.title, viewGroup);
    const openedAt = performance.now();
    return () => projectClosed(game.title, (performance.now() - openedAt) / 1000);
  }, [index, game.title, viewGroup]);

  // Opening a tile full size: which game, and whether it was a video or a screenshot.
  // For a video, record how much of it was actually played once the visitor moves on.
  const viewerVideo = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    if (viewing === null) return;
    const isVideo = media[viewing]?.type === 'video';
    mediaOpened(game.title, isVideo ? 'video' : 'screenshot');
    if (!isVideo) return;
    const video = viewerVideo.current;
    return () => {
      setVideoPlaying(false);
      videoWatched(game.title, video);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when a new tile is opened
  }, [viewing]);

  // Background scroll locked while open; focus returns to the opener on close
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.documentElement.classList.add('overflow-hidden');
    return () => {
      document.documentElement.classList.remove('overflow-hidden');
      opener?.focus?.();
    };
  }, []);

  // Esc closes the viewer first, then the panel. ←/→ page through media in the viewer, otherwise through games.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (viewing !== null) setViewing(null);
        else onClose();
      }
      const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!dir) return;
      if (viewing !== null) setViewing((viewing + dir + media.length) % media.length);
      else onNavigate((index + dir + games.length) % games.length);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [viewing, media.length, index, games.length, onClose, onNavigate]);

  const shown = viewing !== null ? media[viewing] : null;
  const iosLink = game.iosLink; // Spark games link to the platform from the Spark block, not from each game

  // Rendered into <body> so it sits above the fixed top bar (main has its own stacking context)
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-detail-title"
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-full w-full max-w-6xl flex-col overflow-hidden border border-[var(--border-card)] bg-[rgba(24,24,27,0.96)] shadow-2xl sm:h-auto sm:max-h-[94vh] sm:rounded-3xl"
      >
        {/* Top bar: position, game switcher, close */}
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3 sm:px-6">
          <span className="text-xs font-medium tabular-nums text-[var(--text-secondary)]">
            {index + 1} / {games.length}
          </span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => onNavigate((index - 1 + games.length) % games.length)} className={`${navButton} pl-2 pr-3`} aria-label="Previous game">
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>
            <button type="button" onClick={() => onNavigate((index + 1) % games.length)} className={`${navButton} pl-3 pr-2`} aria-label="Next game">
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-white/80 transition-colors hover:bg-white/[0.12] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 md:p-8">
            {/* Details */}
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-10">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-4">
                  <img src={game.icon} alt="" className="h-16 w-16 flex-shrink-0 object-cover shadow-lg md:h-[72px] md:w-[72px]" style={{ borderRadius: '28%' }} />
                  <div className="min-w-0">
                    <h3 id="game-detail-title" className="text-2xl font-bold text-[var(--accent)] md:text-3xl">
                      {game.title}
                    </h3>
                    {game.subtitle && <p className="mt-0.5 text-[var(--text-secondary)]">{game.subtitle}</p>}
                    {(game.platform || game.kind === 'feature') && (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {game.platform && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] py-0.5 pl-0.5 pr-2.5 text-xs font-medium text-[var(--text-muted)]">
                            <img src={game.platform.icon} alt="" className="h-5 w-5" style={{ borderRadius: '30%' }} />
                            {game.platform.title}
                          </span>
                        )}
                        {game.kind === 'feature' && (
                          <span className="inline-flex rounded-full border border-[var(--accent-border)] bg-[var(--accent-bg)] px-2.5 py-0.5 text-xs font-semibold text-[var(--accent)]">
                            In-app feature
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-[var(--text-muted)]">{game.description}</p>
              </div>
              {iosLink || game.androidLink ? (
                <div className="flex-shrink-0">
                  <StoreBadges iosLink={iosLink} androidLink={game.androidLink} />
                </div>
              ) : null}
            </div>

            {/* Media, side by side. Video tile loops the light preview; full video with sound opens in the viewer. */}
            <div className="-mx-4 mt-7 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 md:overflow-visible">
              <div className={`flex w-max gap-3 md:grid md:w-auto md:gap-4 ${media.length > 5 ? 'md:grid-cols-6' : 'md:grid-cols-5'}`}>
                {media.map((m, i) => (
                  <button
                    key={m.src}
                    type="button"
                    onClick={() => setViewing(i)}
                    aria-label={m.type === 'video' ? `Open gameplay video${videoCount > 1 ? ` ${i + 1}` : ''}` : `Open screenshot ${i + 1 - videoCount}`}
                    className="group/tile relative w-[42vw] max-w-[200px] overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] md:w-auto md:max-w-none"
                  >
                    {m.type === 'video' ? (
                      <LazyVideo src={previewOf(m.src)} poster={m.thumb} className="aspect-[9/16] w-full" />
                    ) : (
                      <img src={m.thumb} alt="" className="aspect-[9/16] w-full object-cover" loading="lazy" decoding="async" />
                    )}
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover/tile:bg-black/30">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent)] text-black opacity-0 shadow-lg shadow-amber-500/30 transition-opacity duration-300 group-hover/tile:opacity-100">
                        {m.type === 'video' ? <Play className="ml-0.5 h-5 w-5 fill-black" /> : <Maximize2 className="h-4 w-4" />}
                      </span>
                    </span>
                    {m.type === 'video' && (
                      <span className="pointer-events-none absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-1 backdrop-blur-sm">
                        <Play className="h-3 w-3 fill-white text-white" />
                        <span className="text-[10px] font-semibold tracking-wide text-white">GAMEPLAY</span>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Full-size viewer, inside the panel */}
        {shown && viewing !== null && (
          <div
            className="absolute inset-0 z-10 flex flex-col bg-black/95"
            onClick={() => setViewing(null)}
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              // Swipe left/right to page through media on touch screens
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              touchX.current = null;
              if (Math.abs(dx) > 50) setViewing((viewing + (dx < 0 ? 1 : -1) + media.length) % media.length);
            }}
          >
            <div className="flex items-center justify-between px-4 py-3 sm:px-6" onClick={(e) => e.stopPropagation()}>
              <span className="text-xs font-medium tabular-nums text-white/60">
                {viewing + 1} / {media.length}
              </span>
              <button
                type="button"
                onClick={() => setViewing(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.08] text-white/85 transition-colors hover:bg-white/[0.15] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                aria-label="Back to details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6 sm:px-16">
              {media.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setViewing((viewing - 1 + media.length) % media.length); }}
                    className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/[0.08] text-white/85 transition-colors hover:bg-white/[0.15] sm:left-4"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setViewing((viewing + 1) % media.length); }}
                    className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/[0.08] text-white/85 transition-colors hover:bg-white/[0.15] sm:right-4"
                    aria-label="Next"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              <div className="flex h-full max-h-full items-center justify-center" onClick={(e) => e.stopPropagation()}>
                {shown.type === 'video' ? (
                  <video
                    key={shown.src}
                    ref={(el) => {
                      viewerVideo.current = el;
                      startPlayback(el);
                    }}
                    onPlay={() => setVideoPlaying(true)}
                    onPause={() => setVideoPlaying(false)}
                    className="max-h-full max-w-full rounded-2xl bg-black"
                    controls
                    autoPlay
                    playsInline
                    preload="auto"
                    poster={shown.thumb}
                  >
                    <source src={shown.src} type="video/mp4" />
                  </video>
                ) : (
                  <img key={shown.src} src={shown.src} alt={`${game.title} screenshot`} className="max-h-full max-w-full rounded-2xl object-contain" decoding="async" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default GameDetail;
