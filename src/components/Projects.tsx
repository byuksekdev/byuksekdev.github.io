import { useCallback, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import LazyVideo from './LazyVideo';
import GameDetail from './GameDetail';
import type { GameEntry } from './GameDetail';

// Cards play a light 8s loop (preview.mp4 + preview.webp poster); the full gameplay.mp4 plays in the detail panel.
const previewOf = (videoUrl: string) => videoUrl.replace(/gameplay\.mp4$/, 'preview.mp4');
const posterOf = (videoUrl: string) => videoUrl.replace(/gameplay\.mp4$/, 'preview.webp');

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
  /** In-app features of a platform (reward mini-games, offers, events). Video is optional. */
  features?: {
    title: string;
    description: string;
    icon: string;
    videoUrl?: string;
    extraVideos?: string[];
    screenshots: string[];
  }[];
}

const Projects = () => {
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
          title: "Can Smash",
          description: `Physics-based game where players fire balls from a cannon to knock down towering stacks of cans and blocks and clear the platform.

Each level brings a new structure to topple, with a limited number of balls and a time bonus for clearing the stage quickly.`,
          icon: "/AppIcons/CanSmash.webp",
          videoUrl: "/media/can-smash/gameplay.mp4",
          screenshots: [
            "/media/can-smash/shot-1.webp",
            "/media/can-smash/shot-2.webp",
            "/media/can-smash/shot-3.webp",
            "/media/can-smash/shot-4.webp",
          ]
        },
        {
          title: "Pixel Blast",
          description: `Color-matching puzzle game where players send numbered shooters onto a conveyor track around a pixel-art picture. Each shooter blasts the pixels of its own color until the whole picture is cleared.

Players decide which shooters to deploy and manage a limited number of track slots, with every level built around a new pixel-art image.`,
          icon: "/AppIcons/PixelBlast.webp",
          videoUrl: "/media/pixel-blast/gameplay.mp4",
          screenshots: [
            "/media/pixel-blast/shot-1.webp",
            "/media/pixel-blast/shot-2.webp",
            "/media/pixel-blast/shot-3.webp",
            "/media/pixel-blast/shot-4.webp",
          ]
        },
        {
          title: "Rotate Rings",
          description: `Color-matching puzzle game where players rotate interlocking rings and arcs to bring same-colored pieces together and clear them from the board.

Levels mix different ring layouts and connectors, and clearing pieces in quick succession builds a score multiplier.`,
          icon: "/AppIcons/RotateRings.webp",
          videoUrl: "/media/rotate-rings/gameplay.mp4",
          screenshots: [
            "/media/rotate-rings/shot-1.webp",
            "/media/rotate-rings/shot-2.webp",
            "/media/rotate-rings/shot-3.webp",
            "/media/rotate-rings/shot-4.webp",
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
        },
        {
          title: "Word Search",
          description: `Word search puzzle game where players swipe across a letter grid to find every word from a themed list, such as School, Jobs or Ocean.

Words can run horizontally, vertically or diagonally, and finding them in quick succession builds a score multiplier.`,
          icon: "/AppIcons/WordSearch.webp",
          videoUrl: "/media/word-search/gameplay.mp4",
          screenshots: [
            "/media/word-search/shot-1.webp",
            "/media/word-search/shot-2.webp",
            "/media/word-search/shot-3.webp",
            "/media/word-search/shot-4.webp",
          ]
        }
      ],
      features: [
        {
          title: "Side Mechanics",
          description: `Reward mini-games and live events inside Spark that keep players coming back between matches.

Includes Plinko, where players drop balls through a peg board for gems and cash with free-ball bonuses and a level-up track; a daily Spin Wheel; and seasonal events such as Christmas Craze.`,
          icon: "/AppIcons/SideMechanics.webp",
          videoUrl: "/media/side-mechanics/gameplay.mp4",
          screenshots: [
            "/media/side-mechanics/shot-1.webp",
            "/media/side-mechanics/shot-2.webp",
            "/media/side-mechanics/shot-3.webp",
            "/media/side-mechanics/shot-4.webp",
          ]
        },
        {
          title: "Season Pass",
          description: `Progression system where players earn pass points from matches and offers to unlock rewards on a free track, with a premium Golden Pass track for bigger prizes.

Built to run as themed seasons, such as the Sparky, Halloween and Christmas passes, each with its own visuals and reward chests.`,
          icon: "/AppIcons/SeasonPass.webp",
          videoUrl: "/media/season-pass/gameplay.mp4",
          screenshots: [
            "/media/season-pass/shot-1.webp",
            "/media/season-pass/shot-2.webp",
            "/media/season-pass/shot-3.webp",
            "/media/season-pass/shot-4.webp",
          ]
        },
        {
          title: "Offers",
          description: `Limited-time offer events inside Spark, each with its own theme, reward track and grand prize.

Includes progression offers such as Party Night and Soul Hunt, step-by-step bundles like Jungle Safari, tiered packs such as Kickoff Picks, and choice offers like Pick One.`,
          icon: "/AppIcons/Offers.webp",
          videoUrl: "/media/offers/gameplay.mp4",
          extraVideos: ["/media/offers/gameplay-2.mp4"],
          screenshots: [
            "/media/offers/shot-1.webp",
            "/media/offers/shot-2.webp",
            "/media/offers/shot-3.webp",
          ]
        },
        {
          title: "Challenges",
          description: `Goal-based challenge events inside Spark that reward players for playing across games, with a grand prize at the end of each event.

Includes game-specific challenges like the Bubble Shooter Challenge, Cash Climb and Gem Trade challenges, journey events such as Ocean Odyssey and Christmas Journey, and Sparky Levels progression.`,
          icon: "/AppIcons/Challenges.webp",
          screenshots: [
            "/media/challenges/shot-1.webp",
            "/media/challenges/shot-2.webp",
            "/media/challenges/shot-3.webp",
            "/media/challenges/shot-4.webp",
            "/media/challenges/shot-5.webp",
            "/media/challenges/shot-6.webp",
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

  // Spark is the platform: its games and in-app features are shown together in one block.
  // Everything else is a standalone title. The detail panel pages through all of them in on-screen order.
  const spark = projects.find((p) => p.subGames)!;
  const sparkLink = { title: spark.title, subtitle: spark.subtitle, icon: spark.icon, iosLink: spark.iosLink };
  const sparkGames: GameEntry[] = (spark.subGames ?? []).map((g) => ({ ...g, platform: sparkLink }));
  const sparkFeatures: GameEntry[] = (spark.features ?? []).map((f) => ({ ...f, platform: sparkLink, kind: 'feature' }));
  const otherGames: GameEntry[] = projects
    .filter((p) => !p.subGames && p.videoUrl)
    .map((p) => ({
      title: p.title,
      subtitle: p.subtitle,
      icon: p.icon,
      videoUrl: p.videoUrl,
      screenshots: p.screenshots ?? [],
      description: p.description,
      iosLink: p.iosLink,
      androidLink: p.androidLink,
    }));
  const allEntries = [...sparkGames, ...sparkFeatures, ...otherGames];

  const [activeGame, setActiveGame] = useState<number | null>(null);
  const closeDetail = useCallback(() => setActiveGame(null), []);

  // Each card is the game's own little space: gameplay loop on top, a footer with its big icon
  // overlapping the video edge, the title and a "View details" cue. The whole card opens the detail panel.
  const renderCard = (entry: GameEntry) => {
    const index = allEntries.indexOf(entry);
    return (
      <button
        key={entry.title}
        type="button"
        onClick={() => setActiveGame(index)}
        className="group/ov flex flex-col overflow-hidden rounded-2xl border border-[var(--border-card)] bg-gradient-to-b from-white/[0.05] to-white/[0.015] text-left shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-xl hover:shadow-black/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] w-[calc((100%-1rem)/2)] sm:w-[calc((100%-2*1rem)/3)] md:w-[calc((100%-4*1rem)/5)] xl:w-[calc((100%-4*1.25rem)/5)]"
        aria-label={`${entry.title}: gameplay and details`}
      >
        <div className="relative bg-zinc-900/40">
          {entry.videoUrl ? (
            <LazyVideo
              src={previewOf(entry.videoUrl)}
              poster={posterOf(entry.videoUrl)}
              className="w-full aspect-[9/16]"
            />
          ) : (
            <img
              src={entry.screenshots[0]?.replace(/\.(webp|png|jpe?g)$/i, '-thumb.webp')}
              alt=""
              className="w-full aspect-[9/16] object-cover"
              loading="lazy"
              decoding="async"
            />
          )}
          {/* Soft fade into the footer so the overlapping icon sits on a calm background */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-zinc-900/80 to-transparent" />
        </div>

        <div className="relative flex items-start gap-2.5 px-2.5 pb-3.5 md:gap-3 md:px-3.5 md:pb-4">
          <img
            src={entry.icon}
            alt=""
            width={64}
            height={64}
            className="-mt-4 h-12 w-12 flex-shrink-0 object-cover shadow-lg shadow-black/50 transition-transform duration-300 group-hover/ov:scale-105 md:-mt-5 md:h-16 md:w-16"
            loading="lazy"
            decoding="async"
            style={{ borderRadius: '28%' }}
          />
          <div className="min-w-0 flex-1 pt-3 md:pt-4">
            <p className="line-clamp-2 text-[13px] font-bold leading-tight text-[var(--text-primary)] md:text-[15px]">{entry.title}</p>
            <p className="mt-1 flex items-center whitespace-nowrap text-xs font-medium md:text-[13px] text-[var(--text-secondary)] transition-colors duration-300 group-hover/ov:text-[var(--accent)]">
              <span className="sm:hidden">Details</span>
              <span className="hidden sm:inline">View details</span>
              <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4 transition-transform duration-300 group-hover/ov:translate-x-0.5" />
            </p>
          </div>
        </div>
      </button>
    );
  };

  const renderGrid = (entries: GameEntry[]) => (
    <div className="flex flex-wrap justify-center gap-4 xl:gap-5">{entries.map(renderCard)}</div>
  );

  const groupLabel = (label: string, count: number) => (
    <div className="flex items-center gap-3 mb-5">
      <h4 className="text-lg md:text-xl font-bold text-[var(--text-primary)]">{label}</h4>
      <span className="rounded-full border border-[var(--border-card)] bg-white/[0.04] px-2.5 py-0.5 text-xs font-semibold text-[var(--text-secondary)]">
        {count}
      </span>
      <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
    </div>
  );

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

          <div className="space-y-10">
            {/* ─── SPARK WIN CASH ─── platform header, its games and in-app features */}
            <div className="relative liquid-glass bg-[var(--bg-card)] rounded-3xl border border-[var(--border-card)] p-5 md:p-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between mb-8">
                <div className="flex items-center gap-4">
                  <img
                    src={spark.icon}
                    alt=""
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover shadow-2xl flex-shrink-0"
                    style={{ borderRadius: '30%' }}
                  />
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">{spark.title}</h3>
                    <p className="text-[var(--text-secondary)]">{spark.subtitle}</p>
                  </div>
                </div>
                {spark.iosLink && (
                  <a href={spark.iosLink} target="_blank" rel="noopener noreferrer" className="app-store-btn self-start md:self-center">
                    <img src="/apple-badge.0e21ce91.png" alt="Download on the App Store" className="h-11 w-auto" />
                  </a>
                )}
              </div>
              <p className="text-[var(--text-muted)] text-sm md:text-base leading-relaxed max-w-3xl -mt-3 mb-8">{spark.description}</p>

              {groupLabel('Games', sparkGames.length)}
              {renderGrid(sparkGames)}

              {sparkFeatures.length > 0 && (
                <div className="mt-10">
                  {groupLabel('In-app features', sparkFeatures.length)}
                  {renderGrid(sparkFeatures)}
                </div>
              )}
            </div>

            {/* ─── OTHER PROJECTS ─── */}
            <div className="relative liquid-glass bg-[var(--bg-card)] rounded-3xl border border-[var(--border-card)] p-5 md:p-8">
              {groupLabel('Other Projects', otherGames.length)}
              {renderGrid(otherGames)}
            </div>
          </div>
        </div>
      </section>

      {activeGame !== null && (
        <GameDetail games={allEntries} index={activeGame} onNavigate={setActiveGame} onClose={closeDetail} />
      )}
    </>
  );
};

export default Projects;
