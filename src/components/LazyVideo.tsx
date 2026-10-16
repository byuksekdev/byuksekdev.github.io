import React, { useEffect, useRef, useState } from 'react';

interface LazyVideoProps {
  src: string;
  poster?: string;
  className?: string;
  type?: string;
}

const inferType = (src: string) =>
  src.toLowerCase().includes('.mov') ? 'video/quicktime' : 'video/mp4';

// /media/<oyun>/gameplay.mp4 videolarının ilk karesi aynı klasörde poster.webp olarak durur.
export const videoPoster = (url: string): string | undefined =>
  url.startsWith('/media/') ? url.replace(/[^/]+\.mp4$/i, 'poster.webp') : undefined;

const LazyVideo: React.FC<LazyVideoProps> = ({
  src,
  poster,
  className,
  type,
}) => {
  const sourceType = type ?? inferType(src);
  const resolvedPoster = poster ?? videoPoster(src);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const shouldLoadRef = useRef(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { rootMargin: '150px 0px', threshold: 0.01 }
    );

    observer.observe(el);

    // Sekme arka plandayken oynatmayı durdur (CPU/batarya tasarrufu)
    const onVisibility = () => {
      if (document.hidden) el.pause();
      else if (shouldLoadRef.current) el.play().catch(() => {});
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  useEffect(() => {
    shouldLoadRef.current = shouldLoad;
    const el = videoRef.current;
    if (shouldLoad && el) {
      el.load();
      el.play().catch(() => {});
    }
  }, [shouldLoad]);

  return (
    <div className={`relative overflow-hidden ${className ?? ''}`}>
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        poster={resolvedPoster}
        muted
        loop
        playsInline
        preload="none"
        onLoadedData={() => setIsReady(true)}
        onCanPlay={() => setIsReady(true)}
      >
        {shouldLoad && <source src={src} type={sourceType} />}
      </video>

      {/* Yükleniyor katmanı: video oynamaya hazır olunca yumuşakça kaybolur */}
      <div
        className={`absolute inset-0 flex items-center justify-center bg-zinc-900/35 backdrop-blur-[1px] transition-opacity duration-500 ${
          isReady ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        aria-hidden="true"
      >
        {/* Soldan sağa kayan parıltı (shimmer) */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_1.8s_infinite]" />
        </div>
        {/* Dönen accent spinner */}
        <span className="relative w-8 h-8 rounded-full border-2 border-white/20 border-t-[var(--accent)] animate-spin" />
      </div>
    </div>
  );
};

export default LazyVideo;
