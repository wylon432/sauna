import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import AvaliacoesForm from './AvaliacoesForm';
import { Star, MessageSquare, Sparkles } from 'lucide-react';
import Link from 'next/link';

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
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-brand-50/30 to-white px-4 py-20 sm:py-28">
        <div className="absolute inset-0">
          <div className="absolute left-[10%] top-[20%] h-[400px] w-[400px] rounded-full bg-brand-500/8 blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[10%] right-[10%] h-[300px] w-[300px] rounded-full bg-brand-400/6 blur-[100px] animate-glow-pulse [animation-delay:1.5s]" />
        </div>
        <div className="relative mx-auto max-w-7xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-100/60 px-4 py-2 text-sm font-semibold text-brand-700">
            <Sparkles className="h-4 w-4" />
            Opiniões dos Clientes
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-dark-900 sm:text-5xl lg:text-6xl">
            Avaliações
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-dark-600">
            Veja o que nossos clientes dizem sobre a experiência no nosso espaço.
          </p>
          {reviews.length > 0 && (
            <div className="mt-8 inline-flex items-center gap-4 rounded-2xl border border-dark-200 bg-white px-8 py-4 shadow-premium">
              <div className="text-right">
                <p className="text-3xl font-bold text-dark-900">{totalRating.toFixed(1)}</p>
                <StarDisplay rating={Math.round(totalRating)} size="sm" />
              </div>
              <div className="h-10 w-px bg-dark-200" />
              <p className="text-sm text-dark-500">
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
                <div className="overflow-hidden rounded-2xl border border-dark-200 bg-white shadow-premium">
                  <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-5">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                      <MessageSquare className="h-5 w-5" />
                      Deixe sua avaliação
                    </h2>
                    <p className="mt-1 text-sm text-brand-100/70">Compartilhe sua experiência</p>
                  </div>
                  <div className="p-6">
                    <AvaliacoesForm />
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-dark-200 bg-white p-8 shadow-premium text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100">
                  <MessageSquare className="h-8 w-8 text-brand-600" />
                </div>
                <h3 className="text-lg font-extrabold text-dark-900">Faça login</h3>
                <p className="mt-2 text-sm text-dark-500">
                  Você precisa estar logado para deixar sua avaliação.
                </p>
                <div className="mt-4 flex gap-3 justify-center">
                  <Link href="/login" className="inline-flex items-center rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700">
                    Entrar
                  </Link>
                  <Link href="/cadastro" className="inline-flex items-center rounded-xl border border-dark-200 bg-white px-5 py-2.5 text-sm font-semibold text-dark-700 transition-colors hover:bg-dark-50">
                    Criar conta
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-3 space-y-5">
            {reviews.length === 0 ? (
              <div className="overflow-hidden rounded-2xl border border-dark-100 bg-white p-12 text-center shadow-premium">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-dark-100">
                  <Star className="h-10 w-10 text-dark-300" />
                </div>
                <h3 className="text-xl font-extrabold text-dark-900">Nenhuma avaliação ainda</h3>
                <p className="mt-3 text-dark-500">Seja o primeiro a avaliar nosso espaço!</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="overflow-hidden rounded-2xl border border-dark-100 bg-white shadow-premium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-premium-lg"
                >
                  <div className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-500 text-sm font-bold text-white">
                          {review.user.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-dark-900">
                            {review.user.name}
                          </p>
                          <p className="text-xs text-dark-400">
                            {formatDate(review.createdAt)}
                          </p>
                        </div>
                      </div>
                      <StarDisplay rating={review.rating} />
                    </div>
                    {review.comment && (
                      <div className="rounded-xl bg-dark-50 px-5 py-4">
                        <p className="text-sm leading-relaxed text-dark-600">{review.comment}</p>
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
