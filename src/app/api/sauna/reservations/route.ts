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

    const userId = (session.user as any).id as string;
    const isAdmin = (session.user as any).role === 'ADMIN';
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    const where: any = {};

    if (!isAdmin) {
      where.userId = userId;
    }

    if (date) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      where.date = { gte: dayStart, lte: dayEnd };
    }

    const reservations = await prisma.saunaReservation.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        schedule: true,
      },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Error fetching sauna reservations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id as string;
    const body = await request.json();
    const { scheduleId, date, notes } = body;

    if (!scheduleId || !date) {
      return NextResponse.json({ error: 'scheduleId and date are required' }, { status: 400 });
    }

    const schedule = await prisma.saunaSchedule.findUnique({ where: { id: scheduleId } });
    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }
    if (!schedule.active) {
      return NextResponse.json({ error: 'Schedule is not active' }, { status: 400 });
    }

    const reservationDate = new Date(date);
    reservationDate.setHours(0, 0, 0, 0);

    const existing = await prisma.saunaReservation.findUnique({
      where: { scheduleId_date: { scheduleId, date: reservationDate } },
    });
    if (existing) {
      return NextResponse.json({ error: 'Reservation already exists for this schedule and date' }, { status: 400 });
    }

    const reservation = await prisma.saunaReservation.create({
      data: {
        userId,
        scheduleId,
        date: reservationDate,
        notes: notes || null,
        status: 'CONFIRMED',
      },
      include: { schedule: true },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        resource: 'SaunaReservation',
        resourceId: reservation.id,
        details: `Created sauna reservation for ${reservationDate.toISOString()}`,
      },
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error('Error creating sauna reservation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
