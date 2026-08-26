import Link from 'next/link';
import { Star, Calendar, ChevronRight, MessageCircle, MapPin, Phone, MessageSquareQuote, ArrowRight } from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatDate, getWhatsAppLink } from '@/lib/utils';
import HeroSection from '@/components/layout/HeroSection';
import GalleryCarousel from '@/components/home/GalleryCarousel';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [latestNews, activeAnnouncements, featuredReviews, whatsappSetting, galleryImages] = await Promise.all([
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
    prisma.galleryImage.findMany({
      where: { published: true },
      orderBy: [{ isMain: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
      take: 12,
    }),
  ]);

  const whatsappPhone = whatsappSetting?.value || '';

  const serializedGallery = galleryImages.map((img) => ({
    id: img.id,
    title: img.title,
    url: img.url,
    category: img.category,
  }));

  return (
    <div className="min-h-screen">
      <HeroSection whatsappPhone={whatsappPhone} />

      {/* Gallery Carousel */}
      {serializedGallery.length > 0 && (
        <GalleryCarousel images={serializedGallery} />
      )}

      {activeAnnouncements.length > 0 && (
        <section className="bg-dark-950 px-4 py-16">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-8 text-center text-sm font-bold uppercase tracking-[0.3em] text-brand-500">Avisos</h2>
            <div className="space-y-4">
              {activeAnnouncements.map((ann) => (
                <div key={ann.id} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600/20">
                    <Calendar className="h-5 w-5 text-brand-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{ann.text}</p>
                    <p className="mt-1.5 text-xs text-white/40">
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
        <section className="bg-black px-4 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-14 text-center">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-500">Novidades</span>
              <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">Últimas Notícias</h2>
              <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-brand-500 to-brand-600"></div>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {latestNews.map((news) => (
                <Link key={news.id} href={`/noticia/${news.slug}`} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition-all duration-500 hover:border-brand-500/30 hover:bg-white/10 hover:-translate-y-2">
                  {news.image ? (
                    <div className="h-56 overflow-hidden">
                      <img src={news.image} alt={news.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                    </div>
                  ) : (
                    <div className="flex h-56 items-center justify-center bg-white/5">
                      <span className="text-sm font-medium text-white/30">Sem imagem</span>
                    </div>
                  )}
                  <div className="p-7">
                    <span className="inline-flex rounded-full bg-brand-600/20 px-3 py-1 text-xs font-bold text-brand-400">{news.category}</span>
                    <h3 className="mt-4 text-lg font-extrabold text-white transition-colors group-hover:text-brand-400">{news.title}</h3>
                    {news.summary && <p className="mt-3 line-clamp-2 text-sm text-white/50">{news.summary}</p>}
                    <p className="mt-4 text-xs font-medium text-white/30">{formatDate(news.publishedAt || news.createdAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {featuredReviews.length > 0 && (() => {
        const totalReviews = featuredReviews.length;
        const avgRating = totalReviews > 0 ? (featuredReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1) : '0.0';
        const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
          star,
          count: featuredReviews.filter(r => r.rating === star).length,
          pct: totalReviews > 0 ? (featuredReviews.filter(r => r.rating === star).length / totalReviews) * 100 : 0,
        }));

        function timeAgo(date: Date): string {
          const diff = Date.now() - new Date(date).getTime();
          const days = Math.floor(diff / 86400000);
          if (days === 0) return 'hoje';
          if (days === 1) return 'ontem';
          if (days < 7) return `há ${days} dias`;
          if (days < 30) return `há ${Math.floor(days / 7)} sem`;
          return `há ${Math.floor(days / 30)} mês`;
        }

        return (
          <section className="relative border-y border-white/[0.06] bg-white/[0.015] py-20 sm:py-24">
            <div className="mx-auto max-w-7xl px-5">
              <div className="max-w-2xl mx-auto text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">Avaliações</p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">O que dizem nossos clientes</h2>
                <p className="mt-4 text-[15px] leading-relaxed text-white/55">Experiências reais de quem já aproveitou o Sauna e Espaço da Janice.</p>
              </div>

              {/* Rating Summary */}
              <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-[220px_1fr]">
                <div className="flex flex-col items-center justify-center rounded-2xl card-surface p-6 text-center">
                  <p className="text-5xl font-extrabold text-white">{avgRating}</p>
                  <div className="flex items-center gap-0.5 mt-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-5 w-5 ${i < Math.round(Number(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-white/15'}`} />
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-white/50">{totalReviews} avaliação{totalReviews !== 1 ? 's' : ''}</p>
                </div>

                <div className="rounded-2xl card-surface p-6">
                  <div className="space-y-2.5">
                    {ratingCounts.map(({ star, count, pct }) => (
                      <div key={star} className="flex items-center gap-3">
                        <span className="flex w-8 shrink-0 items-center gap-1 text-xs font-medium text-white/55">
                          {star} <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        </span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
                          <div className="h-full rounded-full brand-gradient-bg" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-8 shrink-0 text-right text-xs text-white/45">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Review Cards */}
              <div className="mt-10 grid gap-5 md:grid-cols-3">
                {featuredReviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="flex h-full flex-col rounded-2xl card-surface p-6">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-white/15'}`} />
                        ))}
                      </div>
                      <span className="text-[11px] text-white/35">{timeAgo(review.createdAt)}</span>
                    </div>
                    {review.comment && (
                      <p className="mt-4 flex-1 text-[13px] leading-relaxed text-white/60">&ldquo;{review.comment}&rdquo;</p>
                    )}
                    <div className="mt-5 flex items-center gap-3 border-t border-white/[0.06] pt-4">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full brand-gradient-bg text-xs font-bold text-white">
                        {(review.user?.name || 'A')[0].toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{review.user?.name || 'Anônimo'}</p>
                        <p className="truncate text-[11px] text-white/40">Cliente verificado</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-10 text-center">
                <Link href="/avaliacoes" className="inline-flex items-center gap-2 rounded-xl border border-white/[0.15] bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10">
                  <MessageSquareQuote className="h-4 w-4" />
                  Ver todas as avaliações
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Localização */}
      <section className="bg-dark-950 px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-500">Localização</span>
            <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">Como Chegar</h2>
            <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-brand-500 to-brand-600"></div>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3682.5!2d-49.9469!3d-22.2141!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDEyJzUwLjgiUyA0OcKwNTYnNDguOCJX!5e0!3m2!1spt-BR!2sbr!4v1"
                width="100%"
                height="350"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
            </div>
            <div className="flex flex-col justify-center space-y-8">
              <div className="flex items-start gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/30">
                  <MapPin className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">Endereço</h3>
                  <p className="mt-1.5 text-white/60">Rua Cecílio Bernardes, 2245 - Marília (rua da cobeb)</p>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/30">
                  <Phone className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">Contato</h3>
                  <p className="mt-1.5 text-white/60">(37) 99939-2529</p>
                </div>
              </div>
              <a
                href="https://www.google.com/maps/search/Rua+Cecílio+Bernardes+2245+Marília"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 self-start rounded-2xl bg-brand-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-brand-600/30 transition-all duration-300 hover:bg-brand-500 hover:-translate-y-1"
              >
                <MapPin className="h-4 w-4" />
                Abrir no Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Grupo de WhatsApp */}
      <section className="bg-black px-4 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-green-500 to-green-600 shadow-2xl shadow-green-600/30">
            <MessageCircle className="h-10 w-10 text-white" />
          </div>
          <h2 className="mt-8 text-3xl font-extrabold text-white sm:text-4xl">Grupo de WhatsApp</h2>
          <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-green-500 to-green-600"></div>
          <p className="mt-6 text-lg text-white/60">
            Fique por dentro das novidades, promoções e eventos. Participe do nosso grupo exclusivo!
          </p>
          <a
            href="https://chat.whatsapp.com/ETXGzQLTyY44GJ3xwcd9PF?s=cl&p=a&mlu=4"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center gap-3 rounded-2xl bg-green-600 px-10 py-5 text-base font-bold text-white shadow-2xl shadow-green-600/40 transition-all duration-500 hover:bg-green-500 hover:-translate-y-1 hover:shadow-green-500/50"
          >
            <MessageCircle className="h-5 w-5" />
            Entrar no Grupo
          </a>
          <div className="mt-8">
            {whatsappPhone && (
              <a href={getWhatsAppLink(whatsappPhone, 'Olá! Gostaria de mais informações.')} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-green-400">
                <MessageCircle className="h-4 w-4" />
                ou fale conosco diretamente
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
