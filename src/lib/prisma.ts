import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL || '';

  if (databaseUrl.startsWith('libsql://') || databaseUrl.startsWith('https://')) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { PrismaLibSQL } = require('@prisma/adapter-libsql');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { createClient } = require('@libsql/client');
      const client = createClient({
        url: databaseUrl,
        authToken: process.env.TURSO_AUTH_TOKEN,
      });
      const adapter = new PrismaLibSQL(client);
      // @ts-expect-error - adapter support added in Prisma 6+, using require for runtime
      return new PrismaClient({ adapter });
    } catch {
      return new PrismaClient();
    }
  }

  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
