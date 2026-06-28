import React, { useEffect, useRef, useState } from 'react';

interface LazyVideoProps {
  src: string;
  poster?: string;
  className?: string;
  type?: string;
  /** Cloudinary teslim genişliği (px). Küçük kartlarda küçük tut. */
  width?: number;
}

const inferType = (src: string) =>
  src.toLowerCase().includes('.mov') ? 'video/quicktime' : 'video/mp4';

const isCloudinaryVideo = (url: string) =>
  url.includes('res.cloudinary.com') && url.includes('/video/upload/');

// Cloudinary video URL'sine boyut/format/kalite optimizasyonu enjekte eder.
// Zaten dönüştürülmüş veya Cloudinary olmayan URL'lere dokunmaz.
export const optimizeVideo = (url: string, width: number) => {
  if (!isCloudinaryVideo(url)) return url;
  if (/\/upload\/[^/]*(?:f_|q_|w_)/.test(url)) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
};

// Videonun ilk karesini küçük bir jpg poster olarak üretir (gerçek oyun görüntüsü).
export const videoPoster = (url: string, width: number): string | undefined => {
  if (!isCloudinaryVideo(url)) return undefined;
  const withTransform = url.replace(
    '/upload/',
    `/upload/so_0,f_auto,q_auto,w_${width}/`
  );
  return withTransform.replace(/\.(mp4|mov|webm)(\?.*)?$/i, '.jpg$2');
};

const LazyVideo: React.FC<LazyVideoProps> = ({
  src,
  poster,
  className,
  type,
  width = 480,
}) => {
  const sourceType = type ?? inferType(src);
  const optimizedSrc = optimizeVideo(src, width);
  const resolvedPoster = poster ?? videoPoster(src, width);

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
        {shouldLoad && <source src={optimizedSrc} type={sourceType} />}
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
