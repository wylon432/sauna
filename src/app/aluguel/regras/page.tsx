import Link from 'next/link';
import { ArrowLeft, Shield, CalendarCheck, CreditCard, Clock, Users, Package, Heart, Trash2, Ban, AlertTriangle, MessageCircle, FileText } from 'lucide-react';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Regras do Aluguel | Sauna e Espaço da Janice',
  description: 'Confira todas as regras, orientações e termos de utilização para aluguel do espaço.',
};

const SECTION_ICONS: Record<string, any> = {
  'RESERVA': CalendarCheck,
  'POLÍTICA': CreditCard,
  'HORÁRIO': Clock,
  'CAPACIDADE': Users,
  'INFRAESTRUTURA': Package,
  'COMPORTAMENTO': Heart,
  'LIMPEZA': Trash2,
  'PROIBIÇÕES': Ban,
  'PAGAMENTO': CreditCard,
  'RESPONSABILIDADE': AlertTriangle,
  'REGISTRO': FileText,
};

const SECTION_COLORS: Record<string, string> = {
  'RESERVA': 'bg-blue-100 text-blue-600',
  'POLÍTICA': 'bg-amber-100 text-amber-600',
  'HORÁRIO': 'bg-green-100 text-green-600',
  'CAPACIDADE': 'bg-purple-100 text-purple-600',
  'INFRAESTRUTURA': 'bg-orange-100 text-orange-600',
  'COMPORTAMENTO': 'bg-red-100 text-red-600',
  'LIMPEZA': 'bg-cyan-100 text-cyan-600',
  'PROIBIÇÕES': 'bg-slate-100 text-slate-600',
  'PAGAMENTO': 'bg-emerald-100 text-emerald-600',
  'RESPONSABILIDADE': 'bg-rose-100 text-rose-600',
  'REGISTRO': 'bg-indigo-100 text-indigo-600',
};

function parseSections(html: string) {
  const sections: { title: string; items: string[] }[] = [];
  const parts = html.split(/<h3>/);
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const titleMatch = part.match(/^(.*?)<\/h3>/);
    if (!titleMatch) continue;
    const title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
    const items: string[] = [];
    const liRegex = /<li>(.*?)<\/li>/g;
    let match;
    while ((match = liRegex.exec(part)) !== null) {
      items.push(match[1].replace(/<[^>]*>/g, '').trim());
    }
    sections.push({ title, items });
  }
  return sections;
}

function getIconForSection(title: string) {
  const upperTitle = title.toUpperCase();
  for (const [key, Icon] of Object.entries(SECTION_ICONS)) {
    if (upperTitle.includes(key)) return Icon;
  }
  return Shield;
}

function getColorForSection(title: string) {
  const upperTitle = title.toUpperCase();
  for (const [key, color] of Object.entries(SECTION_COLORS)) {
    if (upperTitle.includes(key)) return color;
  }
  return 'bg-brand-100 text-brand-600';
}

export default async function AluguelRegrasPage() {
  const rule = await prisma.rules.findFirst({
    where: { type: 'ALUGUEL', active: true },
    orderBy: { version: 'desc' },
  });

  const sections = rule ? parseSections(rule.content) : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-brand-50/20 to-white">
      {/* Header */}
      <section className="relative overflow-hidden px-4 py-16 sm:py-20">
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

      {/* Alert Banner */}
      <section className="mx-auto max-w-4xl px-4">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-extrabold text-amber-800">Atenção!</p>
              <p className="text-sm text-amber-700 mt-1">Ao reservar o Sauna e Espaço da Janice, você declara ter lido e compreendido todas as regras abaixo e concorda em cumpri-las integralmente.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {sections.length > 0 ? (
          <div className="space-y-6">
            {sections.map((section, i) => {
              const Icon = getIconForSection(section.title);
              const colorClass = getColorForSection(section.title);
              return (
                <div key={i} className="overflow-hidden rounded-2xl border border-dark-200 bg-white shadow-premium">
                  <div className="flex items-center gap-4 border-b border-dark-100 px-6 py-5">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-extrabold text-dark-900">{section.title}</h2>
                  </div>
                  <div className="px-6 py-5">
                    <ul className="space-y-3">
                      {section.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-3">
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-400" />
                          <span className="text-dark-600 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mx-auto max-w-lg text-center py-16">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-100">
              <Shield className="h-10 w-10 text-brand-600" />
            </div>
            <h3 className="text-xl font-extrabold text-dark-900">Regras em breve</h3>
            <p className="mt-3 text-dark-500">Regras ainda não disponíveis. Entre em contato pelo WhatsApp.</p>
          </div>
        )}

        {/* WhatsApp CTA */}
        <div className="mt-12 rounded-2xl border border-dark-200 bg-white p-8 text-center shadow-premium">
          <h3 className="text-lg font-extrabold text-dark-900">Dúvidas sobre as regras?</h3>
          <p className="mt-2 text-dark-500">Entre em contato pelo WhatsApp para esclarecer qualquer dúvida.</p>
          <a href="https://wa.me/5537999392529?text=Olá! Tenho dúvidas sobre as regras de aluguel do espaço." target="_blank" rel="noopener noreferrer"
            className="btn-whatsapp mt-4 inline-flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Falar no WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
