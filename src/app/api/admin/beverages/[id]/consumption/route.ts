import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const beverage = await prisma.beverage.findUnique({ where: { id: params.id } });
  if (!beverage) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const totalValue = beverage.price * body.quantity;
  const newStock = Math.max(0, beverage.currentStock - body.quantity);

  await prisma.$transaction([
    prisma.beverage.update({ where: { id: params.id }, data: { currentStock: newStock } }),
    prisma.consumptionRecord.create({
      data: {
        beverageId: params.id,
        userId: (session.user as any).id,
        quantity: body.quantity,
        unitPrice: beverage.price,
        totalValue,
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
