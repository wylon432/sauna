import { createClient } from '@libsql/client';

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_AUTH) {
  console.error('Configure TURSO_DATABASE_URL e TURSO_AUTH_TOKEN no .env');
  process.exit(1);
}

const client = createClient({ url: TURSO_URL, authToken: TURSO_AUTH });

const SAUNA_RULES = `
<h2>REGRAS GERAIS DA SAUNA E ESPAÇO DA JANICE</h2>

<h3>1. HORÁRIO DE FUNCIONAMENTO</h3>
<ul>
  <li>A sauna funciona nos horários estabelecidos pela administração, com dias específicos para cada gênero.</li>
  <li>O funcionamento é encerrado pontualmente no horário previsto. Todos os frequentadores devem encerrar suas atividades e deixar o espaço até esse horário.</li>
  <li>A entrada após o horário de funcionamento não será permitida.</li>
  <li>Em caso de feriados ou dias especiais, os horários poderão ser alterados, sendo comunicados com antecedência pelo WhatsApp.</li>
</ul>

<h3>2. REGISTRO DE ENTRADA</h3>
<ul>
  <li>Todos os frequentadores devem se identificar na entrada do estabelecimento.</li>
  <li>A apresentação de documento de identidade com foto poderá ser solicitada.</li>
  <li>Menores de 18 anos somente poderão ingressar acompanhados de responsável legal.</li>
</ul>

<h3>3. CÓDIGO DE VESTIMENTO</h3>
<ul>
  <li>O uso de toalha no corpo é obrigatório em todos os ambientes internos.</li>
  <li>É obrigatório o uso de chinelos ou sandálias em áreas comuns (corredores, banheiros, vestiários).</li>
  <li>Nas áreas de sauna e piscina, o uso de roupa de banho adequada é obrigatório.</li>
  <li>Não é permitido o uso de roupas de rua nos ambientes molhados.</li>
</ul>

<h3>4. HIGIENE E SAÚDE</h3>
<ul>
  <li>É obrigatório tomar banho antes de utilizar a sauna e a piscina.</li>
  <li>O uso de toalha comoforro nos assentos da sauna é obrigatório.</li>
  <li>Pessoas com ferimentos abertos, doenças de pele contagiosas ou sinais de doenças infecciosas não poderão utilizar os ambientes.</li>
  <li>O uso de cosméticos, loções, perfume ou produtos químicos antes da entrada na sauna é proibido, pois prejudica a qualidade do ar e incomoda outros frequentadores.</li>
  <li>Em caso de mal-estar, náusea ou tontura, saia imediatamente da sauna e procure um membro da equipe.</li>
</ul>

<h3>5. COMPORTAMENTO E RESPEITO</h3>
<ul>
  <li>O espaço é de convivência respeitosa. Qualquer tipo de assédio, discriminação, importunação sexual ou comportamento inadequado resultará em banimento imediato e sem aviso prévio.</li>
  <li>A prática de relações sexuais no estabelecimento é terminantemente proibida.</li>
  <li>O uso de celulares com captação de áudio ou vídeo dentro dos ambientes de sauna e piscina é proibido.</li>
  <li>O volume de música ou conversa deve ser mantido em nível que não incomode outros frequentadores.</li>
  <li>A entrada de acompanhantes não autorizados ou pessoas que não frequentam o espaço é proibida.</li>
</ul>

<h3>6. BEBIDAS E ALIMENTAÇÃO</h3>
<ul>
  <li>É terminantemente proibido trazer bebidas de fora do estabelecimento. Todo consumo deve ser feito exclusivamente com os produtos disponíveis na geladeira do espaço.</li>
  <li>Alimentos podem ser trazidos para consumo no local, desde que sejam mantidos a limpeza e a conservação do espaço após o uso.</li>
  <li>O consumo de bebidas alcoólicas deve ser feito com moderação e responsabilidade. O estabelecimento se reserva o direito de suspender o fornecimento em caso de consumo excessivo.</li>
  <li>É proibido o consumo de substâncias ilícitas no estabelecimento.</li>
</ul>

<h3>7. INSTALAÇÕES E EQUIPAMENTOS</h3>
<ul>
  <li>O uso dos equipamentos deve seguir as orientações dos funcionários.</li>
  <li>É proibido alterar a temperatura dos equipamentos sem autorização.</li>
  <li>Qualquer avaria ou dano causado ao estabelecimento deverá ser indenizado pelo responsável.</li>
  <li>Os equipamentos de cozinha (Air Fry, fogão) devem ser utilizados com responsabilidade e limpos após o uso.</li>
</ul>

<h3>8. PROIBIÇÕES</h3>
<ul>
  <li>É proibido fumar dentro do estabelecimento, exceto em áreas específicas e sinalizadas.</li>
  <li>É proibido o uso de aparelhos eletrônicos na área da piscina (risco de acidente).</li>
  <li>É proibido correr nas áreas internas e ao redor da piscina.</li>
  <li>É proibido mergulhar em águas rasas.</li>
  <li>É proibido introduzir alimentos ou bebidas dentro da piscina.</li>
  <li>É proibido o uso de vidro ou frágil em áreas molhadas.</li>
</ul>

<h3>9. SEGURANÇA</h3>
<ul>
  <li>O uso da piscina é por conta e risco do frequentador. A administração não se responsabiliza por acidentes.</li>
  <li>Crianças menores de 12 anos só podem utilizar a piscina acompanhadas de um adulto responsável.</li>
  <li>Em caso de emergência, acione imediatamente a equipe do estabelecimento.</li>
  <li>O estabelecimento conta com extintores de incêndio e saídas de emergência sinalizadas.</li>
</ul>

<h3>10. PAGAMENTO</h3>
<ul>
  <li>Os valores dos serviços devem ser consultados previamente pelo WhatsApp.</li>
  <li>O pagamento deve ser realizado antes ou no momento da entrada.</li>
  <li>Os métodos de pagamento aceitos são Pix e dinheiro. Não aceitamos cartões de crédito ou débito.</li>
  <li>O consumo de bebidas da geladeira deve ser pago ao final da visita, de forma separada.</li>
</ul>

<h3>11. RESPONSABILIDADE</h3>
<ul>
  <li>O estabelecimento não se responsabiliza por objetos pessoais perdidos, esquecidos ou roubados dentro do espaço.</li>
  <li>Recomenda-se não trazer valores ou objetos de grande valor ao estabelecimento.</li>
  <li>O frequentador é responsável por todos os danos causados ao estabelecimento e seus equipamentos.</li>
</ul>

<h3>12. SANÇÕES</h3>
<ul>
  <li>O descumprimento de qualquer regra poderá resultar em advertência verbal, advertência por escrito, suspensão temporária ou banimento permanente do estabelecimento.</li>
  <li>Em caso de dano material, o frequentador será responsabilizado civil e criminalmente.</li>
  <li>O estabelecimento reserva-se o direito de recusar ou encerrar a prestação de serviços a qualquer pessoa que desrespeite as regras.</li>
</ul>

<p><strong>Ao utilizar o Sauna e Espaço da Janice, você declara ter lido e compreendido todas as regras acima e concorda em cumpri-las integralmente.</strong></p>
`;

const ALUGUEL_RULES = `
<h2>REGRAS GERAIS PARA ALUGUEL DO ESPAÇO</h2>

<h3>1. RESERVA E CONFIRMAÇÃO</h3>
<ul>
  <li>A reserva do espaço será confirmada somente após o pagamento de <strong>50% do valor total</strong> como sinal.</li>
  <li>O sinal deve ser pago em até 48 horas após a solicitação de reserva para garantir a data.</li>
  <li>A data fica reservada exclusivamente após a confirmação do pagamento do sinal.</li>
  <li>O pagamento do <strong>50% restante</strong> deve ser quitado <strong>antes da entrada no dia do evento</strong>, sem exceções.</li>
  <li>Em caso de não pagamento do restante no dia do evento, o sinal não será devolvido e a reserva será cancelada.</li>
</ul>

<h3>2. POLÍTICA DE CANCELAMENTO</h3>
<ul>
  <li><strong>Mais de 30 dias antes do evento:</strong> devolução de 70% do sinal pago.</li>
  <li><strong>Entre 15 e 30 dias antes do evento:</strong> devolução de 50% do sinal pago.</li>
  <li><strong>Menos de 15 dias antes do evento:</strong> o sinal não será devolvido.</li>
  <li><strong>No dia do evento:</strong> o valor total não será devolvido.</li>
  <li>Em caso de cancelamento por parte do estabelecimento, o valor integral será devolvido.</li>
</ul>

<h3>3. HORÁRIO DO EVENTO</h3>
<ul>
  <li>O horário de início e término do evento deve ser previamente acordado na reserva.</li>
  <li>O tempo de montagem e desmontagem do evento não está incluído no horário contratado.</li>
  <li>Todo o conteúdo trazido para o evento deve ser removido no máximo 2 horas após o término.</li>
  <li>A cada hora extra não prevista será cobrado um valor adicional, conforme tabela vigente.</li>
</ul>

<h3>4. CAPACIDADE E PÚBLICO</h3>
<ul>
  <li>A capacidade máxima do espaço deve ser respeitada. O excesso de pessoas pode comprometer a segurança.</li>
  <li>A lista de convidados deve ser informada com até 7 dias de antecedência do evento.</li>
  <li>Não será permitida a entrada de convidados não relacionados na lista, sem autorização prévia.</li>
</ul>

<h3>5. INFRAESTRUTURA INCLUSA</h3>
<ul>
  <li>O aluguel inclui o uso de: área da piscina, churrasqueira, cozinha (Air Fry e fogão), banheiros e área de estar.</li>
  <li>Os equipamentos de cozinha devem ser devolvidos limpos e em perfeitas condições de uso.</li>
  <li>Em caso de dano a qualquer equipamento, o locatário será responsável pela reparação ou substituição.</li>
</ul>

<h3>6. COMPORTAMENTO E SEGURANÇA</h3>
<ul>
  <li>O uso do espaço deve ser mantido dentro dos limites da lei e da boa convivência.</li>
  <li>A prática de atos ilegais, uso de substâncias proibidas ou comportamento violento resultará na evacuação imediata do espaço e possível instauração de processo legal.</li>
  <li>O som deve ser mantido em nível adequado para não incomodar vizinhos, respeitando o horário de silêncio (22h às 8h em dias úteis, 23h às 9h em finais de semana).</li>
  <li>É proibido o uso de fogos de artifício dentro do estabelecimento.</li>
  <li>É obrigatório o respeito a todas as normas de segurança contra incêndio.</li>
</ul>

<h3>7. LIMPEZA E CONSERVAÇÃO</h3>
<ul>
  <li>O espaço deve ser entregue nas mesmas condições em que foi recebido.</li>
  <li>A limpeza básica do espaço (varrer, recolher lixo, limpar áreas molhadas) é de responsabilidade do locatário.</li>
  <li>O lixo deve ser colocado em sacolas e retirado do local no término do evento.</li>
  <li>Em caso de sujeira excessiva ou dano, será cobrado taxa adicional de limpeza.</li>
</ul>

<h3>8. PROIBIÇÕES</h3>
<ul>
  <li>É proibido colar fita adesiva, parafusos, pregos ou qualquer material nas paredes.</li>
  <li>É proibido soltar balões, confetes ou materiais que causem sujeira excessiva.</li>
  <li>É proibido o uso de pirotecnia dentro do estabelecimento.</li>
  <li>É proibido o uso de materiais inflamáveis não autorizados.</li>
  <li>É proibido o uso de equipamentos de som potentes sem autorização prévia.</li>
  <li>É proibido transferir a reserva para terceiros sem autorização do estabelecimento.</li>
</ul>

<h3>9. PAGAMENTO</h3>
<ul>
  <li>Os métodos de pagamento aceitos são Pix e dinheiro. Não aceitamos cartões.</li>
  <li>Extras contratados durante o evento devem ser pagos na hora, antes da saída.</li>
  <li>Em caso de inadimplência, o estabelecimento poderá tomar as medidas legais cabíveis.</li>
</ul>

<h3>10. RESPONSABILIDADE</h3>
<ul>
  <li>O organizador do evento é responsável por todos os danos causados ao estabelecimento, seus equipamentos e terceiros.</li>
  <li>O estabelecimento não se responsabiliza por acidentes, furtos ou danos a pessoas ou objetos durante o evento.</li>
  <li>É recomendável a contratação de seguro de responsabilidade civil para eventos de grande porte.</li>
  <li>O uso da piscina durante o evento é por conta e risco dos participantes.</li>
</ul>

<h3>11. REGISTRO</h3>
<ul>
  <li>Um responsável pelo evento deve ser indicado na reserva, com dados de contato atualizados.</li>
  <li>O responsável deve estar presente durante todo o evento e ser o ponto de contato com o estabelecimento.</li>
</ul>

<p><strong>Ao reservar o Sauna e Espaço da Janice, você declara ter lido e compreendido todas as regras acima e concorda em cumpri-las integralmente.</strong></p>
`;

async function upsertRules() {
  // Delete existing rules
  await client.execute('DELETE FROM "Rules"');
  console.log('Regras antigas removidas.');

  // Insert sauna rules
  await client.execute({
    sql: `INSERT INTO Rules (id, type, content, version, active, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      'rules-sauna-1',
      'SAUNA',
      SAUNA_RULES,
      1,
      1,
      new Date().toISOString(),
      new Date().toISOString(),
    ],
  });
  console.log('Regras da sauna inseridas.');

  // Insert rental rules
  await client.execute({
    sql: `INSERT INTO Rules (id, type, content, version, active, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      'rules-aluguel-1',
      'ALUGUEL',
      ALUGUEL_RULES,
      1,
      1,
      new Date().toISOString(),
      new Date().toISOString(),
    ],
  });
  console.log('Regras do aluguel inseridas.');
}

upsertRules().catch((e) => {
  console.error('Erro:', e);
  process.exit(1);
});
