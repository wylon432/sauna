import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const saunaSession = await prisma.saunaSession.findUnique({
      where: { id },
      include: {
        consumptionRecords: {
          include: { beverage: true, user: { select: { id: true, name: true } } },
        },
      },
    });

    if (!saunaSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json(saunaSession);
  } catch (error) {
    console.error('Error fetching sauna session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const { id } = params;

    const saunaSession = await prisma.saunaSession.findUnique({
      where: { id },
      include: { consumptionRecords: true },
    });

    if (!saunaSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (saunaSession.status !== 'OPEN') {
      return NextResponse.json({ error: 'Session is already closed' }, { status: 400 });
    }

    const consumedStock = saunaSession.consumptionRecords.reduce((sum, r) => sum + r.quantity, 0);
    const remainingStock = saunaSession.initialStock - consumedStock;
    const totalValue = saunaSession.consumptionRecords.reduce((sum, r) => sum + r.totalValue, 0);

    const paidRecords = saunaSession.consumptionRecords.filter(r => r.paymentStatus === 'PAID');
    const receivedValue = paidRecords.reduce((sum, r) => sum + r.totalValue, 0);
    const pendingValue = totalValue - receivedValue;

    const closed = await prisma.saunaSession.update({
      where: { id },
      data: {
        status: 'CLOSED',
        consumedStock,
        remainingStock,
        totalValue,
        receivedValue,
        pendingValue,
        closedAt: new Date(),
        closedBy: userId,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CLOSE',
        resource: 'SaunaSession',
        resourceId: id,
        details: `Closed session. Consumed: ${consumedStock}, Remaining: ${remainingStock}, Total: ${totalValue}`,
      },
    });

    return NextResponse.json(closed);
  } catch (error) {
    console.error('Error closing sauna session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
