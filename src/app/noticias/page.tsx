import Link from 'next/link';
import { ArrowRight, Calendar, Newspaper } from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatDate } from '@/lib/utils';

export const metadata = {
  title: 'Notícias | Sauna e Espaço da Janice',
  description: 'Fique por dentro das novidades do nosso espaço.',
};

export default async function NoticiasPage() {
  const news = await prisma.news.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
  });

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-900 via-amber-800 to-slate-900 px-4 py-20 sm:py-28">
        <div className="absolute inset-0 bg-[url('/img/pattern.svg')] opacity-5" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-amber-600/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-4 py-2 text-sm font-medium text-amber-300 backdrop-blur-sm">
            <Newspaper className="h-4 w-4" />
            Novidades
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Últimas
            <span className="text-amber-400"> Notícias</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-amber-100/80">
            Fique por dentro das novidades do nosso espaço.
          </p>
        </div>
      </section>

      {/* News Grid */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        {news.length === 0 ? (
          <div className="mx-auto max-w-lg text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-100">
              <Newspaper className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Nenhuma notícia</h3>
            <p className="mt-3 text-gray-500">Nenhuma notícia publicada no momento.</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((article) => (
              <Link
                key={article.id}
                href={`/noticia/${article.slug}`}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                {article.image ? (
                  <div className="relative h-56 overflow-hidden bg-gray-100">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                ) : (
                  <div className="flex h-56 items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <Newspaper className="h-12 w-12 text-gray-200" />
                  </div>
                )}

                <div className="p-6">
                  <div className="mb-3">
                    <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                      {article.category}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-amber-600">
                    {article.title}
                  </h2>

                  {article.summary && (
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-500">
                      {article.summary}
                    </p>
                  )}

                  <div className="mt-5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(article.publishedAt || article.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600 transition-all group-hover:gap-2">
                      Ler notícia
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
