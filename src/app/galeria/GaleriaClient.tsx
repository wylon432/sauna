'use client';

import { useState } from 'react';
import { ImageOff, X } from 'lucide-react';

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
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-500/25'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filteredImages.length === 0 ? (
          <div className="py-24 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-100">
              <ImageOff className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Nenhuma imagem encontrada</h3>
            <p className="mt-2 text-gray-500">Nenhuma imagem encontrada nesta categoria.</p>
          </div>
        ) : (
          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
            {filteredImages.map((image, index) => (
              <div
                key={image.id}
                className="mb-4 break-inside-avoid cursor-pointer group"
                onClick={() => setLightboxImage(image)}
              >
                <div className="relative overflow-hidden rounded-2xl bg-gray-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className={`${index % 3 === 0 ? 'aspect-[4/5]' : index % 3 === 1 ? 'aspect-square' : 'aspect-[5/4]'}`}>
                    <img
                      src={image.url}
                      alt={image.title || 'Galeria'}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {image.title && (
                      <p className="text-sm font-semibold text-white">{image.title}</p>
                    )}
                    <span className="mt-1 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                      {CATEGORIES[image.category] || image.category}
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
            <img
              src={lightboxImage.url}
              alt={lightboxImage.title || 'Galeria'}
              className="max-h-[80vh] w-auto rounded-2xl object-contain"
            />
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
