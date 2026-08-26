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

    if (!isAdmin && userId !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const reservations = await prisma.rentalReservation.findMany({
      where: { userId: params.id },
      include: {
        package: true,
        payments: { select: { id: true, amount: true, status: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Error fetching rental reservations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
