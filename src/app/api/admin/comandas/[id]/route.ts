import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const comanda = await prisma.$queryRawUnsafe(`SELECT * FROM Comanda WHERE id = ?`, params.id) as any[];
  const items = await prisma.$queryRawUnsafe(`SELECT * FROM ComandaItem WHERE comandaId = ? ORDER BY createdAt ASC`, params.id);

  if (comanda.length === 0) {
    return NextResponse.json({ error: 'Comanda not found' }, { status: 404 });
  }

  return NextResponse.json({ comanda: comanda[0], items });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { action, paymentMethod, notes } = body;
  const { id } = params;
  const now = new Date().toISOString();

  if (action === 'close') {
    const items = await prisma.$queryRawUnsafe(
      `SELECT COALESCE(SUM(total), 0) as beveragesTotal FROM ComandaItem WHERE comandaId = ?`, id
    ) as any[];
    const beveragesTotal = Number(items[0]?.beveragesTotal || 0);

    const comanda = await prisma.$queryRawUnsafe(`SELECT saunaEntry FROM Comanda WHERE id = ?`, id) as any[];
    const saunaEntry = Number(comanda[0]?.saunaEntry || 20);
    const total = saunaEntry + beveragesTotal;

    await prisma.$executeRawUnsafe(`
      UPDATE Comanda SET status = 'CLOSED', closedAt = ?, closedBy = ?, paymentMethod = ?, beveragesTotal = ?, total = ?, notes = ?, updatedAt = ?
      WHERE id = ?
    `, now, (session.user as any).id, paymentMethod || 'DINHEIRO', beveragesTotal, total, notes || null, now, id);
  } else if (action === 'cancel') {
    await prisma.$executeRawUnsafe(`
      UPDATE Comanda SET status = 'CANCELLED', closedAt = ?, updatedAt = ? WHERE id = ?
    `, now, now, id);
  } else if (action === 'reopen') {
    await prisma.$executeRawUnsafe(`
      UPDATE Comanda SET status = 'OPEN', closedAt = NULL, closedBy = NULL, updatedAt = ? WHERE id = ?
    `, now, id);
  }

  const updated = await prisma.$queryRawUnsafe(`SELECT * FROM Comanda WHERE id = ?`, id);
  return NextResponse.json({ comanda: (updated as any[])[0] });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.$executeRawUnsafe(`DELETE FROM ComandaItem WHERE comandaId = ?`, params.id);
  await prisma.$executeRawUnsafe(`DELETE FROM Comanda WHERE id = ?`, params.id);

  return NextResponse.json({ success: true });
}
