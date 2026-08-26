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

    const where: any = {};
    if (!isAdmin) {
      where.userId = userId;
    }

    const reservations = await prisma.rentalReservation.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        package: true,
        payments: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Error fetching rental reservations:', error);
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
    const { packageId, date, notes, termsAccepted, termsVersion } = body;

    if (!packageId || !date) {
      return NextResponse.json({ error: 'packageId and date are required' }, { status: 400 });
    }

    if (!termsAccepted) {
      return NextResponse.json({ error: 'You must accept the terms to make a reservation' }, { status: 400 });
    }

    const rentalPackage = await prisma.rentalPackage.findUnique({ where: { id: packageId } });
    if (!rentalPackage) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }
    if (!rentalPackage.active) {
      return NextResponse.json({ error: 'Package is not active' }, { status: 400 });
    }

    const reservationDate = new Date(date);
    reservationDate.setHours(0, 0, 0, 0);

    const blocked = await prisma.calendarBlock.findFirst({
      where: {
        date: reservationDate,
        service: 'ALUGUEL',
        blocked: true,
      },
    });
    if (blocked) {
      return NextResponse.json({ error: 'This date is blocked for reservations' }, { status: 400 });
    }

    const endDate = new Date(reservationDate);
    endDate.setDate(endDate.getDate() + rentalPackage.days);

    const reservation = await prisma.rentalReservation.create({
      data: {
        userId,
        packageId,
        date: reservationDate,
        endDate,
        totalValue: rentalPackage.price,
        notes: notes || null,
        termsAccepted: true,
        termsVersion: termsVersion || null,
        status: 'REQUESTED',
      },
      include: { package: true },
    });

    await prisma.reservationStatusHistory.create({
      data: {
        reservationId: reservation.id,
        newStatus: 'REQUESTED',
        changedBy: userId,
        reason: 'Reservation created',
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        resource: 'RentalReservation',
        resourceId: reservation.id,
        details: `Created rental reservation for package ${rentalPackage.name} starting ${reservationDate.toISOString()}`,
      },
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error('Error creating rental reservation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
