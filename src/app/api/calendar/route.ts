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
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const service = searchParams.get('service');

    const where: any = {};

    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
      where.date = { gte: startDate, lte: endDate };
    }

    if (service) {
      where.service = service;
    }

    const blocks = await prisma.calendarBlock.findMany({ where, orderBy: { date: 'asc' } });

    const rentalReservations = await prisma.rentalReservation.findMany({
      where: {
        status: { notIn: ['CANCELLED', 'REJECTED'] },
        ...(month && year
          ? {
              date: {
                gte: new Date(Number(year), Number(month) - 1, 1),
                lte: new Date(Number(year), Number(month), 0, 23, 59, 59, 999),
              },
            }
          : {}),
      },
      select: { id: true, date: true, endDate: true, status: true },
      orderBy: { date: 'asc' },
    });

    const saunaReservations = await prisma.saunaReservation.findMany({
      where: {
        status: { notIn: ['CANCELLED'] },
        ...(month && year
          ? {
              date: {
                gte: new Date(Number(year), Number(month) - 1, 1),
                lte: new Date(Number(year), Number(month), 0, 23, 59, 59, 999),
              },
            }
          : {}),
      },
      select: { id: true, date: true, status: true },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json({ blocks, rentalReservations, saunaReservations });
  } catch (error) {
    console.error('Error fetching calendar data:', error);
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
    const { date, service, reason, blocked } = body;

    if (!date || !service) {
      return NextResponse.json({ error: 'date and service are required' }, { status: 400 });
    }

    const blockDate = new Date(date);
    blockDate.setHours(0, 0, 0, 0);

    const existing = await prisma.calendarBlock.findFirst({
      where: { date: blockDate, service },
    });

    let block;
    if (existing) {
      block = await prisma.calendarBlock.update({
        where: { id: existing.id },
        data: {
          blocked: blocked !== undefined ? blocked : true,
          reason: reason || existing.reason,
          createdBy: userId,
        },
      });
    } else {
      block = await prisma.calendarBlock.create({
        data: {
          date: blockDate,
          service,
          blocked: blocked !== undefined ? blocked : true,
          reason: reason || null,
          createdBy: userId,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId,
        action: existing ? 'UPDATE' : 'CREATE',
        resource: 'CalendarBlock',
        resourceId: block.id,
        details: `Block ${existing ? 'updated' : 'created'} for ${service} on ${blockDate.toISOString()}`,
      },
    });

    return NextResponse.json(block, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error('Error creating calendar block:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
