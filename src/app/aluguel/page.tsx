import Link from 'next/link';
import { MessageCircle, CreditCard, Sparkles, Clock, Users, Info, ArrowRight } from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatCurrency, getWhatsAppLink } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Aluguel do Espaço | Sauna e Espaço da Janice',
  description: 'Alugue nosso espaço para festas e eventos. Veja pacotes, valores e condições de pagamento.',
};

export default async function AluguelPage() {
  const [packages, whatsappSetting] = await Promise.all([
    prisma.rentalPackage.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.systemSetting.findUnique({ where: { key: 'whatsapp_rental' } }),
  ]);

  const phone = whatsappSetting?.value || '';
  const waLink = getWhatsAppLink(phone, 'Olá! Gostaria de consultar valores e disponibilidade para aluguel do espaço.');

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
            Festas e Eventos
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-dark-900 sm:text-5xl lg:text-6xl">
            Aluguel do
            <span className="block text-brand-600">Espaço</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-dark-600">
            Realize sua festa ou evento em um espaço incrível com infraestrutura completa. Confira nossos pacotes!
          </p>
          {phone && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-8 inline-flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Consultar disponibilidade
            </a>
          )}
        </div>
      </section>

      {/* Texto explicativo */}
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12">
          <span className="text-sm font-bold uppercase tracking-widest text-brand-600">Sobre o aluguel</span>
          <h2 className="mt-2 text-3xl font-extrabold text-dark-900">Como funciona o Aluguel do Espaço</h2>
        </div>

        <div className="prose prose-lg max-w-none text-dark-600">
          <p className="text-lg leading-relaxed">
            O <strong>Sauna e Espaço da Janice</strong> disponibiliza seu espaço para a realização de festas, aniversários, confraternizações e eventos diversos. Nosso local oferece uma estrutura completa e aconchegante, ideal para celebrar momentos especiais com amigos e família.
          </p>

          <p className="leading-relaxed">
            Ao alugar o espaço, você terá acesso a toda a infraestrutura disponível, incluindo a <strong>área da piscina</strong>, <strong>churrasqueira</strong>, <strong>cozinha com Air Fry e fogão</strong>, além de <strong>banheiros</strong> e <strong>área de estar</strong>. Tudo preparado para que seu evento aconteça com conforto e segurança.
          </p>

          <p className="leading-relaxed">
            Para garantir a reserva do seu evento, solicitamos que o <strong>sinal de 50% do valor total</strong> seja pago com antecedência. Esse pagamento confirma a data e garante que o espaço estará reservado exclusivamente para o seu evento. O <strong>valor restante de 50%</strong> deve ser quitado <strong>antes da entrada no dia do evento</strong>, sem exceções.
          </p>

          <p className="leading-relaxed">
            Os métodos de pagamento aceitos são exclusivamente <strong>Pix</strong> e <strong>dinheiro</strong>. Não trabalhamos com cartões de crédito ou débito para o aluguel do espaço. Todos os pagamentos devem ser realizados diretamente ao estabelecimento, de forma direta e segura.
          </p>

          <p className="leading-relaxed">
            Caso precise de mais informações sobre valores, disponibilidade de datas ou condições especiais, entre em contato pelo <strong>WhatsApp</strong>. Nossa equipe terá prazer em ajudar a planejar seu evento e esclarecer todas as suas dúvidas.
          </p>
        </div>
      </section>

      {/* Pacotes */}
      <section className="bg-dark-100 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-brand-600">Pacotes</span>
            <h2 className="mt-2 text-3xl font-extrabold text-dark-900">Pacotes Disponíveis</h2>
            <p className="mt-3 text-dark-500">Escolha o pacote ideal para o seu evento</p>
          </div>

          {packages.length === 0 ? (
            <div className="mx-auto max-w-lg rounded-2xl border border-dark-200 bg-white p-12 text-center shadow-premium">
              <Sparkles className="mx-auto mb-4 h-10 w-10 text-brand-600" />
              <h3 className="text-xl font-extrabold text-dark-900">Pacotes em breve</h3>
              <p className="mt-3 text-dark-500">Consulte pelo WhatsApp para mais informações.</p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg, index) => (
                <div
                  key={pkg.id}
                  className={`group overflow-hidden rounded-2xl border bg-white shadow-premium transition-all duration-300 hover:-translate-y-2 hover:shadow-premium-lg ${
                    index === 0 ? 'border-brand-200 ring-1 ring-brand-100' : 'border-dark-100'
                  }`}
                >
                  {index === 0 && (
                    <div className="absolute right-4 top-4 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">Mais popular</div>
                  )}
                  <div className="p-8">
                    <h3 className="text-xl font-extrabold text-dark-900">{pkg.name}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-dark-500">{pkg.description}</p>

                    <div className="mt-6 space-y-3">
                      <div className="flex items-center gap-3 rounded-xl bg-dark-50 px-4 py-3">
                        <Clock className="h-4 w-4 shrink-0 text-dark-400" />
                        <span className="text-sm text-dark-600">
                          <span className="font-bold text-dark-900">Duração:</span>{' '}
                          {pkg.days === 1 ? '1 dia' : `${pkg.days} dias`}
                        </span>
                      </div>
                      {pkg.includesSauna && (
                        <div className="flex items-center gap-3 rounded-xl bg-dark-50 px-4 py-3">
                          <Users className="h-4 w-4 shrink-0 text-dark-400" />
                          <span className="text-sm text-dark-600">
                            <span className="font-bold text-dark-900">Inclui sauna:</span> {pkg.saunaHours}h
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-dark-100 px-8 py-6">
                    {pkg.price > 0 ? (
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-extrabold text-brand-600">{formatCurrency(pkg.price)}</span>
                      </div>
                    ) : (
                      <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700">
                        <MessageCircle className="h-4 w-4" />
                        Consulte valores pelo WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Condições de Pagamento */}
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-8 sm:p-10 shadow-premium">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-600 shadow-lg shadow-brand-500/25">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-dark-900">Condições de Pagamento</h3>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">1</div>
                  <p className="text-sm text-dark-600">50% do valor antecipados para garantir a reserva</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">2</div>
                  <p className="text-sm text-dark-600">50% restantes antes da entrada no dia do evento</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">3</div>
                  <p className="text-sm text-dark-600">Aceitamos apenas <strong>Pix</strong> e <strong>dinheiro</strong></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Regras + WhatsApp */}
      <section className="bg-dark-100 px-4 py-16">
        <div className="mx-auto max-w-4xl space-y-4">
          <Link href="/aluguel/regras" className="group flex items-center justify-between rounded-2xl border border-dark-200 bg-white p-6 shadow-premium transition-all duration-300 hover:shadow-premium-lg hover:-translate-y-0.5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 transition-colors group-hover:bg-brand-600">
                <Info className="h-6 w-6 text-brand-600 transition-colors group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-dark-900">Regras do Aluguel</h3>
                <p className="text-sm text-dark-500">Leia todas as regras, orientações e termos de utilização</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-dark-400 transition-all group-hover:text-brand-600 group-hover:translate-x-1" />
          </Link>

          {phone && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp inline-flex w-full items-center justify-center gap-2 sm:w-auto">
              <MessageCircle className="h-5 w-5" />
              Consultar valores e disponibilidade
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
