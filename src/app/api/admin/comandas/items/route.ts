import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { comandaId, type, name, quantity, unitPrice, beverageId } = body;

  if (!comandaId || !type || !name) {
    return NextResponse.json({ error: 'comandaId, type and name are required' }, { status: 400 });
  }

  const qty = Number(quantity) || 1;
  const price = Number(unitPrice) || 0;
  const total = qty * price;
  const id = 'cmdi-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
  const now = new Date().toISOString();

  // If it's a beverage, check stock
  if (beverageId) {
    const beverage = await prisma.beverage.findUnique({ where: { id: beverageId } });
    if (!beverage) {
      return NextResponse.json({ error: 'Bebida não encontrada' }, { status: 404 });
    }
    if (beverage.currentStock < qty) {
      return NextResponse.json({ error: `Estoque insuficiente. Disponível: ${beverage.currentStock}` }, { status: 400 });
    }
    // Decrement stock
    await prisma.beverage.update({
      where: { id: beverageId },
      data: { currentStock: { decrement: qty } },
    });
  }

  await prisma.$executeRawUnsafe(`
    INSERT INTO ComandaItem (id, comandaId, type, name, quantity, unitPrice, total, beverageId, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, id, comandaId, type, name, qty, price, total, beverageId || null, now);

  const item = await prisma.$queryRawUnsafe(`SELECT * FROM ComandaItem WHERE id = ?`, id);

  return NextResponse.json({ item: (item as any[])[0] }, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get('itemId');
  const comandaId = searchParams.get('comandaId');

  if (!itemId) {
    return NextResponse.json({ error: 'itemId is required' }, { status: 400 });
  }

  // Get the item to restore stock if it's a beverage
  const item = await prisma.$queryRawUnsafe(`SELECT * FROM ComandaItem WHERE id = ?`, itemId) as any[];
  if (item.length > 0 && item[0].beverageId) {
    await prisma.beverage.update({
      where: { id: item[0].beverageId },
      data: { currentStock: { increment: Number(item[0].quantity) } },
    });
  }

  await prisma.$executeRawUnsafe(`DELETE FROM ComandaItem WHERE id = ?`, itemId);

  return NextResponse.json({ success: true });
}
