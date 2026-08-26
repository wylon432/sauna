import Link from 'next/link';
import { Star, Calendar, ChevronRight, MessageCircle, MapPin, Phone } from 'lucide-react';
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

      {featuredReviews.length > 0 && (
        <section className="bg-black px-4 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-14 text-center">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-500">Depoimentos</span>
              <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">O que dizem sobre nós</h2>
              <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-brand-500 to-brand-600"></div>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {featuredReviews.map((review) => (
                <div key={review.id} className="min-w-[320px] max-w-[360px] shrink-0 snap-center rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-8 transition-all duration-500 hover:border-brand-500/30 hover:from-white/10">
                  <svg className="mb-4 h-8 w-8 text-brand-500/40" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151C7.563 6.068 6 8.789 6 11h4v10H0z"/>
                  </svg>
                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-brand-400 text-brand-400' : 'text-white/15'}`} />
                    ))}
                  </div>
                  {review.comment && (
                    <p className="mb-8 text-sm leading-relaxed text-white/70">&ldquo;{review.comment}&rdquo;</p>
                  )}
                  <div className="flex items-center gap-4 border-t border-white/10 pt-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-sm font-bold text-white shadow-lg shadow-brand-600/30">
                      {(review.user?.name || 'A')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{review.user?.name || 'Anônimo'}</p>
                      <p className="mt-0.5 text-xs text-white/40">Cliente verificado</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
