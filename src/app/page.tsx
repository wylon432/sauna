import Link from 'next/link';
import { Star, Calendar, ChevronRight, MessageCircle } from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatDate, getWhatsAppLink } from '@/lib/utils';
import HeroSection from '@/components/layout/HeroSection';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [latestNews, activeAnnouncements, featuredReviews, whatsappSetting] = await Promise.all([
    prisma.news.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 3,
    }),
    prisma.announcement.findMany({
      where: { active: true, endDate: { gte: new Date() } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.review.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: { user: true },
    }),
    prisma.systemSetting.findUnique({ where: { key: 'whatsapp_main' } }),
  ]);

  const whatsappPhone = whatsappSetting?.value || '';

  return (
    <div className="min-h-screen">
      <HeroSection whatsappPhone={whatsappPhone} />

      {activeAnnouncements.length > 0 && (
        <section className="bg-brand-50 px-4 py-12">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-6 text-xl font-extrabold text-dark-900">Avisos</h2>
            <div className="space-y-3">
              {activeAnnouncements.map((ann) => (
                <div key={ann.id} className="flex items-start gap-3 rounded-2xl border border-brand-200 bg-white p-5 shadow-sm">
                  <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                  <div>
                    <p className="font-medium text-dark-900">{ann.text}</p>
                    <p className="mt-1 text-xs text-dark-500">
                      {formatDate(ann.startDate)} até {formatDate(ann.endDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {latestNews.length > 0 && (
        <section className="px-4 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <span className="text-sm font-bold uppercase tracking-widest text-brand-600">Novidades</span>
                <h2 className="mt-2 text-2xl font-extrabold text-dark-900">Últimas Notícias</h2>
              </div>
              <Link href="/noticias" className="flex items-center gap-1 text-sm font-bold text-brand-600 hover:text-brand-700">
                Ver todas <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {latestNews.map((news) => (
                <Link key={news.id} href={`/noticia/${news.slug}`} className="group overflow-hidden rounded-2xl border border-dark-100 bg-white shadow-premium transition-all duration-300 hover:shadow-premium-lg hover:-translate-y-1">
                  {news.image ? (
                    <div className="h-52 overflow-hidden">
                      <img src={news.image} alt={news.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                  ) : (
                    <div className="flex h-52 items-center justify-center bg-dark-100">
                      <span className="text-sm font-medium text-dark-400">Sem imagem</span>
                    </div>
                  )}
                  <div className="p-6">
                    <span className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">{news.category}</span>
                    <h3 className="mt-3 text-lg font-extrabold text-dark-900 transition-colors group-hover:text-brand-600">{news.title}</h3>
                    {news.summary && <p className="mt-2 line-clamp-2 text-sm text-dark-500">{news.summary}</p>}
                    <p className="mt-3 text-xs font-medium text-dark-400">{formatDate(news.publishedAt || news.createdAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {featuredReviews.length > 0 && (
        <section className="bg-dark-900 px-4 py-20">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-10 text-center text-2xl font-extrabold text-white">
              O que dizem sobre nós
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredReviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-dark-800 bg-dark-800/50 p-6 backdrop-blur-sm">
                  <div className="mb-3 flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-brand-400 text-brand-400' : 'text-dark-600'}`} />
                    ))}
                  </div>
                  {review.comment && (
                    <p className="mb-4 line-clamp-3 text-sm text-dark-300">&ldquo;{review.comment}&rdquo;</p>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                      {(review.user?.name || 'A')[0].toUpperCase()}
                    </div>
                    <p className="text-sm font-medium text-dark-300">{review.user?.name || 'Anônimo'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Grupo de WhatsApp */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
            <MessageCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mt-6 text-2xl font-extrabold text-dark-900">Entrou no Grupo de WhatsApp</h2>
          <p className="mt-3 text-dark-500">
            Fique por dentro das novidades, promoções e eventos. Participe do nosso grupo exclusivo!
          </p>
          <a
            href="https://chat.whatsapp.com/ETXGzQLTyY44GJ3xwcd9PF?s=cl&p=a&mlu=4"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-green-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-green-600/30 transition-all hover:bg-green-500 hover:-translate-y-1 hover:shadow-2xl"
          >
            <MessageCircle className="h-5 w-5" />
            Entrar no Grupo
          </a>
          <div className="mt-8">
            {whatsappPhone && (
              <a href={getWhatsAppLink(whatsappPhone, 'Olá! Gostaria de mais informações.')} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-dark-500 transition-colors hover:text-green-600">
                <MessageCircle className="h-4 w-4" />
                ou fale conosco pelo WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
