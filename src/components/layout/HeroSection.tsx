'use client';

import Link from 'next/link';
import { ArrowRight, MessageCircle, PartyPopper, Thermometer, ChevronDown } from 'lucide-react';
import Typewriter from '@/components/ui/Typewriter';
import { getWhatsAppLink } from '@/lib/utils';

interface HeroSectionProps {
  whatsappPhone: string;
}

export default function HeroSection({ whatsappPhone }: HeroSectionProps) {
  return (
    <>
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-dark-950">
        {/* Animated orbs */}
        <div className="absolute inset-0">
          <div className="absolute left-[10%] top-[20%] h-[500px] w-[500px] rounded-full bg-brand-600/10 blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[10%] right-[10%] h-[400px] w-[400px] rounded-full bg-brand-500/8 blur-[100px] animate-glow-pulse [animation-delay:1.5s]" />
          <div className="absolute left-[50%] top-[60%] h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-brand-400/5 blur-[80px] animate-glow-pulse [animation-delay:3s]" />
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />

        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-5 py-2">
            <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
            <span className="text-sm font-semibold text-brand-400">Sauna, Piscina & Eventos</span>
          </div>

          <h1 className="text-5xl font-extrabold leading-[1.1] text-white sm:text-6xl md:text-7xl lg:text-8xl">
            <Typewriter
              words={['Sauna e Espaço da Janice']}
              typingSpeed={90}
              deletingSpeed={50}
              pauseTime={5000}
              className="bg-gradient-to-r from-white via-brand-200 to-white bg-clip-text text-transparent"
            />
          </h1>

          <div className="mx-auto my-8 h-px w-32 bg-gradient-to-r from-transparent via-brand-500 to-transparent" />

          <p className="mx-auto max-w-2xl text-lg text-dark-400 sm:text-xl">
            Seu espaço para relaxar, aproveitar e celebrar.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-base text-dark-500">
            Sauna, piscina e aluguel de espaço para festas e eventos.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/sauna" className="group inline-flex items-center gap-3 rounded-2xl bg-brand-600 px-10 py-4 text-sm font-bold text-white shadow-xl shadow-brand-600/30 transition-all duration-300 hover:bg-brand-500 hover:shadow-2xl hover:shadow-brand-500/40 hover:-translate-y-1">
              <Thermometer className="h-5 w-5" />
              Conhecer Sauna
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link href="/aluguel" className="group inline-flex items-center gap-3 rounded-2xl border-2 border-white/10 bg-white/5 px-10 py-4 text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:border-brand-500/30 hover:bg-white/10 hover:-translate-y-1">
              <PartyPopper className="h-5 w-5" />
              Conhecer o Aluguel
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {whatsappPhone && (
            <a
              href={getWhatsAppLink(whatsappPhone, 'Olá! Gostaria de mais informações sobre a sauna e espaço.')}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex items-center gap-2 text-sm text-dark-500 transition-colors hover:text-brand-400"
            >
              <MessageCircle className="h-4 w-4" />
              ou fale conosco pelo WhatsApp
            </a>
          )}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-dark-500" />
        </div>
      </section>

      {/* Service Cards */}
      <section className="relative -mt-20 z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2">
          <Link href="/sauna" className="group rounded-2xl border border-dark-100 bg-white p-8 shadow-2xl shadow-black/5 transition-all duration-300 hover:shadow-3xl hover:-translate-y-2">
            <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 transition-colors duration-300 group-hover:bg-brand-600">
              <Thermometer className="h-7 w-7 text-brand-600 transition-colors duration-300 group-hover:text-white" />
            </div>
            <h2 className="mb-3 text-xl font-extrabold text-dark-900">Sauna & Piscina</h2>
            <p className="mb-6 text-dark-500">
              Aproveite nossos horários de sauna e piscina. Ambiente aconchegante, seguro e com
              toda a estrutura para seu conforto.
            </p>
            <span className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 transition-colors group-hover:text-brand-700">
              Ver horários
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </Link>

          <Link href="/aluguel" className="group rounded-2xl border border-dark-100 bg-white p-8 shadow-2xl shadow-black/5 transition-all duration-300 hover:shadow-3xl hover:-translate-y-2">
            <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-dark-900 transition-colors duration-300 group-hover:bg-brand-600">
              <PartyPopper className="h-7 w-7 text-white transition-colors duration-300" />
            </div>
            <h2 className="mb-3 text-xl font-extrabold text-dark-900">Aluguel para Festas</h2>
            <p className="mb-6 text-dark-500">
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
