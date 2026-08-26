import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const users = await prisma.user.findMany({
    include: {
      rentalReservations: {
        include: { package: { select: { name: true } } },
        orderBy: { date: 'desc' },
        take: 5,
      },
      saunaReservations: {
        orderBy: { date: 'desc' },
        take: 5,
      },
      payments: {
        where: { status: 'RECEIVED' },
        select: { id: true, amount: true, status: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ users });
}
