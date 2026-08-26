'use client';

import { useState, useRef, useEffect } from 'react';
import { ImageOff, X, Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';

const CATEGORIES: Record<string, string> = {
  SAUNA: 'Sauna',
  PISCINA: 'Piscina',
  ALUGUEL: 'Aluguel',
  FESTAS: 'Festas',
  AREA_EXTERNA: 'Área Externa',
  GERAL: 'Geral',
};

const TABS = [
  { key: 'ALL', label: 'Todos' },
  ...Object.entries(CATEGORIES).map(([key, label]) => ({ key, label })),
];

interface SerializedImage {
  id: string;
  title: string | null;
  description: string | null;
  url: string;
  category: string;
  published: boolean;
  sortOrder: number;
}

function isVideoUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('data:video')) return true;
  if (/\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i.test(url)) return true;
  return false;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  return match ? match[1] : null;
}

function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

function MediaThumbnail({ image, className }: { image: SerializedImage; className?: string }) {
  const ytId = getYouTubeId(image.url);
  const vimeoId = getVimeoId(image.url);

  if (ytId) {
    return (
      <div className={`relative ${className}`}>
        <img
          src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
          alt={image.title || 'YouTube'}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="%23000" width="200" height="200"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23fff" font-size="12" font-family="sans-serif">YouTube</text></svg>');
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 shadow-lg">
            <Play className="h-6 w-6 text-white ml-0.5" fill="currentColor" />
          </div>
        </div>
      </div>
    );
  }

  if (vimeoId) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex h-full w-full items-center justify-center bg-[#1ab7ea]">
          <Play className="h-12 w-12 text-white" fill="currentColor" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1ab7ea] shadow-lg">
            <Play className="h-6 w-6 text-white ml-0.5" fill="currentColor" />
          </div>
        </div>
      </div>
    );
  }

  if (isVideoUrl(image.url)) {
    return (
      <div className={`relative ${className}`}>
        <video src={image.url} className="h-full w-full object-cover" muted preload="metadata" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg">
            <Play className="h-6 w-6 text-dark-900 ml-0.5" fill="currentColor" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <img
      src={image.url}
      alt={image.title || 'Galeria'}
      className={`h-full w-full object-cover ${className || ''}`}
      loading="lazy"
      onError={(e) => {
        (e.target as HTMLImageElement).src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="%23f3f4f6" width="200" height="200"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="11" font-family="sans-serif">Indisponível</text></svg>');
      }}
    />
  );
}

function MediaLightbox({ image, onClose }: { image: SerializedImage; onClose: () => void }) {
  const ytId = getYouTubeId(image.url);
  const vimeoId = getVimeoId(image.url);

  if (ytId) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
        className="h-[70vh] w-full max-w-4xl rounded-2xl"
        allow="autoplay; encrypted-media"
        allowFullScreen
      />
    );
  }

  if (vimeoId) {
    return (
      <iframe
        src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1`}
        className="h-[70vh] w-full max-w-4xl rounded-2xl"
        allow="autoplay; encrypted-media"
        allowFullScreen
      />
    );
  }

  if (isVideoUrl(image.url)) {
    return (
      <video
        src={image.url}
        controls
        autoPlay
        className="max-h-[80vh] w-auto rounded-2xl"
      />
    );
  }

  return (
    <img
      src={image.url}
      alt={image.title || 'Galeria'}
      className="max-h-[80vh] w-auto rounded-2xl object-contain"
      onError={(e) => {
        (e.target as HTMLImageElement).src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="%23111" width="400" height="300"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23666" font-size="14" font-family="sans-serif">Imagem indisponível</text></svg>');
      }}
    />
  );
}

export default function GaleriaClient({ images }: { images: SerializedImage[] }) {
  const [activeTab, setActiveTab] = useState('ALL');
  const [lightboxImage, setLightboxImage] = useState<SerializedImage | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const filteredImages =
    activeTab === 'ALL'
      ? images
      : images.filter((img) => img.category === activeTab);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => { checkScroll(); }, [filteredImages]);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = scrollRef.current.clientWidth * 0.7;
      scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
      setTimeout(checkScroll, 400);
    }
  };

  const lightboxIndex = lightboxImage ? filteredImages.findIndex((i) => i.id === lightboxImage.id) : -1;

  const navigateLightbox = (dir: 'prev' | 'next') => {
    if (lightboxIndex < 0) return;
    const newIdx = dir === 'next' ? (lightboxIndex + 1) % filteredImages.length : (lightboxIndex - 1 + filteredImages.length) % filteredImages.length;
    setLightboxImage(filteredImages[newIdx]);
  };

  useEffect(() => {
    if (!lightboxImage) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxImage(null);
      if (e.key === 'ArrowRight') navigateLightbox('next');
      if (e.key === 'ArrowLeft') navigateLightbox('prev');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxImage, lightboxIndex]);

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25'
                  : 'bg-dark-100 text-dark-600 hover:bg-dark-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filteredImages.length === 0 ? (
          <div className="py-24 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-dark-100">
              <ImageOff className="h-10 w-10 text-dark-400" />
            </div>
            <h3 className="text-xl font-extrabold text-dark-900">Nenhum conteúdo encontrado</h3>
            <p className="mt-2 text-dark-500">Nenhuma imagem ou vídeo encontrado nesta categoria.</p>
          </div>
        ) : (
          <div className="relative">
            {canScrollLeft && (
              <button onClick={() => scroll('left')} className="absolute -left-4 top-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:scale-110">
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {canScrollRight && (
              <button onClick={() => scroll('right')} className="absolute -right-4 top-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:scale-110">
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
            <div
              ref={scrollRef}
              onScroll={checkScroll}
              className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className="min-w-[280px] max-w-[320px] shrink-0 snap-start cursor-pointer group"
                  onClick={() => setLightboxImage(image)}
                >
                  <div className="relative overflow-hidden rounded-2xl bg-dark-100 shadow-premium transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-lg">
                    <div className="aspect-[4/3]">
                      <MediaThumbnail image={image} />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      {image.title && (
                        <p className="text-sm font-semibold text-white">{image.title}</p>
                      )}
                      <span className="mt-1 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                        {isVideoUrl(image.url) ? 'Vídeo' : getYouTubeId(image.url) ? 'YouTube' : getVimeoId(image.url) ? 'Vimeo' : CATEGORIES[image.category] || image.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute right-4 top-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            onClick={() => setLightboxImage(null)}
          >
            <X className="h-6 w-6" />
          </button>

          {filteredImages.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                className="absolute right-4 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <div
            className="relative max-h-[85vh] max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <MediaLightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
            {(lightboxImage.title || lightboxImage.description) && (
              <div className="mt-4 text-center">
                {lightboxImage.title && (
                  <h3 className="text-lg font-bold text-white">{lightboxImage.title}</h3>
                )}
                {lightboxImage.description && (
                  <p className="mt-1 text-sm text-gray-300">{lightboxImage.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
