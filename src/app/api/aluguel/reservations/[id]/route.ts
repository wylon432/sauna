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

    const userId = (session.user as any).id as string;
    const isAdmin = (session.user as any).role === 'ADMIN';
    const { id } = params;

    const reservation = await prisma.rentalReservation.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        package: true,
        payments: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    if (!isAdmin && reservation.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Error fetching rental reservation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id as string;
    const isAdmin = (session.user as any).role === 'ADMIN';
    const { id } = params;
    const body = await request.json();
    const { status, reason, adminNotes } = body;

    const reservation = await prisma.rentalReservation.findUnique({ where: { id } });
    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    if (isAdmin) {
      const oldStatus = reservation.status;

      const updated = await prisma.rentalReservation.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(adminNotes !== undefined && { adminNotes }),
        },
        include: { package: true },
      });

      if (status && status !== oldStatus) {
        await prisma.reservationStatusHistory.create({
          data: {
            reservationId: id,
            oldStatus,
            newStatus: status,
            changedBy: userId,
            reason: reason || `Status updated by admin`,
          },
        });

        await prisma.auditLog.create({
          data: {
            userId,
            action: 'UPDATE_STATUS',
            resource: 'RentalReservation',
            resourceId: id,
            details: `Status changed from ${oldStatus} to ${status}. Reason: ${reason || 'N/A'}`,
          },
        });
      }

      return NextResponse.json(updated);
    }

    if (reservation.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (status === 'CANCELLED') {
      const now = new Date();
      const reservationDate = new Date(reservation.date);
      reservationDate.setHours(0, 0, 0, 0);
      const daysUntil = Math.ceil((reservationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntil < 2) {
        return NextResponse.json({ error: 'Cannot cancel within 2 days of reservation date' }, { status: 400 });
      }

      const hasPaid = await prisma.payment.findFirst({
        where: { rentalReservationId: id, status: 'RECEIVED' },
      });
      if (hasPaid) {
        return NextResponse.json({ error: 'Cannot cancel a reservation with payments. Please contact admin.' }, { status: 400 });
      }

      const updated = await prisma.rentalReservation.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      await prisma.reservationStatusHistory.create({
        data: {
          reservationId: id,
          oldStatus: reservation.status,
          newStatus: 'CANCELLED',
          changedBy: userId,
          reason: reason || 'Cancelled by user',
        },
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'Invalid status change' }, { status: 400 });
  } catch (error) {
    console.error('Error updating rental reservation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id as string;
    const { id } = params;

    const reservation = await prisma.rentalReservation.findUnique({ where: { id } });
    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    if (reservation.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!['REQUESTED', 'PRE_RESERVED'].includes(reservation.status)) {
      return NextResponse.json({ error: 'Cannot cancel reservation with current status' }, { status: 400 });
    }

    const oldStatus = reservation.status;

    const updated = await prisma.rentalReservation.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    await prisma.reservationStatusHistory.create({
      data: {
        reservationId: id,
        oldStatus,
        newStatus: 'CANCELLED',
        changedBy: userId,
        reason: 'Cancelled by user',
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error cancelling rental reservation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
