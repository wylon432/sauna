'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Play, Pause } from 'lucide-react';

interface GalleryImage {
  id: string;
  title: string | null;
  url: string;
  category: string;
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url) || url.startsWith('data:video');
}

export default function GalleryCarousel({ images }: { images: GalleryImage[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (paused || images.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [paused, next, images.length]);

  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') {
        const idx = images.findIndex((i) => i.id === lightbox.id);
        setLightbox(images[(idx + 1) % images.length]);
      }
      if (e.key === 'ArrowLeft') {
        const idx = images.findIndex((i) => i.id === lightbox.id);
        setLightbox(images[(idx - 1 + images.length) % images.length]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, images]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    }
    setTouchStart(null);
  };

  if (images.length === 0) return null;

  return (
    <>
      <section className="relative px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-6">
            <span className="text-sm font-bold uppercase tracking-widest text-brand-600">Conheça nosso espaço</span>
            <h2 className="mt-2 text-2xl font-extrabold text-dark-900 sm:text-3xl">Galeria de Fotos</h2>
          </div>

          <div
            className="relative overflow-hidden rounded-3xl bg-dark-100 shadow-premium-lg"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="relative aspect-[16/9] sm:aspect-[21/9]">
              {images.map((img, i) => (
                <div
                  key={img.id}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    i === current ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'
                  }`}
                >
                  {isVideoUrl(img.url) ? (
                    <video src={img.url} className="h-full w-full object-cover" muted autoPlay loop playsInline preload="metadata" />
                  ) : (
                    <img
                      src={img.url}
                      alt={img.title || 'Galeria'}
                      className="h-full w-full object-cover"
                      loading={i === 0 ? 'eager' : 'lazy'}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>
              ))}

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prev(); }}
                    className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-dark-800 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110 sm:h-12 sm:w-12"
                    aria-label="Anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); next(); }}
                    className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-dark-800 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110 sm:h-12 sm:w-12"
                    aria-label="Próximo"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Pause/Play */}
              {images.length > 1 && (
                <button
                  onClick={() => setPaused(!paused)}
                  className="absolute bottom-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60"
                >
                  {paused ? <Play className="h-3.5 w-3.5 ml-0.5" /> : <Pause className="h-3.5 w-3.5" />}
                </button>
              )}

              {/* Dots */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === current ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'
                      }`}
                      aria-label={`Imagem ${i + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Click to enlarge */}
              <button
                onClick={() => setLightbox(images[current])}
                className="absolute inset-0 z-15 cursor-pointer"
                aria-label="Ampliar imagem"
              />
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-dark-400">{current + 1} / {images.length} — Clique para ampliar</p>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute right-4 top-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            onClick={() => setLightbox(null)}
          >
            <X className="h-6 w-6" />
          </button>

          <button
            className="absolute left-4 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              const idx = images.findIndex((i) => i.id === lightbox.id);
              setLightbox(images[(idx - 1 + images.length) % images.length]);
            }}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            className="absolute right-4 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              const idx = images.findIndex((i) => i.id === lightbox.id);
              setLightbox(images[(idx + 1) % images.length]);
            }}
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div
            className="relative max-h-[85vh] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            {isVideoUrl(lightbox.url) ? (
              <video src={lightbox.url} controls autoPlay className="max-h-[80vh] w-auto rounded-2xl" />
            ) : (
              <img
                src={lightbox.url}
                alt={lightbox.title || 'Galeria'}
                className="max-h-[80vh] w-auto rounded-2xl object-contain"
              />
            )}
            {lightbox.title && (
              <p className="mt-4 text-center text-sm font-semibold text-white">{lightbox.title}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
