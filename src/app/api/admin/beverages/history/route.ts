import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  if (type === 'consumptions') {
    const consumptions = await prisma.consumptionRecord.findMany({
      include: { beverage: { select: { name: true } }, user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json({ consumptions });
  }

  const movements = await prisma.inventoryMovement.findMany({
    include: { beverage: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return NextResponse.json({ movements });
}
