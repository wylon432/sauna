import Link from 'next/link';
import { ArrowLeft, Shield, Clock, CreditCard, Users, Heart, Trash2, AlertTriangle, MessageCircle } from 'lucide-react';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Regras do Aluguel | Sauna e Espaço da Janice',
  description: 'Regras de utilização para aluguel do espaço.',
};

interface Section {
  title: string;
  items: string[];
  icon: any;
  color: string;
}

const DEFAULT_SECTIONS: Section[] = [
  {
    title: 'Reserva e Pagamento',
    items: [
      'Sinal de 50% do valor total para garantir a reserva',
      'Valor restante de 50% antes da entrada no dia do evento',
      'Aceitamos apenas Pix e dinheiro',
    ],
    icon: CreditCard,
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    title: 'Horário e Capacidade',
    items: [
      'O horário do evento deve ser combinado no momento da reserva',
      'Capacidade máxima conforme combinado',
    ],
    icon: Clock,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    title: 'Infraestrutura Incluída',
    items: [
      'Área da piscina, churrasqueira e banheiros',
      'Cozinha com fogão, panelas e Air Fry',
      'Área de estar',
    ],
    icon: Users,
    color: 'bg-orange-100 text-orange-600',
  },
  {
    title: 'Regras Básicas',
    items: [
      'Respeite os vizinhos — não ultrapasse o horário combinado',
      'Mantenha o local limpo após o evento',
      'Proibido causar danos à estrutura ou mobiliário',
      'Qualquer dano será cobrado do responsável pela reserva',
    ],
    icon: Heart,
    color: 'bg-rose-100 text-rose-600',
  },
  {
    title: 'Cancelamento',
    items: [
      'O sinal não é reembolsável em caso de cancelamento',
      'Em caso de imprevisto, entre em contato pelo WhatsApp',
    ],
    icon: Shield,
    color: 'bg-amber-100 text-amber-600',
  },
];

function parseSections(html: string): Section[] {
  const sections: Section[] = [];
  const parts = html.split(/<h3>/);

  const ICON_MAP: Record<string, any> = {
    'RESERVA': CreditCard, 'POLÍTICA': CreditCard, 'PAGAMENTO': CreditCard,
    'HORÁRIO': Clock, 'CAPACIDADE': Users, 'INFRAESTRUTURA': Users,
    'COMPORTAMENTO': Heart, 'REGRAS': Heart, 'CONDUTA': Heart,
    'LIMPEZA': Trash2, 'CANCELAMENTO': Shield, 'SEGURANÇA': Shield,
  };
  const COLOR_MAP: Record<string, string> = {
    'RESERVA': 'bg-blue-100 text-blue-600', 'POLÍTICA': 'bg-amber-100 text-amber-600',
    'PAGAMENTO': 'bg-emerald-100 text-emerald-600', 'HORÁRIO': 'bg-blue-100 text-blue-600',
    'CAPACIDADE': 'bg-purple-100 text-purple-600', 'INFRAESTRUTURA': 'bg-orange-100 text-orange-600',
    'COMPORTAMENTO': 'bg-red-100 text-red-600', 'LIMPEZA': 'bg-cyan-100 text-cyan-600',
    'CANCELAMENTO': 'bg-amber-100 text-amber-600', 'SEGURANÇA': 'bg-green-100 text-green-600',
    'REGRAS': 'bg-rose-100 text-rose-600', 'CONDUTA': 'bg-rose-100 text-rose-600',
  };

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
    if (items.length === 0) continue;

    const upperTitle = title.toUpperCase();
    let icon = Shield;
    let color = 'bg-brand-100 text-brand-600';
    for (const [key, Icon] of Object.entries(ICON_MAP)) {
      if (upperTitle.includes(key)) { icon = Icon; break; }
    }
    for (const [key, c] of Object.entries(COLOR_MAP)) {
      if (upperTitle.includes(key)) { color = c; break; }
    }

    sections.push({ title, items, icon, color });
  }
  return sections;
}

export default async function AluguelRegrasPage() {
  let sections = DEFAULT_SECTIONS;

  try {
    const rule = await prisma.rules.findFirst({
      where: { type: 'ALUGUEL', active: true },
      orderBy: { version: 'desc' },
    });
    if (rule) {
      const parsed = parseSections(rule.content);
      if (parsed.length > 0) sections = parsed;
    }
  } catch {}

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-brand-50/20 to-white">
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
              <p className="mt-1 text-dark-500">Leia antes de reservar</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-extrabold text-amber-800">Atenção!</p>
              <p className="text-sm text-amber-700 mt-1">Ao reservar o espaço, você concorda em cumprir as regras abaixo.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {sections.map((section, i) => {
            const Icon = section.icon;
            return (
              <div key={i} className="overflow-hidden rounded-2xl border border-dark-200 bg-white shadow-premium">
                <div className="flex items-center gap-4 border-b border-dark-100 px-6 py-5">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${section.color}`}>
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

        <div className="mt-12 rounded-2xl border border-dark-200 bg-white p-8 text-center shadow-premium">
          <h3 className="text-lg font-extrabold text-dark-900">Dúvidas?</h3>
          <p className="mt-2 text-dark-500">Entre em contato pelo WhatsApp.</p>
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
