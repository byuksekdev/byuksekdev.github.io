import { useState, useEffect, useRef } from 'react';
import { X, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import LazyVideo from './LazyVideo';

// Cards play a light 8s loop (preview.mp4 + preview.webp poster); the full gameplay.mp4 opens in the lightbox.
const previewOf = (videoUrl: string) => videoUrl.replace(/gameplay\.mp4$/, 'preview.mp4');
const posterOf = (videoUrl: string) => videoUrl.replace(/gameplay\.mp4$/, 'preview.webp');

// Every local screenshot /media/<game>/shot-N.<ext> has a 480px grid version shot-N-thumb.webp.
// The full-size file is only loaded in the lightbox.
const thumbOf = (url: string) =>
  url.startsWith('/media/') ? url.replace(/\.(webp|png|jpe?g)$/i, '-thumb.webp') : url;

interface Project {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  screenshots?: string[];
  videoUrl?: string;
  iosLink?: string;
  androidLink?: string;
  subGames?: {
    title: string;
    description: string;
    icon: string;
    videoUrl: string;
    screenshots: string[];
  }[];
}

type SubGame = NonNullable<Project['subGames']>[number];

const Projects = () => {
  const [lightboxMedia, setLightboxMedia] = useState<{ type: 'video' | 'image', src: string, title: string } | null>(null);

  const projects: Project[] = [
    {
      title: "Spark Win Cash",
      subtitle: "Skill-based Real Money Game",
      description: "A comprehensive gaming platform featuring multiple skill-based games where players can compete and win real money. Each game offers unique challenges and strategic gameplay.",
      icon: "/AppIcons/Spark.webp",
      subGames: [
        {
          title: "Match-3 Puzzle",
          description: `Match-3 puzzle game where players match three or more identical items to clear them from the board and complete level objectives.

          The game features a variety of boosters, booster combinations, and obstacles that add strategic depth to gameplay.
          Developed an advanced level editor to support both manual level creation and configurable tile-generation systems for dynamically spawned incoming tiles.`,
          icon: "/AppIcons/Match-3Puzzle.webp",
          videoUrl: "/media/match-3-puzzle/gameplay.mp4",
          screenshots: [
            "/media/match-3-puzzle/shot-1.webp",
            "/media/match-3-puzzle/shot-2.webp",
            "/media/match-3-puzzle/shot-3.webp",
            "/media/match-3-puzzle/shot-4.webp",
          ]
        },
        {
          title: "Bubble Shooter",
          description: `Bubble Shooter puzzle game where players shoot and match three or more bubbles of the same color to clear the board and complete level objectives.

          The game features a variety of boosters, including Rocket, Bomb, and Rainbow, along with a Double Score power-up that enhances score-based gameplay.

          Level configuration system was developed to support flexible level creation and control gameplay parameters, generation rules, and difficulty.`,
          icon: "/AppIcons/BubbleShooter.webp",
          videoUrl: "/media/bubble-shooter/gameplay.mp4",
          screenshots: [
            "/media/bubble-shooter/shot-1.webp",
            "/media/bubble-shooter/shot-2.webp",
            "/media/bubble-shooter/shot-3.webp",
            "/media/bubble-shooter/shot-4.webp",
          ]
        },
        {
          title: "8 Ball Pool",
          description: `A classic 8 Ball Pool game where players aim to pocket their assigned set of balls before sinking the 8 ball to win the match.

The game features realistic cue controls, ball physics and rule based win and foul conditions.`,
          icon: "/AppIcons/8Ball.webp",
          videoUrl: "/media/8-ball-pool/gameplay.mp4",
          screenshots: [
            "/media/8-ball-pool/shot-1.webp",
            "/media/8-ball-pool/shot-2.webp",
            "/media/8-ball-pool/shot-3.webp",
            "/media/8-ball-pool/shot-4.webp",
          ]
        },
        {
          title: "Blackjack 21",
          description: `Blackjack inspired card puzzle game where players clear card stacks by reaching 21, building five-card hands without exceeding 21, and using Wild Blackjack Cards strategically.

A custom deck generator was developed to create balanced deck layouts that support engaging gameplay, controlled difficulty progression, and varied level experiences.`,
          icon: "/AppIcons/Blackjack.webp",
          videoUrl: "/media/blackjack-21/gameplay.mp4",
          screenshots: [
            "/media/blackjack-21/shot-1.webp",
            "/media/blackjack-21/shot-2.webp",
            "/media/blackjack-21/shot-3.webp",
            "/media/blackjack-21/shot-4.webp",
          ]
        },
        {
          title: "Color Blocks",
          description: `Color based puzzle game where players send colored blocks to their matching doors to clear the board and complete level objectives.

The game features multiple block mechanics, including dual-color blocks, Ice Blocks, and blocks restricted to movement along a single axis.

Developed a custom level editor to support the creation of varied level layouts and puzzle configurations.`,
          icon: "/AppIcons/ColorBlocks.webp",
          videoUrl: "/media/color-blocks/gameplay.mp4",
          screenshots: [
            "/media/color-blocks/shot-1.webp",
            "/media/color-blocks/shot-2.webp",
            "/media/color-blocks/shot-3.webp",
            "/media/color-blocks/shot-4.webp",
          ]
        },
        {
          title: "2248",
          description: `Number connection puzzle game where players link tiles with matching values to create long chains and reach higher numbers.

          Developed a configurable tile generation system to control incoming tile patterns, values, and gameplay difficulty.`,
          icon: "/AppIcons/Link2248.webp",
          videoUrl: "/media/2248/gameplay.mp4",
          screenshots: [
            "/media/2248/shot-1.webp",
            "/media/2248/shot-2.webp",
            "/media/2248/shot-3.webp",
            "/media/2248/shot-4.webp",
          ]
        },
        {
          title: "Word Link",
          description: `Word puzzle game where players connect letters to form words and complete crossword-style grids.

          Developed a custom editor that supports both manual level creation and automatic level generation based on a word dataset.`,
          icon: "/AppIcons/WordLink.webp",
          videoUrl: "/media/word-link/gameplay.mp4",
          screenshots: [
            "/media/word-link/shot-1.jpg",
            "/media/word-link/shot-2.jpg",
            "/media/word-link/shot-3.jpg",
            "/media/word-link/shot-4.jpg",
          ]
        },
        {
          title: "TriPeaks Solitaire",
          description: `TriPeaks Solitaire game where players clear the board by selecting cards one value higher or lower than the current card.

The game features strategic deck management, streak-based scoring, Wild Cards, and level objectives designed to create varied gameplay challenges.`,
          icon: "/AppIcons/TripeakSolitaire.webp",
          videoUrl: "/media/tripeaks-solitaire/gameplay.mp4",
          screenshots: [
            "/media/tripeaks-solitaire/shot-1.jpg",
            "/media/tripeaks-solitaire/shot-2.jpg",
            "/media/tripeaks-solitaire/shot-3.jpg",
            "/media/tripeaks-solitaire/shot-4.jpg",
          ]
        },
        {
          title: "Shape Merge",
          description: `Shape merging puzzle game where players combine matching shapes to create higher level forms and reach the maximum shape level.
          
          Developed a configurable shape spawn system to control incoming shape types, spawn patterns, and gameplay difficulty.`,
          icon: "/AppIcons/ShapeMerge.webp",
          videoUrl: "/media/shape-merge/gameplay.mp4",
          screenshots: [
            "/media/shape-merge/shot-1.webp",
            "/media/shape-merge/shot-2.webp",
            "/media/shape-merge/shot-3.webp",
            "/media/shape-merge/shot-4.webp",
          ]
        }
      ],
      iosLink: "https://apps.apple.com/us/app/spark-win-cash/id6670211183"
    },
    {
      title: "Raft Adventure 3D",
      subtitle: "Survival Adventure Game",
      description: "Survive on a raft in the middle of the ocean! Collect resources, build your raft, and explore mysterious islands in this immersive 3D survival adventure.",
      icon: "/media/raft-adventure-3d/icon.webp",
      screenshots: [
        "/media/raft-adventure-3d/shot-1.webp",
        "/media/raft-adventure-3d/shot-2.webp",
        "/media/raft-adventure-3d/shot-3.webp",
        "/media/raft-adventure-3d/shot-4.webp"
      ],
      videoUrl: "/media/raft-adventure-3d/gameplay.mp4",
      iosLink: "https://apps.apple.com/us/app/fish-hunter-sea-adventure/id1665911252"
    },
    {
      title: "Dive Seeker",
      subtitle: "Underwater Exploration",
      description: "Explore the depths of the ocean in this breathtaking underwater adventure. Discover treasures, mysterious sea creatures, and hidden secrets of the deep.",
      icon: "/media/dive-seeker/icon.webp",
      screenshots: [
        "/media/dive-seeker/shot-1.jpg",
        "/media/dive-seeker/shot-2.jpg",
        "/media/dive-seeker/shot-3.jpg",
        "/media/dive-seeker/shot-4.jpg"
      ],
      videoUrl: "/media/dive-seeker/gameplay.mp4"
    },
    {
      title: "Fashion Cash",
      subtitle: "Business Simulation",
      description: "Build your fashion empire from the ground up! Design trendy clothes, manage your boutique, and become the ultimate fashion mogul in this addictive business sim.",
      icon: "/media/fashion-cash/icon.webp",
      screenshots: [
        "/media/fashion-cash/shot-1.webp",
        "/media/fashion-cash/shot-2.webp",
        "/media/fashion-cash/shot-3.webp",
        "/media/fashion-cash/shot-4.webp"
      ],
      videoUrl: "/media/fashion-cash/gameplay.mp4"
    },
    {
      title: "Potato Town",
      subtitle: "City Building & Management",
      description: "Build and manage your own potato-themed town! Grow crops, construct buildings, and create a thriving community in this charming city-building adventure.",
      icon: "/media/potato-town/icon.webp",
      screenshots: [
        "/media/potato-town/shot-1.webp",
        "/media/potato-town/shot-2.webp",
        "/media/potato-town/shot-3.webp",
        "/media/potato-town/shot-4.webp"
      ],
      videoUrl: "/media/potato-town/gameplay.mp4"
    }
  ];

  // One video from every game — flattened list for an at-a-glance overview.
  // Projects with sub-games produce one card per sub-game; otherwise the project itself.
  const overviewGames = projects.flatMap((project) =>
    project.subGames
      ? project.subGames.map((sub) => ({
          title: sub.title,
          icon: sub.icon,
          videoUrl: sub.videoUrl,
        }))
      : project.videoUrl
        ? [{ title: project.title, icon: project.icon, videoUrl: project.videoUrl }]
        : []
  );

  const overviewRef = useRef<HTMLDivElement>(null);

  const scrollOverview = (direction: 'left' | 'right') => {
    const el = overviewRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const openLightbox = (type: 'video' | 'image', src: string, title: string) => {
    setLightboxMedia({ type, src, title });
  };

  // Start the lightbox video right away; if the browser blocks autoplay with sound, fall back to muted
  const startPlayback = (video: HTMLVideoElement | null) => {
    if (!video) return;
    video.play().catch(() => {
      video.muted = true;
      video.play().catch(() => {});
    });
  };

  const closeLightbox = () => {
    setLightboxMedia(null);
  };

  // While lightbox is open: close on ESC + lock background scroll
  useEffect(() => {
    if (!lightboxMedia) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
    };
    document.addEventListener('keydown', onKey);
    document.documentElement.classList.add('overflow-hidden');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('overflow-hidden');
    };
  }, [lightboxMedia]);

  const renderMediaGrid = (project: Project, subGame?: SubGame) => {
    const videoUrl = subGame?.videoUrl ?? project.videoUrl ?? '';
    const screenshots = subGame?.screenshots ?? project.screenshots ?? [];
    const title = subGame?.title ?? project.title;

    return (
      <div className="flex flex-wrap justify-center gap-4">
        <div
          className="relative group/media overflow-hidden rounded-xl shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] w-[calc(50%-8px)] md:w-[calc(33.33%-11px)] lg:w-[calc(20%-13px)]"
          onClick={() => openLightbox('video', videoUrl, `${title} Gameplay`)}
        >
          <div className="relative bg-zinc-800/50 rounded-xl p-0.5 group-hover/media:ring-1 group-hover/media:ring-amber-500/30 transition-all duration-300">
            <div className="relative overflow-hidden rounded-lg">
              <LazyVideo
                src={previewOf(videoUrl)}
                poster={posterOf(videoUrl)}
                className="w-full aspect-[8/16]"
              />
            </div>
          </div>
        </div>

        {screenshots.map((screenshot: string, screenshotIndex: number) => (
          <div
            key={screenshotIndex}
            className="relative group/media overflow-hidden rounded-xl shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] w-[calc(50%-8px)] md:w-[calc(33.33%-11px)] lg:w-[calc(20%-13px)]"
            onClick={() => openLightbox('image', screenshot, `${title} Screenshot ${screenshotIndex + 1}`)}
          >
            <div className="relative bg-zinc-800/50 rounded-xl p-0.5 group-hover/media:ring-1 group-hover/media:ring-amber-500/30 transition-all duration-200">
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={thumbOf(screenshot)}
                  alt={`${title} Screenshot ${screenshotIndex + 1}`}
                  className="w-full aspect-[8/16] object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <section id="projects" className="pt-6 pb-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-4 mb-4">
              <h2 className="text-4xl md:text-5xl font-bold">
                <span className="text-[var(--text-primary)]">Works </span>
                <span className="text-[var(--accent)]">&</span>
                <span className="text-[var(--text-primary)]"> Projects</span>
              </h2>
            </div>
          </div>

          {/* ─── QUICK OVERVIEW ─── One video per game, horizontally scrollable */}
          <div className="mb-20 relative liquid-glass bg-[var(--bg-card)] rounded-3xl border border-[var(--border-card)] p-6 md:p-8">
            {/* Header row: label + title on the left, scroll arrows on the right */}
            <div className="flex items-end justify-between gap-4 mb-6">
              <div className="text-left">
                {/* <div className="inline-flex items-center gap-2 mb-3">
                 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent-border)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                    {overviewGames.length} GAMES
                  </span>
                </div>*/}
                <h3 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
                  Quick <span className="text-[var(--accent)]">Overview</span>
                </h3>
                <p className="text-[var(--text-secondary)] text-sm md:text-base mt-1.5 max-w-xl">
                  One clip from every game, tap any to watch full screen.
                </p>
              </div>

              <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => scrollOverview('left')}
                  aria-label="Scroll left"
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:text-[var(--accent)] hover:border-[var(--accent-border)] transition-colors duration-200"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollOverview('right')}
                  aria-label="Scroll right"
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:text-[var(--accent)] hover:border-[var(--accent-border)] transition-colors duration-200"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable strip + edge shadows (overflow hint) */}
            <div className="relative">
              {/* <div className="pointer-events-none absolute left-0 top-0 bottom-3 w-8 md:w-12 z-10 bg-gradient-to-r from-[var(--bg-page)] to-transparent rounded-l-2xl opacity-50" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-3 w-8 md:w-12 z-10 bg-gradient-to-l from-[var(--bg-page)] to-transparent rounded-r-2xl opacity-50" /> */}

              <div
                ref={overviewRef}
                className="overflow-x-auto overflow-y-hidden pb-3 snap-x snap-mandatory scroll-px-1"
              >
                <div className="flex gap-4 md:gap-5 w-max pl-4 md:pl-5 pr-0.5">
                  {overviewGames.map((game, overviewIndex) => (
                    <button
                      key={overviewIndex}
                      type="button"
                      onClick={() => openLightbox('video', game.videoUrl, `${game.title} Gameplay`)}
                      className="group/ov flex-shrink-0 w-40 md:w-48 snap-start text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-2xl"
                      aria-label={`${game.title} gameplay video`}
                    >
                      <div className="flex items-center gap-2.5 mb-3 px-0.5">
                        <img
                          src={game.icon}
                          alt={game.title}
                          className="w-9 h-9 object-cover shadow-md flex-shrink-0"
                          loading="lazy"
                          decoding="async"
                          style={{ borderRadius: '28%' }}
                        />
                        <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
                          {game.title}
                        </span>
                      </div>

                      <div className="relative overflow-hidden rounded-2xl border border-[var(--border-card)] bg-zinc-900/40 shadow-lg transition-all duration-300 group-hover/ov:border-amber-500/40 group-hover/ov:shadow-xl group-hover/ov:-translate-y-1">
                        <LazyVideo
                          src={previewOf(game.videoUrl)}
                          poster={posterOf(game.videoUrl)}
                          className="w-full aspect-[9/16]"
                        />

                        {/* Bottom darkening — contrast for the "Watch" badge */}
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />

                        {/* Always-visible small "Watch" badge — makes it clear this is a video */}
                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/55 backdrop-blur-sm transition-opacity duration-300 group-hover/ov:opacity-0">
                          <Play className="w-3 h-3 text-white fill-white" />
                          <span className="text-[10px] font-semibold tracking-wide text-white">WATCH</span>
                        </div>

                        {/* Highlighted play button centered on hover */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover/ov:opacity-100 transition-opacity duration-300">
                          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--accent)] shadow-lg shadow-amber-500/30">
                            <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile scroll hint */}
            <p className="md:hidden text-center text-xs text-[var(--text-secondary)] mt-3">
              Swipe to see more →
            </p>
          </div>

          <div className="space-y-20">
            {projects.map((project, index) => (
              <div key={index} className="group relative">
                <div className="relative">
                  <div className="relative liquid-glass liquid-glass-lift bg-[var(--bg-card)] rounded-3xl border border-[var(--border-card)] overflow-hidden">
                    <div className="relative p-8">
                      <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-4 mb-4">
                          <div className="relative">
                            <img
                              src={project.icon}
                              alt={project.title}
                              className="w-16 h-16 object-cover shadow-2xl"
                              loading="lazy"
                              decoding="async"
                              style={{
                                borderRadius: '30%',
                              }}
                            />
                          </div>
                          <h3 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">{project.title}</h3>
                        </div>

                        <p className="text-base text-[var(--text-muted)] font-medium mb-2">{project.subtitle}</p>
                        <p className="text-[var(--text-secondary)] text-base md:text-lg leading-relaxed max-w-3xl mx-auto mb-6 whitespace-pre-line">{project.description}</p>

                        {(project.iosLink || project.androidLink) && (
                          <div className="flex justify-center items-center space-x-4">
                            {project.iosLink && (
                              <a
                                href={project.iosLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="app-store-btn"
                              >
                                <img
                                  src="/apple-badge.0e21ce91.png"
                                  alt="Download on the App Store"
                                  className="h-12 w-auto"
                                />
                              </a>
                            )}
                            {project.androidLink && (
                              <a
                                href={project.androidLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="app-store-btn"
                              >
                                <img
                                  src="/google-badge.78b7ab97.png"
                                  alt="Get it on Google Play"
                                  className="h-12 w-auto"
                                />
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      {project.subGames && (
                        <div className="space-y-12 mb-12">
                          {project.subGames.map((subGame, subGameIndex) => (
                            <div key={subGameIndex} className="liquid-glass-soft bg-[var(--bg-card)] rounded-2xl border border-[var(--border-card)] overflow-hidden">
                              <div className="p-6 md:p-8">
                                <div className="text-center mb-6">
                                  <div className="flex items-center justify-center gap-4 mb-4">
                                    <div className="relative">
                                      <img
                                        src={subGame.icon}
                                        alt={subGame.title}
                                        className="w-16 h-16 object-cover shadow-lg"
                                        loading="lazy"
                                        decoding="async"
                                        style={{
                                          borderRadius: '30%',
                                        }}
                                      />
                                    </div>
                                    <h4 className="text-2xl md:text-3xl font-bold text-[var(--accent)]">{subGame.title}</h4>
                                  </div>
                                  <p className="text-[var(--text-muted)] text-base md:text-lg leading-relaxed max-w-4xl mx-auto whitespace-pre-line">{subGame.description}</p>
                                </div>

                                {renderMediaGrid(project, subGame)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {!project.subGames && renderMediaGrid(project)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {lightboxMedia && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={lightboxMedia.title}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeLightbox}
              className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors duration-200 z-10 drop-shadow"
            >
              <X className="w-8 h-8" />
            </button>

            <div
              className="relative bg-black rounded-lg overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {lightboxMedia.type === 'video' ? (
                <video
                  key={lightboxMedia.src}
                  ref={startPlayback}
                  className="max-w-full max-h-[80vh] w-auto h-auto"
                  controls
                  autoPlay
                  preload="auto"
                  playsInline
                >
                  <source
                    src={lightboxMedia.src}
                    type={lightboxMedia.src.toLowerCase().includes('.mov') ? 'video/quicktime' : 'video/mp4'}
                  />
                </video>
              ) : (
                <img
                  src={lightboxMedia.src}
                  alt={lightboxMedia.title}
                  className="max-w-full max-h-[80vh] w-auto h-auto object-contain"
                  loading="lazy"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Projects;