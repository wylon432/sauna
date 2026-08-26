'use client';

import { useState } from 'react';
import { ImageOff, X, Play } from 'lucide-react';

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
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url) || url.startsWith('data:video');
}

function MediaThumbnail({ image, className }: { image: SerializedImage; className?: string }) {
  if (isVideoUrl(image.url)) {
    return (
      <div className={`relative ${className}`}>
        <video src={image.url} className="h-full w-full object-cover" muted preload="metadata" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg">
            <Play className="h-5 w-5 text-dark-900 ml-0.5" fill="currentColor" />
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
    />
  );
}

function MediaLightbox({ image }: { image: SerializedImage }) {
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
    />
  );
}

export default function GaleriaClient({ images }: { images: SerializedImage[] }) {
  const [activeTab, setActiveTab] = useState('ALL');
  const [lightboxImage, setLightboxImage] = useState<SerializedImage | null>(null);

  const filteredImages =
    activeTab === 'ALL'
      ? images
      : images.filter((img) => img.category === activeTab);

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Category Filter */}
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
          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
            {filteredImages.map((image, index) => (
              <div
                key={image.id}
                className="mb-4 break-inside-avoid cursor-pointer group"
                onClick={() => setLightboxImage(image)}
              >
                <div className="relative overflow-hidden rounded-2xl bg-dark-100 shadow-premium transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-lg">
                  <div className={`${index % 3 === 0 ? 'aspect-[4/5]' : index % 3 === 1 ? 'aspect-square' : 'aspect-[5/4]'}`}>
                    <MediaThumbnail image={image} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {image.title && (
                      <p className="text-sm font-semibold text-white">{image.title}</p>
                    )}
                    <span className="mt-1 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                      {isVideoUrl(image.url) ? 'Vídeo' : CATEGORIES[image.category] || image.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            onClick={() => setLightboxImage(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <div
            className="relative max-h-[85vh] max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <MediaLightbox image={lightboxImage} />
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
