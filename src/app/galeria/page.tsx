import { Sparkles } from 'lucide-react';
import prisma from '@/lib/prisma';
import GaleriaClient from './GaleriaClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Galeria de Fotos | Sauna e Espaço da Janice',
  description: 'Veja as fotos do nosso espaço de sauna, piscina e área de festas.',
};

export default async function GaleriaPage() {
  const images = await prisma.galleryImage.findMany({
    where: { published: true },
    orderBy: { sortOrder: 'asc' },
  });

  const serializedImages = images.map((img) => ({
    id: img.id,
    title: img.title,
    description: img.description,
    url: img.url,
    category: img.category,
    published: img.published,
    sortOrder: img.sortOrder,
  }));

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-brand-50/30 to-white px-4 py-20 sm:py-28">
        <div className="absolute inset-0">
          <div className="absolute left-[10%] top-[20%] h-[400px] w-[400px] rounded-full bg-brand-500/8 blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[10%] right-[10%] h-[300px] w-[300px] rounded-full bg-brand-400/6 blur-[100px] animate-glow-pulse [animation-delay:1.5s]" />
        </div>
        <div className="relative mx-auto max-w-7xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-100/60 px-4 py-2 text-sm font-semibold text-brand-700">
            <Sparkles className="h-4 w-4" />
            Galeria
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-dark-900 sm:text-5xl lg:text-6xl">
            Conheça nosso
            <span className="block text-brand-600">espaço</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-dark-600">
            Veja as fotos e vídeos do nosso espaço e descubra o que temos a oferecer.
          </p>
        </div>
      </section>

      <GaleriaClient images={serializedImages} />
    </div>
  );
}
