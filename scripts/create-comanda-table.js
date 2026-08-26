const { createClient } = require('@libsql/client');

const client = createClient({
  url: 'libsql://sauna-da-janice-wylon432.aws-ap-northeast-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODc3NjY5NDgsImlkIjoiMDFhMDNmMzYtOWIwMS03M2Y4LWE0NmItNjY0ZWY5NTc5NTQ0Iiwia2lkIjoibUd6RUQxQkZiOENLUXdrYkEyWnlxQnFITmdqak1aa2V4UXAxLUNfUE9QVSIsInJpZCI6IjdlZGI4YWNjLWEwNDQtNGI3Yi1iMTQ2LTMxN2IzODcwNzc5ZiJ9.oRGMleW8MOWlOmJNFAsvssRFmLnoXZdZdH-Iz7EfafNamt6ULhjPKemSLFxxKHqCeViz8HMScpD4T226FnPVDQ',
});

async function run() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS Comanda (
      id TEXT PRIMARY KEY,
      clientName TEXT,
      clientPhone TEXT,
      saunaEntry REAL DEFAULT 20.0,
      beveragesTotal REAL DEFAULT 0,
      total REAL DEFAULT 20.0,
      status TEXT DEFAULT 'OPEN',
      openedAt TEXT NOT NULL,
      closedAt TEXT,
      closedBy TEXT,
      paymentMethod TEXT,
      notes TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS ComandaItem (
      id TEXT PRIMARY KEY,
      comandaId TEXT NOT NULL,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      unitPrice REAL NOT NULL,
      total REAL NOT NULL,
      beverageId TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (comandaId) REFERENCES Comanda(id)
    )
  `);

  console.log('Tabelas Comanda e ComandaItem criadas com sucesso!');
}

run().catch((e) => { console.error('Erro:', e); process.exit(1); });
