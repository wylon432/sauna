import { createClient } from '@libsql/client';

const client = createClient({
  url: 'libsql://sauna-da-janice-wylon432.aws-ap-northeast-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTMwNDQwNjIsImlkIjoiZGMxNjUwMjAtMDQwOS00YjRmLThiMWItOTBhZWEwNjIyNjI0IiwicmlkIjoiZGNiMjAzYjItMDFlZC00NjZhLWFiZGMtMDM0ZTcyOTQ1MTM5In0.WjEp1VNzK3MiBkyrVTVxvG6zyJ2VzZ2dVnVmd3lSa17MAbOT8Jx9W9fbE_6o6pV4Q8lEqWpJXFZpLpGwFBxbDg',
});

async function main() {
  // Deactivate old sauna rules
  await client.execute({
    sql: "UPDATE Rules SET active = 0 WHERE type = 'SAUNA'",
    args: [],
  });

  // Deactivate old aluguel rules
  await client.execute({
    sql: "UPDATE Rules SET active = 0 WHERE type = 'ALUGUEL'",
    args: [],
  });

  // Get latest sauna version
  const saunaVersions = await client.execute({
    sql: "SELECT MAX(version) as maxVer FROM Rules WHERE type = 'SAUNA'",
    args: [],
  });
  const saunaNext = (saunaVersions.rows[0]?.maxVer || 0) + 1;

  // Get latest aluguel version
  const aluguelVersions = await client.execute({
    sql: "SELECT MAX(version) as maxVer FROM Rules WHERE type = 'ALUGUEL'",
    args: [],
  });
  const aluguelNext = (aluguelVersions.rows[0]?.maxVer || 0) + 1;

  // Simplified sauna rules
  const saunaContent = `<h3>Horário de Funcionamento</h3>
<ul>
<li>Terça-feira: Feminino — 17h30 às 22h00</li>
<li>Quarta-feira: Masculino — 17h30 às 22h00</li>
<li>Não será permitido o acesso fora dos horários acima</li>
</ul>

<h3>Entrada e Pagamento</h3>
<ul>
<li>Entrada: R$ 20,00 por pessoa (bebidas inclusas na comanda)</li>
<li>Pagamento no local: Pix ou dinheiro</li>
<li>O pagamento da entrada deve ser feito no momento do acesso</li>
</ul>

<h3>Bebidas</h3>
<ul>
<li>As bebidas são retiradas da geladeira e registradas em comanda</li>
<li>Pagamento das bebidas ao final da visita (Pix ou dinheiro)</li>
<li>Não é permitido trazer bebidas de fora</li>
</ul>

<h3>Regras de Conduta</h3>
<ul>
<li>Respeite os outros frequentadores — o espaço é de uso coletivo</li>
<li>Mantenha o local limpo e organizado após o uso</li>
<li>Use os equipamentos com cuidado (sauna, piscina, cozinha)</li>
<li>É proibido o uso de aparelhos de som sem autorização</li>
<li>Qualquer dano causado será de responsabilidade do usuário</li>
</ul>

<h3>Equipamentos</h3>
<ul>
<li>Fogão, panelas e Air Fry disponíveis para uso dos clientes</li>
<li>Deixe tudo limpo e organizado após utilizar</li>
</ul>

<h3>Segurança</h3>
<ul>
<li>Menores de 18 anos precisam estar acompanhados de responsável</li>
<li>O estabelecimento não se responsabiliza por objetos perdidos</li>
<li>Em caso de emergência, procure a recepção</li>
</ul>`;

  await client.execute({
    sql: "INSERT INTO Rules (id, type, content, version, active, author, createdAt, updatedAt) VALUES (lower(hex(randomblob(16))), ?, ?, ?, 1, 'admin', datetime('now'), datetime('now'))",
    args: ['SAUNA', saunaContent, saunaNext],
  });

  console.log(`✅ Regras da sauna atualizadas (v${saunaNext})`);

  // Simplified aluguel rules
  const aluguelContent = `<h3>Reserva e Pagamento</h3>
<ul>
<li>Sinal de 50% do valor total para garantir a reserva</li>
<li>Valor restante de 50% antes da entrada no dia do evento</li>
<li>Aceitamos apenas Pix e dinheiro</li>
</ul>

<h3>Horário e Capacidade</h3>
<ul>
<li>O horário do evento deve ser combinado no momento da reserva</li>
<li>Capacidade máxima conforme combinado — respeite o limite</li>
</ul>

<h3>Infraestrutura Incluída</h3>
<ul>
<li>Área da piscina, churrasqueira e banheiros</li>
<li>Cozinha com fogão, panelas e Air Fry</li>
<li>Área de estar</li>
</ul>

<h3>Regras de Conduta</h3>
<ul>
<li>Respeite os vizinhos — não ultrapasse o horário combinado</li>
<li>Mantenha o local limpo e organizado após o evento</li>
<li>Proibido causar danos à estrutura ou mobiliário</li>
<li>Qualquer dano será cobrado do responsável pela reserva</li>
</ul>

<h3>Cancelamento</h3>
<ul>
<li>O sinal não é reembolsável em caso de cancelamento</li>
<li>Em caso de imprevisto, entre em contato pelo WhatsApp</li>
</ul>`;

  await client.execute({
    sql: "INSERT INTO Rules (id, type, content, version, active, author, createdAt, updatedAt) VALUES (lower(hex(randomblob(16))), ?, ?, ?, 1, 'admin', datetime('now'), datetime('now'))",
    args: ['ALUGUEL', aluguelContent, aluguelNext],
  });

  console.log(`✅ Regras do aluguel atualizadas (v${aluguelNext})`);
}

main().catch(console.error);
