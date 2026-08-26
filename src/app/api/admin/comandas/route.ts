import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const comandas = await prisma.$queryRawUnsafe(`
    SELECT * FROM Comanda ORDER BY createdAt DESC
  `);

  return NextResponse.json({ comandas });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { clientName, clientPhone } = body;
  const id = 'cmd-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
  const now = new Date().toISOString();

  await prisma.$executeRawUnsafe(`
    INSERT INTO Comanda (id, clientName, clientPhone, saunaEntry, beveragesTotal, total, status, openedAt, createdAt, updatedAt)
    VALUES (?, ?, ?, 20.0, 0.0, 20.0, 'OPEN', ?, ?, ?)
  `, id, clientName || null, clientPhone || null, now, now, now);

  const comanda = await prisma.$queryRawUnsafe(`SELECT * FROM Comanda WHERE id = ?`, id);

  return NextResponse.json({ comanda: (comanda as any[])[0] }, { status: 201 });
}
