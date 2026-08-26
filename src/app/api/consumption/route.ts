import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const saunaSessionId = searchParams.get('saunaSessionId');
    const saunaReservationId = searchParams.get('saunaReservationId');

    const where: any = {};

    if (saunaSessionId) {
      where.saunaSessionId = saunaSessionId;
    }
    if (saunaReservationId) {
      where.saunaReservationId = saunaReservationId;
    }

    const records = await prisma.consumptionRecord.findMany({
      where,
      include: {
        beverage: true,
        user: { select: { id: true, name: true } },
        saunaSession: { select: { id: true, date: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching consumption records:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = (session.user as any).role === 'ADMIN';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = (session.user as any).id as string;
    const body = await request.json();
    const { beverageId, saunaSessionId, saunaReservationId, targetUserId, quantity } = body;

    if (!beverageId || !quantity || quantity <= 0) {
      return NextResponse.json({ error: 'beverageId and positive quantity are required' }, { status: 400 });
    }

    const beverage = await prisma.beverage.findUnique({ where: { id: beverageId } });
    if (!beverage) {
      return NextResponse.json({ error: 'Beverage not found' }, { status: 404 });
    }

    if (beverage.currentStock < quantity) {
      return NextResponse.json({ error: `Insufficient stock. Available: ${beverage.currentStock}` }, { status: 400 });
    }

    const totalValue = beverage.price * quantity;

    const [record] = await prisma.$transaction([
      prisma.consumptionRecord.create({
        data: {
          beverageId,
          saunaSessionId: saunaSessionId || null,
          saunaReservationId: saunaReservationId || null,
          userId: targetUserId || userId,
          quantity: Number(quantity),
          unitPrice: beverage.price,
          totalValue,
          paymentStatus: 'PENDING',
        },
      }),
      prisma.beverage.update({
        where: { id: beverageId },
        data: { currentStock: { decrement: Number(quantity) } },
      }),
    ]);

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('Error registering consumption:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
