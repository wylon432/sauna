import Link from 'next/link';
import { Clock, Users, Utensils, Wine, MessageCircle, CalendarCheck, Sparkles, ArrowRight, Info } from 'lucide-react';
import prisma from '@/lib/prisma';
import { getWhatsAppLink, GENDERS, DAYS_OF_WEEK } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Sauna e Espaço da Janice',
  description: 'Conheça nossos horários de sauna masculina e feminina, regras de utilização, alimentação e bebidas.',
};

export default async function SaunaPage() {
  const [schedules, whatsappSetting] = await Promise.all([
    prisma.saunaSchedule.findMany({ where: { active: true }, orderBy: [{ dayOfWeek: 'asc' }, { gender: 'asc' }] }),
    prisma.systemSetting.findUnique({ where: { key: 'whatsapp_sauna' } }),
  ]);

  const phone = whatsappSetting?.value || '';
  const waLink = getWhatsAppLink(phone, 'Olá! Gostaria de tirar dúvidas sobre a sauna e piscina.');

  const grouped = schedules.reduce<Record<number, typeof schedules>>((acc, s) => {
    if (!acc[s.dayOfWeek]) acc[s.dayOfWeek] = [];
    acc[s.dayOfWeek].push(s);
    return acc;
  }, {});

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-brand-50/30 to-white px-4 py-20 sm:py-28">
        <div className="absolute inset-0">
          <div className="absolute left-[10%] top-[20%] h-[400px] w-[400px] rounded-full bg-brand-500/8 blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[10%] right-[10%] h-[300px] w-[300px] rounded-full bg-brand-400/6 blur-[100px] animate-glow-pulse [animation-delay:1.5s]" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-100/60 px-4 py-2 text-sm font-semibold text-brand-700">
            <Sparkles className="h-4 w-4" />
            Relaxamento e Bem-estar
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-dark-900 sm:text-5xl lg:text-6xl">
            Sauna e Espaço
            <span className="block text-brand-600">da Janice</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-dark-600">
            Venha relaxar em nosso ambiente acolhedor e exclusivo. Aqui você encontra o equilíbrio perfeito entre descanso e bem-estar, com horários exclusivos para masculino e feminino.
          </p>
          {phone && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-8 inline-flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Tirar dúvidas pelo WhatsApp
            </a>
          )}
        </div>
      </section>

      {/* Texto explicativo - Como funciona */}
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12">
          <span className="text-sm font-bold uppercase tracking-widest text-brand-600">Conheça nosso espaço</span>
          <h2 className="mt-2 text-3xl font-extrabold text-dark-900">Como funciona a Sauna e Espaço da Janice</h2>
        </div>

        <div className="prose prose-lg max-w-none text-dark-600">
          <p className="text-lg leading-relaxed">
            A <strong>Sauna e Espaço da Janice</strong> foi criada para oferecer uma experiência completa de relaxamento e lazer. Nosso espaço conta com <strong>sauna seca</strong> e <strong>piscina</strong>, ambientes preparados para proporcionar momentos de descontração e descanso após uma semana de muito trabalho.
          </p>

          <p className="leading-relaxed">
            Funcionamos aos <strong>terças e quartas-feiras</strong>, sempre no período da tarde da noite, com horários exclusivos separados por gênero. Essa separação existe para garantir o <strong>conforto, a privacidade e a segurança</strong> de todos os nossos clientes. Dessa forma, cada pessoa pode aproveitar o espaço de forma tranquila, sem preocupações.
          </p>

          <p className="leading-relaxed">
            Na <strong>terça-feira</strong>, o espaço é dedicado exclusivamente ao <strong>público feminino</strong>. Já na <strong>quarta-feira</strong>, é o dia exclusivo para o <strong>público masculino</strong>. Os horários de funcionamento são sempre das <strong>17h30 às 22h00</strong>, permitindo que você aproveite o final da tarde e a noite em um ambiente agradável.
          </p>

          <p className="leading-relaxed">
            Ao chegar, você terá acesso completo à <strong>sauna</strong> e à <strong>piscina</strong>. A sauna seca é ideal para relaxar os músculos, aliviar o estresse e melhorar a circulação sanguínea. A piscina complementa a experiência, oferecendo uma sensação refrescante e rejuvenescedora. Os dois ambientes trabalham juntos para proporcionar uma experiência de bem-estar completa.
          </p>

          <p className="leading-relaxed">
            Nosso espaço é mantido com o <strong>máximo de higiene e conservação</strong>. Trabalhamos diariamente para garantir que tudo esteja em perfeitas condições para o seu uso. Pedimos a colaboração de todos para manter o local limpo e conservado durante e após a utilização.
          </p>
        </div>
      </section>

      {/* Horários */}
      <section className="bg-gradient-to-b from-brand-50/40 to-white px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-brand-600">Horários</span>
            <h2 className="mt-2 text-3xl font-extrabold text-dark-900">Dias e Horários de Funcionamento</h2>
            <p className="mt-3 text-dark-500">Confira os horários disponíveis para cada dia da semana</p>
          </div>

          {schedules.length === 0 ? (
            <div className="rounded-2xl border border-dark-200 bg-white p-12 text-center shadow-premium">
              <Clock className="mx-auto mb-4 h-10 w-10 text-dark-400" />
              <h3 className="text-lg font-bold text-dark-900">Horários em breve</h3>
              <p className="mt-2 text-dark-500">Consulte pelo WhatsApp para mais informações.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([day, daySchedules]) => (
                  <div key={day} className="overflow-hidden rounded-2xl border border-dark-200 bg-white shadow-premium">
                    <div className="border-b border-dark-100 bg-brand-50 px-6 py-4">
                      <h3 className="text-lg font-extrabold text-dark-900">{DAYS_OF_WEEK[Number(day)] || `Dia ${day}`}</h3>
                    </div>
                    <div className="p-6">
                      {daySchedules.map((s) => (
                        <div key={s.id} className="flex items-center gap-4 py-3">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${s.gender === 'FEMININO' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                            <Users className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${s.gender === 'FEMININO' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                              {GENDERS[s.gender] || s.gender}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-dark-900">{s.startTime}</span>
                            <span className="mx-2 text-dark-400">até</span>
                            <span className="text-lg font-bold text-dark-900">{s.endTime}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </section>

      {/* Alimentação e Bebidas - Texto detalhado */}
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12">
          <span className="text-sm font-bold uppercase tracking-widest text-brand-600">Informações</span>
          <h2 className="mt-2 text-3xl font-extrabold text-dark-900">Alimentação e Bebidas</h2>
        </div>

        <div className="space-y-10">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
                <Utensils className="h-5 w-5 text-brand-600" />
              </div>
              <h3 className="text-xl font-extrabold text-dark-900">Sobre a Alimentação</h3>
            </div>
            <div className="text-dark-600 space-y-4">
              <p className="leading-relaxed">
                O <strong>Sauna e Espaço da Janice</strong> não oferece serviço de alimentação. Ou seja, não servimos porções, refeições ou lanches. No entanto, entendemos que a comida faz parte da experiência de lazer, por isso oferecemos alternativas práticas para que você possa levar e preparar o que preferir.
              </p>
              <p className="leading-relaxed">
                Você poderá <strong>trazer sua própria comida</strong> para consumir no local. Seja um lanche ou uma refeição leve, fique à vontade para trazer o que desejar. A única exigência é que o espaço seja mantido limpo e conservado após o uso.
              </p>
              <p className="leading-relaxed">
                Para sua comodidade, o espaço conta com uma <strong>Air Fry</strong> disponível para uso dos clientes. Com ela, você pode preparar alimentos de forma rápida e prática, sem necessidade de levar panelas ou utensílios extras. Também há um <strong>fogão disponível</strong> para quem desejar preparar algo mais elaborado.
              </p>
              <p className="leading-relaxed">
                Pedimos que todos os clientes utilizem os equipamentos de cozinha com cuidado e responsabilidade, e que deixem tudo limpo e organizado após o uso. Isso garante que o espaço esteja em boas condições para todos.
              </p>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-dark-200 to-transparent" />

          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
                <Wine className="h-5 w-5 text-brand-600" />
              </div>
              <h3 className="text-xl font-extrabold text-dark-900">Sobre as Bebidas</h3>
            </div>
            <div className="text-dark-600 space-y-4">
              <p className="leading-relaxed">
                Para complementar seu momento de relaxamento, o <strong>Sauna e Espaço da Janice</strong> disponibiliza diversas bebidas para consumo no local. Nossa geladeira conta com opções como <strong>cerveja, água, refrigerantes e sucos</strong>, para todos os gostos.
              </p>
              <p className="leading-relaxed">
                O funcionamento é simples: quando você chegar, poderá <strong>pegar as bebidas disponíveis diretamente na geladeira</strong>. Todo o consumo é registrado de forma controle pelo estabelecimento. Ao final da sua visita, o pagamento das bebidas é realizado <strong>pessoalmente ao estabelecimento</strong>, de forma direta e sem complicação.
              </p>
              <p className="leading-relaxed">
                Os métodos de pagamento aceitos para as bebidas são <strong>Pix</strong> e <strong>dinheiro</strong>. Não há cobrança automática ou integração com máquinas de cartão para esse serviço. O valor total das bebidas consumidas será informado no momento do pagamento, e você poderá conferir todos os itens registrados.
              </p>
              <p className="leading-relaxed">
                <strong>É terminantemente proibido trazer bebidas de fora do estabelecimento.</strong> Todo o consumo de bebidas deve ser realizado exclusivamente com os produtos disponíveis na geladeira do espaço. O descumprimento desta regra resultará em multa e possível suspensão do acesso ao local.
              </p>
              <p className="leading-relaxed">
                Pedimos que as bebidas sejam consumidas com <strong>moderação e responsabilidade</strong>. O estabelecimento se reserva o direito de suspender o fornecimento de bebidas em caso de consumo excessivo ou comportamento inadequado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Regras link + WhatsApp */}
      <section className="bg-dark-100 px-4 py-16">
        <div className="mx-auto max-w-4xl space-y-4">
          <Link href="/sauna/regras" className="group flex items-center justify-between rounded-2xl border border-dark-200 bg-white p-6 shadow-premium transition-all duration-300 hover:shadow-premium-lg hover:-translate-y-0.5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 transition-colors group-hover:bg-brand-600">
                <Info className="h-6 w-6 text-brand-600 transition-colors group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-dark-900">Regras da Sauna e Piscina</h3>
                <p className="text-sm text-dark-500">Leia todas as regras, orientações e termos de utilização</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-dark-400 transition-all group-hover:text-brand-600 group-hover:translate-x-1" />
          </Link>

          {phone && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp inline-flex w-full items-center justify-center gap-2 sm:w-auto">
              <MessageCircle className="h-5 w-5" />
              Tirar dúvidas pelo WhatsApp
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
