import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await prisma.saunaSession.findMany({
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sauna sessions:', error);
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
    const { date, dayOfWeek, gender, initialStock } = body;

    if (!date || !dayOfWeek || !gender || initialStock === undefined) {
      return NextResponse.json({ error: 'date, dayOfWeek, gender, and initialStock are required' }, { status: 400 });
    }

    const openSession = await prisma.saunaSession.findFirst({
      where: {
        gender,
        status: 'OPEN',
      },
    });
    if (openSession) {
      return NextResponse.json({ error: `There is already an open session for ${gender}` }, { status: 400 });
    }

    const saunaSession = await prisma.saunaSession.create({
      data: {
        date: new Date(date),
        dayOfWeek,
        gender,
        initialStock: Number(initialStock),
        remainingStock: Number(initialStock),
        consumedStock: 0,
        totalValue: 0,
        receivedValue: 0,
        pendingValue: 0,
        status: 'OPEN',
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        resource: 'SaunaSession',
        resourceId: saunaSession.id,
        details: `Opened session for ${gender} on ${date} with ${initialStock} stock`,
      },
    });

    return NextResponse.json(saunaSession, { status: 201 });
  } catch (error) {
    console.error('Error creating sauna session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
