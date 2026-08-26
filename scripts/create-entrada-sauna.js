const { createClient } = require('@libsql/client');

const client = createClient({
  url: 'libsql://sauna-da-janice-wylon432.aws-ap-northeast-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODc3NjY5NDgsImlkIjoiMDFhMDNmMzYtOWIwMS03M2Y4LWE0NmItNjY0ZWY5NTc5NTQ0Iiwia2lkIjoibUd6RUQxQkZiOENLUXdrYkEyWnlxQnFITmdqak1aa2V4UXAxLUNfUE9QVSIsInJpZCI6IjdlZGI4YWNjLWEwNDQtNGI3Yi1iMTQ2LTMxN2IzODcwNzc5ZiJ9.oRGMleW8MOWlOmJNFAsvssRFmLnoXZdZdH-Iz7EfafNamt6ULhjPKemSLFxxKHqCeViz8HMScpD4T226FnPVDQ',
});

async function run() {
  // Check if "Entrada Sauna" already exists
  const existing = await client.execute({
    sql: 'SELECT id FROM Beverage WHERE name = ?',
    args: ['Entrada Sauna'],
  });

  if (existing.rows.length > 0) {
    console.log('Entrada Sauna já existe.');
    return;
  }

  const id = 'bev-entrada-sauna-' + Date.now();
  const now = new Date().toISOString();

  await client.execute({
    sql: `INSERT INTO Beverage (id, name, category, unit, price, minStock, currentStock, active, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, 'Entrada Sauna', 'ENTRADA', 'un', 20.0, 0, 999999, 1, now, now],
  });

  console.log('Entrada Sauna criada com sucesso! ID:', id);
}

run().catch((e) => { console.error('Erro:', e); process.exit(1); });
