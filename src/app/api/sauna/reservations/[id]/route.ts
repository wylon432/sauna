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

    const reservation = await prisma.saunaReservation.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        schedule: true,
        consumptionRecords: { include: { beverage: true } },
        payments: true,
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
    console.error('Error fetching sauna reservation:', error);
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
    const { status, notes } = body;

    const reservation = await prisma.saunaReservation.findUnique({ where: { id } });
    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    if (!isAdmin && reservation.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!isAdmin && status && status !== 'CANCELLED') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const oldStatus = reservation.status;

    const updated = await prisma.saunaReservation.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
      include: { schedule: true },
    });

    if (status && status !== oldStatus) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'UPDATE_STATUS',
          resource: 'SaunaReservation',
          resourceId: id,
          details: `Status changed from ${oldStatus} to ${status}`,
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating sauna reservation:', error);
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

    const reservation = await prisma.saunaReservation.findUnique({ where: { id } });
    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    const isAdmin = (session.user as any).role === 'ADMIN';
    if (!isAdmin && reservation.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await prisma.saunaReservation.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CANCEL',
        resource: 'SaunaReservation',
        resourceId: id,
        details: 'Reservation cancelled',
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error cancelling sauna reservation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
