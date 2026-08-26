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

    const payments = await prisma.payment.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        rentalReservation: { select: { id: true, date: true, status: true } },
        saunaReservation: { select: { id: true, date: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
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
    const { userId: targetUserId, rentalReservationId, saunaReservationId, type, method, amount, description } = body;

    if (!targetUserId || !type || !method || !amount) {
      return NextResponse.json({ error: 'userId, type, method, and amount are required' }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    const payment = await prisma.payment.create({
      data: {
        userId: targetUserId,
        rentalReservationId: rentalReservationId || null,
        saunaReservationId: saunaReservationId || null,
        type,
        method,
        amount: Number(amount),
        description: description || null,
        status: 'RECEIVED',
        registeredBy: userId,
      },
    });

    if (rentalReservationId) {
      const rental = await prisma.rentalReservation.findUnique({
        where: { id: rentalReservationId },
        include: { payments: { where: { status: 'RECEIVED' } } },
      });

      if (rental) {
        const totalPaid = rental.payments.reduce((sum, p) => sum + p.amount, 0) + Number(amount);
        const halfPrice = rental.totalValue / 2;

        let newStatus = rental.status;
        if (totalPaid >= rental.totalValue) {
          newStatus = 'CONFIRMED';
        } else if (totalPaid >= halfPrice) {
          newStatus = 'PARTIAL_PAYMENT';
        } else if (totalPaid > 0) {
          newStatus = 'PARTIAL_PAYMENT';
        }

        if (newStatus !== rental.status) {
          await prisma.rentalReservation.update({
            where: { id: rentalReservationId },
            data: { status: newStatus },
          });

          await prisma.reservationStatusHistory.create({
            data: {
              reservationId: rentalReservationId,
              oldStatus: rental.status,
              newStatus,
              changedBy: userId,
              reason: `Payment of ${amount} registered (${totalPaid}/${rental.totalValue})`,
            },
          });
        }
      }
    }

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        resource: 'Payment',
        resourceId: payment.id,
        details: `Registered payment of ${amount} (${type}/${method})`,
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
