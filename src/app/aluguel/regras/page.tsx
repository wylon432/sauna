import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Regras do Aluguel | Sauna e Espaço da Janice',
  description: 'Confira todas as regras, orientações e termos de utilização para aluguel do espaço.',
};

export default async function AluguelRegrasPage() {
  const rule = await prisma.rules.findFirst({
    where: { type: 'ALUGUEL', active: true },
    orderBy: { version: 'desc' },
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-brand-50/30 to-white px-4 py-16 sm:py-20">
        <div className="absolute inset-0">
          <div className="absolute left-[10%] top-[20%] h-[400px] w-[400px] rounded-full bg-brand-500/8 blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[10%] right-[10%] h-[300px] w-[300px] rounded-full bg-brand-400/6 blur-[100px] animate-glow-pulse [animation-delay:1.5s]" />
        </div>
        <div className="relative mx-auto max-w-4xl">
          <Link href="/aluguel" className="mb-6 inline-flex items-center gap-2 text-sm text-dark-500 transition-colors hover:text-brand-600">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Aluguel
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100">
              <Shield className="h-7 w-7 text-brand-600" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-dark-900 sm:text-4xl">Regras do Aluguel</h1>
              <p className="mt-1 text-dark-500">Leia atentamente antes de reservar</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {rule ? (
          <div className="overflow-hidden rounded-2xl border border-dark-100 bg-white shadow-premium">
            <div className="p-8 sm:p-12">
              <div
                className="prose prose-lg max-w-none prose-headings:font-extrabold prose-headings:text-dark-900 prose-p:text-dark-600 prose-p:leading-relaxed prose-li:text-dark-600 prose-strong:text-dark-900"
                dangerouslySetInnerHTML={{ __html: rule.content }}
              />
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-lg text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-100">
              <Shield className="h-10 w-10 text-brand-600" />
            </div>
            <h3 className="text-xl font-extrabold text-dark-900">Regras em breve</h3>
            <p className="mt-3 text-dark-500">Regras ainda não disponíveis. Entre em contato pelo WhatsApp.</p>
          </div>
        )}
      </section>
    </div>
  );
}
