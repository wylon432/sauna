'use client';

import Link from 'next/link';
import { ArrowRight, MessageCircle, PartyPopper, Thermometer, Calendar, Phone } from 'lucide-react';
import Typewriter from '@/components/ui/Typewriter';
import { getWhatsAppLink } from '@/lib/utils';

interface HeroSectionProps {
  whatsappPhone: string;
}

export default function HeroSection({ whatsappPhone }: HeroSectionProps) {
  return (
    <>
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4">
        <div className="absolute inset-0">
          <div className="absolute left-[5%] top-[10%] h-[600px] w-[600px] rounded-full bg-brand-500/10 blur-[150px] animate-glow-pulse" />
          <div className="absolute bottom-[5%] right-[5%] h-[500px] w-[500px] rounded-full bg-brand-600/8 blur-[130px] animate-glow-pulse [animation-delay:2s]" />
          <div className="absolute left-[40%] top-[50%] h-[300px] w-[300px] rounded-full bg-white/3 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
            <span className="text-sm font-semibold text-white/80">Sauna, Piscina & Eventos</span>
          </div>

          <h1 className="text-4xl font-extrabold leading-[1.1] sm:text-5xl md:text-6xl lg:text-8xl">
            <Typewriter
              words={['Sauna e Espaço da Janice']}
              typingSpeed={80}
              deletingSpeed={50}
              pauseTime={5000}
              className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent"
            />
          </h1>

          <div className="mx-auto my-8 h-px w-40 bg-gradient-to-r from-transparent via-brand-500 to-transparent" />

          <p className="mx-auto max-w-2xl text-lg text-white/60 sm:text-xl">
            Seu espaço para relaxar, aproveitar e celebrar.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-base text-white/40">
            Sauna, piscina e aluguel de espaço para festas e eventos com infraestrutura completa.
          </p>

          <div className="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {whatsappPhone && (
              <a
                href={getWhatsAppLink(whatsappPhone, 'Olá! Gostaria de saber mais informações sobre a Sauna e Espaço da Janice e verificar a disponibilidade para reserva.')}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 rounded-2xl bg-green-600 px-10 py-5 text-base font-bold text-white shadow-2xl shadow-green-600/40 transition-all duration-500 hover:bg-green-500 hover:shadow-green-500/50 hover:-translate-y-1"
              >
                <MessageCircle className="h-5 w-5" />
                Reservar pelo WhatsApp
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            )}
            <Link href="/sauna" className="group inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/5 px-10 py-5 text-base font-bold text-white backdrop-blur-sm transition-all duration-500 hover:border-brand-500/50 hover:bg-white/10 hover:-translate-y-1">
              <Thermometer className="h-5 w-5" />
              Conhecer Sauna
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Service Cards */}
      <section className="relative z-20 mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2">
          <Link href="/sauna" className="group rounded-3xl border border-dark-100 bg-white p-10 shadow-2xl shadow-black/5 transition-all duration-500 hover:shadow-3xl hover:-translate-y-2">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/30 transition-all duration-300 group-hover:scale-110">
              <Thermometer className="h-8 w-8 text-white" />
            </div>
            <h2 className="mb-3 text-2xl font-extrabold text-dark-900">Sauna & Piscina</h2>
            <p className="mb-6 text-base leading-relaxed text-dark-500">
              Aproveite nossos horários de sauna e piscina. Ambiente aconchegante, seguro e com
              toda a estrutura para seu conforto.
            </p>
            <span className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 transition-colors group-hover:text-brand-700">
              Ver horários
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </Link>

          <Link href="/aluguel" className="group rounded-3xl border border-dark-100 bg-white p-10 shadow-2xl shadow-black/5 transition-all duration-500 hover:shadow-3xl hover:-translate-y-2">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-dark-800 to-dark-900 shadow-lg shadow-dark-900/30 transition-all duration-300 group-hover:scale-110">
              <PartyPopper className="h-8 w-8 text-white" />
            </div>
            <h2 className="mb-3 text-2xl font-extrabold text-dark-900">Aluguel para Festas</h2>
            <p className="mb-6 text-base leading-relaxed text-dark-500">
              Alugue nosso espaço para sua festa ou evento. Pacotes flexíveis, estrutura completa
              e localização privilegiada.
            </p>
            <span className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 transition-colors group-hover:text-brand-700">
              Conhecer pacotes
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}
