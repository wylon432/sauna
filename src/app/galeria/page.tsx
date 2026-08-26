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
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-900 via-sky-800 to-slate-900 px-4 py-20 sm:py-28">
        <div className="absolute inset-0 bg-[url('/img/pattern.svg')] opacity-5" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-sky-600/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-sky-500/15 px-4 py-2 text-sm font-medium text-sky-300 backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            Galeria
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Conheça nosso
            <span className="block text-sky-400">espaço</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-sky-100/80">
            Veja as fotos do nosso espaço e descubra o que temos a oferecer.
          </p>
        </div>
      </section>

      <GaleriaClient images={serializedImages} />
    </div>
  );
}
