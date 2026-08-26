import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const start = new Date(searchParams.get('start') || '');
  const end = new Date(searchParams.get('end') || '');

  const [rentalReservations, saunaReservations, blocks] = await Promise.all([
    prisma.rentalReservation.findMany({
      where: { date: { gte: start, lte: end }, status: { not: 'CANCELLED' } },
      include: { user: { select: { name: true } }, package: { select: { name: true } } },
    }),
    prisma.saunaReservation.findMany({
      where: { date: { gte: start, lte: end }, status: { not: 'CANCELLED' } },
      include: { user: { select: { name: true } } },
    }),
    prisma.calendarBlock.findMany({
      where: { date: { gte: start, lte: end } },
    }),
  ]);

  const data: Record<string, any> = {};
  const dateStr = (d: Date) => d.toISOString().split('T')[0];

  for (const r of rentalReservations) {
    const key = dateStr(new Date(r.date));
    if (!data[key]) data[key] = { date: key, reservations: [], block: null };
    data[key].reservations.push({ id: r.id, status: r.status, user: r.user, package: r.package });
  }
  for (const r of saunaReservations) {
    const key = dateStr(new Date(r.date));
    if (!data[key]) data[key] = { date: key, reservations: [], block: null };
    data[key].reservations.push({ id: r.id, status: r.status, user: r.user, package: { name: 'Sauna' } });
  }
  for (const b of blocks) {
    const key = dateStr(new Date(b.date));
    if (!data[key]) data[key] = { date: key, reservations: [], block: null };
    data[key].block = { id: b.id, blocked: b.blocked, reason: b.reason };
  }

  return NextResponse.json(data);
}
