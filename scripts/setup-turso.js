const { createClient } = require('@libsql/client');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const client = createClient({
  url: 'libsql://sauna-da-janice-wylon432.aws-ap-northeast-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODc3NjY5NDgsImlkIjoiMDFhMDNmMzYtOWIwMS03M2Y4LWE0NmItNjY0ZWY5NTc5NTQ0Iiwia2lkIjoibUd6RUQxQkZiOENLUXdrYkEyWnlxQnFITmdqak1aa2V4UXAxLUNfUE9QVSIsInJpZCI6IjdlZGI4YWNjLWEwNDQtNGI3Yi1iMTQ2LTMxN2IzODcwNzc5ZiJ9.oRGMleW8MOWlOmJNFAsvssRFmLnoXZdZdH-Iz7EfafNamt6ULhjPKemSLFxxKHqCeViz8HMScpD4T226FnPVDQ',
});

async function run(sql) {
  try {
    await client.execute(sql);
  } catch (e) {
    if (!e.message.includes('already exists')) {
      console.error('ERR:', e.message.substring(0, 100));
    }
  }
}

async function main() {
  console.log('Connecting to Turso...');

  const sql = fs.readFileSync('./turso-schema.sql', 'utf8').replace(/^\uFEFF/, '');
  const statements = sql
    .split(';')
    .map(s => s.replace(/--.*$/gm, '').trim())
    .filter(s => s.length > 5);

  for (const stmt of statements) {
    await run(stmt + ';');
  }
  console.log('Schema OK!');

  const now = new Date().toISOString();
  const h = async (sql, args) => { try { await client.execute({ sql, args }); } catch(e) { if (!e.message.includes('UNIQUE') && !e.message.includes('already')) console.error(e.message.substring(0,80)); }};

  const adminPw = await bcrypt.hash('admin123', 12);
  const clientPw = await bcrypt.hash('cliente123', 12);

  await h(`INSERT OR IGNORE INTO "User" (id, email, name, password, role, "emailVerified", phone, active, "twoFactorEnabled", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, ['admin-001', 'admin@sauna.com', 'Administrador', adminPw, 'ADMIN', now, '(37) 99939-2529', 1, 0, now, now]);
  await h(`INSERT OR IGNORE INTO "User" (id, email, name, password, role, "emailVerified", phone, active, "twoFactorEnabled", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, ['client-001', 'cliente@teste.com', 'Cliente Teste', clientPw, 'CLIENT', now, '(37) 99817-4242', 1, 0, now, now]);
  console.log('Users OK!');

  await h(`INSERT OR IGNORE INTO "SaunaSchedule" (id, "dayOfWeek", "dayName", gender, "startTime", "endTime", active, "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, ['schedule-2', 2, 'Terça-feira', 'FEMININO', '17:30', '22:00', 1, now, now]);
  await h(`INSERT OR IGNORE INTO "SaunaSchedule" (id, "dayOfWeek", "dayName", gender, "startTime", "endTime", active, "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, ['schedule-3', 3, 'Quarta-feira', 'MASCULINO', '17:30', '22:00', 1, now, now]);
  console.log('Schedules OK!');

  const pkgs = [
    ['pkg-1day', 'Um Dia', 'Espaço + piscina.', 1, 0, 0, 0],
    ['pkg-1day-sauna', 'Um Dia + Sauna', 'Espaço + piscina + 4h de sauna.', 1, 1, 4, 0],
    ['pkg-2day', 'Dois Dias', 'Sábado e domingo. Espaço + piscina.', 2, 0, 0, 0],
    ['pkg-2day-sauna', 'Dois Dias + Sauna', 'Sáb e Dom. Espaço + piscina + 4h sauna/dia.', 2, 1, 8, 0],
    ['pkg-3day', 'Três Dias', 'Sexta, sábado e domingo. Espaço + piscina.', 3, 0, 0, 0],
    ['pkg-3day-sauna', 'Três Dias + Sauna', 'Sexta a domingo. + 4h sauna/dia.', 3, 1, 12, 0],
  ];
  for (const p of pkgs) {
    await h(`INSERT OR IGNORE INTO "RentalPackage" (id, name, description, days, "includesSauna", "saunaHours", price, active, "sortOrder", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [...p, 1, 0, now, now]);
  }
  console.log('Packages OK!');

  const bev = [
    ['bev-1', 'Cerveja', 'CERVEJA', 8, 20, 40],
    ['bev-2', 'Água', 'AGUA', 3, 20, 30],
    ['bev-3', 'Refrigerante', 'REFRIGERANTE', 5, 15, 25],
    ['bev-4', 'Suco', 'SUCO', 5, 10, 15],
  ];
  for (const b of bev) {
    await h(`INSERT OR IGNORE INTO "Beverage" (id, name, category, unit, price, "minStock", "currentStock", active, "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [b[0], b[1], b[2], 'un', b[3], b[4], b[5], 1, now, now]);
  }
  console.log('Beverages OK!');

  const sts = [
    ['whatsapp_main', '(37) 99939-2529', 'WHATSAPP'],
    ['whatsapp_sauna', '(37) 99939-2529', 'WHATSAPP'],
    ['whatsapp_rental', '(37) 99817-4242', 'WHATSAPP'],
    ['whatsapp_message', 'Olá! Gostaria de mais informações.', 'WHATSAPP'],
    ['whatsapp_active', 'true', 'WHATSAPP'],
    ['site_name', 'Sauna e Espaço da Janice', 'GENERAL'],
    ['site_description', 'Sauna, piscina e aluguel de espaço.', 'GENERAL'],
    ['phone', '(37) 99939-2529', 'GENERAL'],
    ['pre_reserva_days', '3', 'RENTAL'],
    ['signal_percentage', '50', 'RENTAL'],
  ];
  for (const s of sts) {
    await h(`INSERT OR IGNORE INTO "SystemSetting" (id, key, value, category, "updatedAt") VALUES (?, ?, ?, ?, ?)`, [`s-${s[0]}`, s[0], s[1], s[2], now]);
  }
  console.log('Settings OK!');

  await h(`INSERT OR IGNORE INTO "Announcement" (id, text, service, "startDate", "endDate", active, "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, ['ann-1', 'Confira nossos horários e regras!', 'GERAL', now, new Date(Date.now()+90*86400000).toISOString(), 1, now, now]);
  await h(`INSERT OR IGNORE INTO "News" (id, title, slug, summary, content, category, author, status, featured, "publishedAt", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, ['news-1', 'Bem-vindos ao Sauna e Espaço da Janice', 'bem-vindos', 'Conheça nosso sistema.', '<p>Estamos felizes em apresentar nosso sistema online.</p>', 'GERAL', 'Administrador', 'PUBLISHED', 1, now, now, now]);
  console.log('Content OK!');

  console.log('\n✅ Tudo criado no Turso!');
}

main().catch(e => { console.error(e); process.exit(1); });
