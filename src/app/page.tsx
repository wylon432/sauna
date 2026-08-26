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
        <section className="bg-brand-50/60 px-4 py-12">
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
            <div className="mb-10 text-center">
              <span className="text-sm font-bold uppercase tracking-widest text-brand-600">Novidades</span>
              <h2 className="mt-2 text-2xl font-extrabold text-dark-900 sm:text-3xl">Últimas Notícias</h2>
              <p className="mt-2 text-dark-500">Fique por dentro do que acontece no espaço</p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {latestNews.map((news) => (
                <Link key={news.id} href={`/noticia/${news.slug}`} className="group overflow-hidden rounded-2xl border border-dark-100 bg-white shadow-premium transition-all duration-300 hover:shadow-premium-lg hover:-translate-y-1">
                  {news.image ? (
                    <div className="h-52 overflow-hidden">
                      <img src={news.image} alt={news.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
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
        <section className="bg-gradient-to-b from-brand-50/40 to-white px-4 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 text-center">
              <span className="text-sm font-bold uppercase tracking-widest text-brand-600">Depoimentos</span>
              <h2 className="mt-2 text-2xl font-extrabold text-dark-900 sm:text-3xl">O que dizem sobre nós</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredReviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-dark-100 bg-white p-6 shadow-premium transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-lg">
                  <div className="mb-3 flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-brand-400 text-brand-400' : 'text-dark-300'}`} />
                    ))}
                  </div>
                  {review.comment && (
                    <p className="mb-4 line-clamp-3 text-sm text-dark-600">&ldquo;{review.comment}&rdquo;</p>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                      {(review.user?.name || 'A')[0].toUpperCase()}
                    </div>
                    <p className="text-sm font-medium text-dark-600">{review.user?.name || 'Anônimo'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Localização */}
      <section className="bg-dark-950 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-brand-400">Conheça o espaço</span>
            <h2 className="mt-2 text-3xl font-extrabold text-white">Como Chegar</h2>
            <p className="mt-3 text-dark-400">Confira o vídeo e descubra tudo que o Sauna e Espaço da Janice tem a oferecer</p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-dark-800 bg-dark-900/50 p-2 sm:p-3 shadow-2xl">
            <video
              className="w-full rounded-xl"
              controls
              poster="/logo.jpg"
              preload="metadata"
            >
              <source src="/video-local.mp4" type="video/mp4" />
              Seu navegador não suporta a reprodução de vídeos.
            </video>
          </div>
          <div className="mt-8 text-center">
            <a
              href="https://www.instagram.com/sauna_da_janice?utm_source=ig_web_button_share_sheet&igsi=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-6 py-3 text-sm font-bold text-pink-400 transition-all hover:bg-pink-500/20 hover:border-pink-500/50"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              Siga no Instagram
            </a>
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-brand-600">Localização</span>
            <h2 className="mt-2 text-2xl font-extrabold text-dark-900 sm:text-3xl">Como chegar</h2>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-dark-200 bg-white shadow-premium">
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
            <div className="flex flex-col justify-center space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-100">
                  <MapPin className="h-6 w-6 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-dark-900">Endereço</h3>
                  <p className="mt-1 text-dark-500">Rua Cecílio Bernardes, 2245 - Marília (rua da cobeb)</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-100">
                  <Phone className="h-6 w-6 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-dark-900">Contato</h3>
                  <p className="mt-1 text-dark-500">(37) 99939-2529</p>
                </div>
              </div>
              <a
                href="https://www.google.com/maps/search/Rua+Cecílio+Bernardes+2245+Marília"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2 self-start"
              >
                <MapPin className="h-4 w-4" />
                Abrir no Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Grupo de WhatsApp */}
      <section className="bg-gradient-to-b from-green-50/40 to-white px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
            <MessageCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mt-6 text-2xl font-extrabold text-dark-900 sm:text-3xl">Entrou no Grupo de WhatsApp</h2>
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
