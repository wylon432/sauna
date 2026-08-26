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

  let newStock = beverage.currentStock;
  if (body.type === 'ADD') newStock += body.quantity;
  else if (body.type === 'REMOVE') newStock -= body.quantity;
  else newStock = body.quantity;

  await prisma.$transaction([
    prisma.beverage.update({ where: { id: params.id }, data: { currentStock: Math.max(0, newStock) } }),
    prisma.inventoryMovement.create({
      data: {
        beverageId: params.id,
        type: body.type,
        quantity: body.quantity,
        reason: body.reason,
        performedBy: (session.user as any).id,
      },
    }),
  ]);

  return NextResponse.json({ success: true, newStock });
}
