import { Phone, MessageCircle, Clock, MapPin, Sparkles } from 'lucide-react';
import prisma from '@/lib/prisma';
import { getWhatsAppLink } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Contato | Sauna e Espaço da Janice',
  description: 'Entre em contato conosco. Estamos prontos para ajudar!',
};

export default async function ContatoPage() {
  const settings = await prisma.systemSetting.findMany({
    where: {
      key: { in: ['whatsapp_main', 'whatsapp_sauna', 'whatsapp_rental', 'phone'] },
    },
  });

  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  const whatsappMain = settingsMap.whatsapp_main || '';
  const whatsappSauna = settingsMap.whatsapp_sauna || '';
  const whatsappRental = settingsMap.whatsapp_rental || '';
  const phone = settingsMap.phone || '';

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-dark-950 px-4 py-20 sm:py-28">
        <div className="absolute inset-0">
          <div className="absolute left-[10%] top-[20%] h-[400px] w-[400px] rounded-full bg-brand-600/10 blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[10%] right-[10%] h-[300px] w-[300px] rounded-full bg-brand-500/8 blur-[100px] animate-glow-pulse [animation-delay:1.5s]" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-4 py-2 text-sm font-semibold text-brand-400">
            <Sparkles className="h-4 w-4" />
            Fale Conosco
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Entre em
            <span className="text-brand-400"> Contato</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-dark-400">
            Estamos prontos para ajudar. Escolha a melhor forma de falar com a gente.
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left - Info */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-dark-100 bg-white p-8 shadow-premium">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100">
                <Clock className="h-7 w-7 text-brand-600" />
              </div>
              <h3 className="text-xl font-extrabold text-dark-900">Horário de Atendimento</h3>
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-dark-50 px-4 py-3">
                  <span className="text-sm font-medium text-dark-600">Sauna e Piscina</span>
                  <span className="text-sm font-bold text-dark-900">Terça e Quarta: 17h30 às 22h</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-dark-50 px-4 py-3">
                  <span className="text-sm font-medium text-dark-600">Atendimento administrativo</span>
                  <span className="text-sm font-bold text-dark-900">Seg a Sex: 9h às 18h</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-dark-100 bg-white p-8 shadow-premium">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100">
                <MapPin className="h-7 w-7 text-brand-600" />
              </div>
              <h3 className="text-xl font-extrabold text-dark-900">Endereço</h3>
              <p className="mt-4 text-dark-600 leading-relaxed">
                Rua Cecílio Bernardes, 2245<br />
                Marília - MG<br />
                <span className="text-sm text-dark-500">(rua da cobeb)</span>
              </p>
              <a
                href="https://www.google.com/maps/search/Rua+Cecílio+Bernardes+2245+Marília+MG"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700"
              >
                <MapPin className="h-4 w-4" />
                Ver no Google Maps
              </a>
            </div>
          </div>

          {/* Right - WhatsApp */}
          <div className="space-y-6">
            {whatsappSauna && (
              <a
                href={getWhatsAppLink(whatsappSauna, 'Olá! Gostaria de tirar dúvidas sobre a sauna e piscina.')}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-5 overflow-hidden rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-600 shadow-lg shadow-green-500/25">
                  <MessageCircle className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-dark-900 group-hover:text-green-600">WhatsApp Sauna</h3>
                  <p className="mt-1 text-sm text-dark-500">Dúvidas sobre horários, reservas e regras da sauna e piscina.</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-green-600">Iniciar conversa →</span>
                </div>
              </a>
            )}

            {whatsappRental && (
              <a
                href={getWhatsAppLink(whatsappRental, 'Olá! Gostaria de consultar valores e disponibilidade para aluguel do espaço.')}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-5 overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-600 shadow-lg shadow-brand-500/25">
                  <MessageCircle className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-dark-900 group-hover:text-brand-600">WhatsApp Aluguel</h3>
                  <p className="mt-1 text-sm text-dark-500">Valores, disponibilidade e informações sobre aluguel do espaço.</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600">Iniciar conversa →</span>
                </div>
              </a>
            )}

            {whatsappMain && (
              <a
                href={getWhatsAppLink(whatsappMain, 'Olá! Gostaria de mais informações.')}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-5 overflow-hidden rounded-2xl border border-dark-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-dark-900 shadow-lg">
                  <MessageCircle className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-dark-900 group-hover:text-brand-600">WhatsApp Geral</h3>
                  <p className="mt-1 text-sm text-dark-500">Informações gerais sobre nossos serviços.</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600">Iniciar conversa →</span>
                </div>
              </a>
            )}

            {phone && (
              <a
                href={`tel:${phone.replace(/\D/g, '')}`}
                className="group flex items-center gap-5 overflow-hidden rounded-2xl border border-dark-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/25">
                  <Phone className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-dark-900 group-hover:text-blue-600">Telefone</h3>
                  <p className="mt-0.5 text-lg font-bold text-blue-600">{phone}</p>
                </div>
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
