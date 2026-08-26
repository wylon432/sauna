import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';

  const { PrismaLibSql } = require('@prisma/adapter-libsql');
  const { createClient } = require('@libsql/client');
  const client = createClient({
    url: databaseUrl,
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  });
  const adapter = new PrismaLibSql(client);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
