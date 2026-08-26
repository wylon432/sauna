import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const reservations = await prisma.saunaReservation.findMany({
    include: { user: true, schedule: true },
    orderBy: { date: 'desc' },
    take: 100,
  });
  return NextResponse.json({ reservations });
}
