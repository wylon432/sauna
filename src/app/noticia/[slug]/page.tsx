import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatDate, formatDateTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Notícia | Sauna e Espaço da Janice',
};

export default async function NoticiaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await prisma.news.findUnique({
    where: { slug },
  });

  if (!article || article.status !== 'PUBLISHED') {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-900 via-amber-800 to-slate-900 px-4 py-16 sm:py-20">
        <div className="absolute inset-0 bg-[url('/img/pattern.svg')] opacity-5" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-4xl">
          <Link
            href="/noticias"
            className="mb-6 inline-flex items-center gap-2 text-sm text-amber-300/80 transition-colors hover:text-amber-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Notícias
          </Link>
          <span className="mb-4 inline-flex rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 backdrop-blur-sm">
            {article.category}
          </span>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            {article.title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-amber-200/70">
            {article.author && (
              <span className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                  <User className="h-4 w-4" />
                </div>
                {article.author}
              </span>
            )}
            <span className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                <Calendar className="h-4 w-4" />
              </div>
              {formatDate(article.publishedAt || article.createdAt)}
            </span>
          </div>
        </div>
      </section>

      {/* Article */}
      <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {article.image && (
          <div className="mb-10 overflow-hidden rounded-2xl bg-gray-100 shadow-lg">
            <img
              src={article.image}
              alt={article.title}
              className="h-auto w-full object-cover"
            />
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="p-8 sm:p-12">
            {article.summary && (
              <div className="mb-8 border-l-4 border-amber-400 pl-6">
                <p className="text-lg italic leading-relaxed text-gray-600">{article.summary}</p>
              </div>
            )}

            <div
              className="prose prose-gray max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed prose-a:text-amber-600 prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        </div>

        {/* Back link */}
        <div className="mt-10 text-center">
          <Link
            href="/noticias"
            className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Notícias
          </Link>
        </div>
      </article>
    </div>
  );
}
