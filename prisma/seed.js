const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sauna.com' },
    update: {},
    create: {
      email: 'admin@sauna.com',
      name: 'Administrador',
      password: adminPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
      phone: '(37) 99939-2529',
    },
  });

  // Create test client
  const clientPassword = await bcrypt.hash('cliente123', 12);
  const client = await prisma.user.upsert({
    where: { email: 'cliente@teste.com' },
    update: {},
    create: {
      email: 'cliente@teste.com',
      name: 'Cliente Teste',
      password: clientPassword,
      phone: '(37) 99817-4242',
      role: 'CLIENT',
      emailVerified: new Date(),
    },
  });

  // Create sauna schedules
  const schedules = [
    { dayOfWeek: 2, dayName: 'Terça-feira', gender: 'FEMININO', startTime: '17:30', endTime: '22:00' },
    { dayOfWeek: 3, dayName: 'Quarta-feira', gender: 'MASCULINO', startTime: '17:30', endTime: '22:00' },
  ];

  for (const s of schedules) {
    await prisma.saunaSchedule.upsert({
      where: { id: `schedule-${s.dayOfWeek}` },
      update: {},
      create: { id: `schedule-${s.dayOfWeek}`, ...s },
    });
  }

  // Create rental packages
  const packages = [
    {
      id: 'pkg-1day',
      name: 'Um Dia',
      description: 'Espaço + piscina. Opção com 4 horas de sauna.',
      days: 1,
      includesSauna: false,
      saunaHours: 0,
      price: 0,
    },
    {
      id: 'pkg-1day-sauna',
      name: 'Um Dia + Sauna',
      description: 'Espaço + piscina + 4 horas de sauna.',
      days: 1,
      includesSauna: true,
      saunaHours: 4,
      price: 0,
    },
    {
      id: 'pkg-2day',
      name: 'Dois Dias',
      description: 'Sábado e domingo. Espaço + piscina sem sauna.',
      days: 2,
      includesSauna: false,
      saunaHours: 0,
      price: 0,
    },
    {
      id: 'pkg-2day-sauna',
      name: 'Dois Dias + Sauna',
      description: 'Sábado e domingo. Espaço + piscina + 4h de sauna por dia.',
      days: 2,
      includesSauna: true,
      saunaHours: 8,
      price: 0,
    },
    {
      id: 'pkg-3day',
      name: 'Três Dias',
      description: 'Sexta, sábado e domingo. Espaço + piscina.',
      days: 3,
      includesSauna: false,
      saunaHours: 0,
      price: 0,
    },
    {
      id: 'pkg-3day-sauna',
      name: 'Três Dias + Sauna',
      description: 'Sexta, sábado e domingo. Espaço + piscina + 4h de sauna por dia.',
      days: 3,
      includesSauna: true,
      saunaHours: 12,
      price: 0,
    },
  ];

  for (const pkg of packages) {
    await prisma.rentalPackage.upsert({
      where: { id: pkg.id },
      update: {},
      create: pkg,
    });
  }

  // Create beverages
  const beverages = [
    { id: 'bev-1', name: 'Cerveja', category: 'CERVEJA', unit: 'un', price: 8.0, minStock: 20, currentStock: 40 },
    { id: 'bev-2', name: 'Água', category: 'AGUA', unit: 'un', price: 3.0, minStock: 20, currentStock: 30 },
    { id: 'bev-3', name: 'Refrigerante', category: 'REFRIGERANTE', unit: 'un', price: 5.0, minStock: 15, currentStock: 25 },
    { id: 'bev-4', name: 'Suco', category: 'SUCO', unit: 'un', price: 5.0, minStock: 10, currentStock: 15 },
  ];

  for (const bev of beverages) {
    await prisma.beverage.upsert({
      where: { id: bev.id },
      update: {},
      create: bev,
    });
  }

  // Create system settings
  const settings = [
    { key: 'whatsapp_main', value: '(37) 99939-2529', category: 'WHATSAPP' },
    { key: 'whatsapp_sauna', value: '(37) 99939-2529', category: 'WHATSAPP' },
    { key: 'whatsapp_rental', value: '(37) 99817-4242', category: 'WHATSAPP' },
    { key: 'whatsapp_message', value: 'Olá! Gostaria de saber mais informações.', category: 'WHATSAPP' },
    { key: 'whatsapp_active', value: 'true', category: 'WHATSAPP' },
    { key: 'site_name', value: 'Sauna & Piscina', category: 'GENERAL' },
    { key: 'site_description', value: 'Seu espaço para relaxar, aproveitar e celebrar.', category: 'GENERAL' },
    { key: 'pre_reserva_days', value: '3', category: 'RENTAL' },
    { key: 'signal_percentage', value: '50', category: 'RENTAL' },
  ];

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  // Create rules
  const rules = [
    {
      id: 'rule-sauna-1',
      type: 'SAUNA',
      content: `<h2>Regras e Orientações da Sauna e Piscina</h2>

<h3>Horários de Funcionamento</h3>
<p>A sauna e piscina funcionam exclusivamente aos <strong>terças e quartas-feiras</strong>, no período da tarde da noite, das <strong>17h30 às 22h00</strong>. Os horários são separados por gênero para garantir o conforto e a privacidade de todos os clientes.</p>
<ul>
<li><strong>Terça-feira:</strong> Dia Feminino — 17h30 às 22h00</li>
<li><strong>Quarta-feira:</strong> Dia Masculino — 17h30 às 22h00</li>
</ul>
<p>É de extrema importância que todos os clientes respeitem os horários e os dias estabelecidos. O acesso fora dos horários ou dias Designados não será permitido.</p>

<h3>Alimentação</h3>
<p>O <strong>Sauna e Espaço da Janice</strong> não oferece serviço de alimentação. Não servimos porções, refeições ou lanches. No entanto, para sua comodidade, você poderá:</p>
<ul>
<li><strong>Trazer sua própria comida</strong> — Sinta-se à vontade para levar o que desejar para consumir no local.</li>
<li><strong>Utilizar a Air Fry</strong> — Para aqueles que preferem preparar algo rápido e prático.</li>
<li><strong>Utilizar o fogão</strong> — Caso deseje preparar algo mais elaborado.</li>
</ul>
<p>Pedimos que todos os clientes utilizem os equipamentos de cozinha com cuidado e responsabilidade, e que deixem tudo limpo e organizado após o uso.</p>

<h3>Bebidas</h3>
<p>Para complementar seu momento de relaxamento, disponibilizamos diversas bebidas para consumo no local. Nossa geladeira conta com <strong>cerveja, água, refrigerantes e sucos</strong>.</p>
<ul>
<li>O consumo é registrado pelo estabelecimento.</li>
<li>O pagamento das bebidas é realizado <strong>pessoalmente ao estabelecimento</strong>.</li>
<li>Métodos de pagamento aceitos: <strong>Pix</strong> e <strong>dinheiro</strong>.</li>
<li>Pedimos moderação e responsabilidade no consumo de bebidas alcoólicas.</li>
</ul>

<h3>Uso da Piscina</h3>
<ul>
<li>Respeitar os horários estabelecidos para entrada e saída.</li>
<li>Não pular na piscina de forma imprudente.</li>
<li>Manter o espaço ao redor da piscina limpo e conservado.</li>
<li>Crianças menores de 12 anos devem estar acompanhadas de um adulto responsável.</li>
<li>É proibido consumir alimentos dentro da piscina.</li>
</ul>

<h3>Uso da Sauna</h3>
<ul>
<li>Respeitar o tempo máximo de permanência na sauna (30 minutos).</li>
<li>Não utilizar substâncias químicas, óleos essenciais ou qualquer produto que possa danificar o equipamento.</li>
<li>Entrar na sauna apenas com a toalha limpa fornecida pelo estabelecimento.</li>
<li>Pessoas com problemas cardíacos, pressão alta ou outras condições de saúde devem consultar um médico antes de utilizar a sauna.</li>
<li>Em caso de indisposição, sair imediatamente e comunicar o responsável.</li>
</ul>

<h3>Conservação e Limpeza</h3>
<p>Manter o local limpo e conservado é responsabilidade de todos. Ao utilizar o espaço:</p>
<ul>
<li>Lixeira deve ser utilizada para descartar resíduos.</li>
<li>Os equipamentos devem ser utilizados com cuidado.</li>
<li>Qualquer dano causado ao espaço ou equipamentos será de responsabilidade do cliente e o valor será cobrado.</li>
<li>Ao sair, certifique-se de que deixou tudo organizado para os próximos usuários.</li>
</ul>

<h3>Responsabilidade Pessoal</h3>
<p>O <strong>Sauna e Espaço da Janice</strong> não se responsabiliza por pertences pessoais deixados no local. Recomendamos que traga apenas o necessário e mantenha seus objetos consigo durante todo o período de utilização.</p>

<h3>Comportamento</h3>
<ul>
<li>É estritamente proibido o uso de drogas ilícitas no estabelecimento.</li>
<li>Comportamentos inadequados, agressivos ou que desrespeitem outros clientes não serão tolerados.</li>
<li>O estabelecimento se reserva o direito de solicitar a saída de qualquer pessoa que não esteja cumprindo as regras.</li>
</ul>`,
      version: 1,
      author: admin.id,
    },
    {
      id: 'rule-rental-1',
      type: 'ALUGUEL',
      content: `<h2>Regras de Utilização do Espaço para Aluguel</h2>

<h3>Reserva e Pagamento</h3>
<p>Para garantir a reserva do espaço para seu evento, é necessário seguir o processo de pagamento estabelecido:</p>
<ul>
<li><strong>Sinal de 50%:</strong> O valor referente a 50% do total do aluguel deve ser pago com antecedência para confirmar a reserva. Esse pagamento garante que a data ficará exclusivamente reservada para o seu evento.</li>
<li><strong>Valor restante:</strong> Os 50% restantes devem ser quitados <strong>antes da entrada no dia do evento</strong>, sem exceções.</li>
<li><strong>Métodos de pagamento:</strong> Aceitamos exclusivamente <strong>Pix</strong> e <strong>dinheiro</strong>. Não trabalhamos com cartões de crédito ou débito.</li>
<li>A reserva somente será considerada confirmada após o registro do pagamento do sinal pelo estabelecimento.</li>
</ul>

<h3>Conservação do Espaço</h3>
<p>O locatário é responsável por manter o espaço em bom estado de conservação durante toda a utilização. Ao final do evento:</p>
<ul>
<li>O espaço deve ser entregue no mesmo estado em que foi encontrado.</li>
<li>Qualquer dano causado ao espaço, mobiliário ou equipamentos será de responsabilidade do locatário e o valor será cobrado para reparo ou substituição.</li>
<li>Todos os resíduos devem ser recolhidos e descartados nas lixeiras apropriadas.</li>
</ul>

<h3>Uso da Piscina</h3>
<ul>
<li>Respeitar os horários e regras de uso da piscina.</li>
<li>Não pular na piscina de forma imprudente.</li>
<li>Manter o espaço ao redor da piscina limpo e conservado.</li>
<li>Crianças menores de 12 anos devem estar acompanhadas de um adulto responsável.</li>
<li>É proibido consumir alimentos dentro da piscina.</li>
<li>O locatário é responsável por todos os usuários da piscina durante o evento.</li>
</ul>

<h3>Equipamentos e Infraestrutura</h3>
<ul>
<li>Utilizar todos os equipamentos com responsabilidade e según as instruções.</li>
<li>A <strong>Air Fry</strong> e o <strong>fogão</strong> devem ser utilizados com cuidado e limpos após o uso.</li>
<li>Churrasqueira: utilizar apenas com os materiais disponíveis no local. Não trazer carvão ou combustível de fora.</li>
<li>É proibido mover mobiliário de sua posição original sem autorização prévia.</li>
</ul>

<h3>Limpeza</h3>
<p>A limpeza do espaço durante e após o evento é de responsabilidade do locatário. O espaço deve ser entregue limpo e organizado. Caso contrário, poderá ser cobrada uma taxa adicional de limpeza.</p>

<h3>Cancelamento</h3>
<ul>
<li><strong>Mais de 48 horas de antecedência:</strong> Reembolso integral do sinal pago.</li>
<li><strong>Entre 24 e 48 horas:</strong> Reembolso de 50% do sinal pago.</li>
<li><strong>Menos de 24 horas:</strong> Sem reembolso.</li>
</ul>

<h3>Responsabilidades</h3>
<ul>
<li>O locatário é responsável por todos os danos causados ao espaço.</li>
<li>O estabelecimento não se responsabiliza por pertences pessoais deixados no local.</li>
<li>Qualquer atividade ilegal não será tolerada e resultará em interrupção imediata do evento sem reembolso.</li>
</ul>`,
      version: 1,
      author: admin.id,
    },
    {
      id: 'rule-pay-1',
      type: 'PAGAMENTO',
      content: `<h2>Política de Pagamento</h2>
<p>Para garantir a reserva do espaço ou da sauna, é necessário seguir a política de pagamento estabelecida pelo <strong>Sauna e Espaço da Janice</strong>.</p>
<p>Para <strong>reservas de aluguel do espaço</strong>, o pagamento é dividido em duas etapas:</p>
<ul>
<li><strong>50% antecipados:</strong> Esse valor deve ser pago no momento da reserva para confirmar a data. Somente após o registro do pagamento pelo estabelecimento é que a reserva será considerada confirmada.</li>
<li><strong>50% antes da entrada:</strong> O valor restante deve ser quitado antes da entrada no dia do evento, sem exceções.</li>
</ul>
<p>Para <strong>sauna e piscina</strong>, o pagamento é realizado diretamente no local, no momento da utilização.</p>
<p>Métodos de pagamento aceitos: <strong>Pix</strong> e <strong>Dinheiro</strong>.</p>
<p>Não trabalhamos com cartões de crédito, débito ou boleto bancário.</p>`,
      version: 1,
      author: admin.id,
    },
    {
      id: 'rule-cancel-1',
      type: 'CANCELAMENTO',
      content: `<h2>Política de Cancelamento</h2>
<p>Caso precise cancelar sua reserva, segue abaixo as condições para reembolso:</p>
<ul>
<li><strong>Cancelamentos com mais de 48 horas de antecedência:</strong> Reembolso integral do sinal pago.</li>
<li><strong>Cancelamentos entre 24 e 48 horas:</strong> Reembolso de 50% do sinal pago.</li>
<li><strong>Cancelamentos com menos de 24 horas:</strong> Sem reembolso.</li>
</ul>
<p>Para cancelar ou alterar sua reserva, entre em contato pelo <strong>WhatsApp</strong> o mais rápido possível. Nossa equipe avaliará a situação e informará as condições de reembolso.</p>`,
      version: 1,
      author: admin.id,
    },
  ];

  for (const rule of rules) {
    await prisma.rules.upsert({
      where: { id: rule.id },
      update: {},
      create: rule,
    });
  }

  // Create terms versions
  const terms = [
    {
      id: 'terms-sauna-1',
      type: 'SAUNA',
      title: 'Termos de Uso — Sauna e Piscina',
      content: 'Ao utilizar nossos serviços de sauna e piscina, você concorda com nossas regras de utilização, horários estabelecidos, política de alimentação e bebidas, bem como com as normas de conservação e responsabilidade do estabelecimento.',
      version: 1,
      active: true,
      author: admin.id,
    },
    {
      id: 'terms-rental-1',
      type: 'ALUGUEL',
      title: 'Termos de Uso — Aluguel do Espaço',
      content: 'Ao solicitar o aluguel do espaço, você concorda com a política de pagamento (50% antecipados + 50% antes da entrada), regras de utilização, conservação, cancelamento e responsabilidade por danos ao espaço.',
      version: 1,
      active: true,
      author: admin.id,
    },
    {
      id: 'terms-priv-1',
      type: 'PRIVACIDADE',
      title: 'Política de Privacidade',
      content: 'Coletamos apenas dados necessários para o funcionamento do sistema: nome, e-mail e telefone. Seus dados são protegidos e não são compartilhados com terceiros. Em conformidade com a LGPD.',
      version: 1,
      active: true,
      author: admin.id,
    },
    {
      id: 'terms-cancel-1',
      type: 'CANCELAMENTO',
      title: 'Política de Cancelamento',
      content: 'Cancelamentos com mais de 48 horas de antecedência: reembolso integral. Entre 24-48 horas: 50% de reembolso. Menos de 24 horas: sem reembolso.',
      version: 1,
      active: true,
      author: admin.id,
    },
  ];

  for (const term of terms) {
    await prisma.termsVersion.upsert({
      where: { id: term.id },
      update: {},
      create: term,
    });
  }

  // Create sample news
  await prisma.news.create({
    data: {
      title: 'Bem-vindos ao nosso novo sistema',
      slug: 'bem-vindos-ao-novo-sistema',
      summary: 'Conheça nosso novo sistema de reservas e serviços.',
      content: '<p>Estamos felizes em apresentar nosso novo sistema online. Agora você pode conhecer nossos serviços, verificar disponibilidade e fazer reservas de forma rápida e prática.</p>',
      category: 'GERAL',
      author: 'Administrador',
      status: 'PUBLISHED',
      featured: true,
      publishedAt: new Date(),
    },
  });

  // Create sample announcement
  await prisma.announcement.create({
    data: {
      text: '⚠️ Bem-vindos! Confira nossos horários e regras antes de utilizar nossos serviços.',
      service: 'GERAL',
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      active: true,
      createdBy: admin.id,
    },
  });

  console.log('Seed completed!');
  console.log('Admin: admin@sauna.com / admin123');
  console.log('Client: cliente@teste.com / cliente123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
