import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import AvaliacoesForm from './AvaliacoesForm';
import { Star, MessageSquare, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Avaliações | Sauna e Espaço da Janice',
  description: 'Veja o que nossos clientes dizem sobre nós.',
};

async function getPublishedReviews() {
  return prisma.review.findMany({
    where: { status: 'PUBLISHED' },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

function StarDisplay({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4.5 w-4.5',
    lg: 'h-5.5 w-5.5',
  };
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

export default async function AvaliacoesPage() {
  const session = await getServerSession(authOptions);
  const reviews = await getPublishedReviews();

  const totalRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-900 via-amber-800 to-slate-900 px-4 py-20 sm:py-28">
        <div className="absolute inset-0 bg-[url('/img/pattern.svg')] opacity-5" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-amber-600/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-4 py-2 text-sm font-medium text-amber-300 backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            Opiniões dos Clientes
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Avaliações
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-amber-100/80">
            Veja o que nossos clientes dizem sobre a experiência no nosso espaço.
          </p>
          {reviews.length > 0 && (
            <div className="mt-8 inline-flex items-center gap-4 rounded-2xl bg-white/10 px-8 py-4 backdrop-blur-sm">
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{totalRating.toFixed(1)}</p>
                <StarDisplay rating={Math.round(totalRating)} size="sm" />
              </div>
              <div className="h-10 w-px bg-white/20" />
              <p className="text-sm text-amber-200/70">
                {reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-5">
          {/* Review Form */}
          <div className="lg:col-span-2">
            {session?.user ? (
              <div className="sticky top-8">
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-5">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                      <MessageSquare className="h-5 w-5" />
                      Deixe sua avaliação
                    </h2>
                    <p className="mt-1 text-sm text-amber-100/70">Compartilhe sua experiência</p>
                  </div>
                  <div className="p-6">
                    <AvaliacoesForm />
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-sm text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100">
                  <MessageSquare className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Faça login</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Faça login para deixar sua avaliação.
                </p>
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-3 space-y-5">
            {reviews.length === 0 ? (
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-100">
                  <Star className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Nenhuma avaliação ainda</h3>
                <p className="mt-3 text-gray-500">Nenhuma avaliação publicada ainda.</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-sm font-bold text-white">
                          {review.user.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {review.user.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(review.createdAt)}
                          </p>
                        </div>
                      </div>
                      <StarDisplay rating={review.rating} />
                    </div>
                    {review.comment && (
                      <div className="rounded-xl bg-gray-50 px-5 py-4">
                        <p className="text-sm leading-relaxed text-gray-600">{review.comment}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
