import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const payments = await prisma.payment.findMany({
    include: {
      user: { select: { name: true, email: true } },
      rentalReservation: { select: { id: true, date: true } },
      saunaReservation: { select: { id: true, date: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ payments });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const payment = await prisma.payment.create({
    data: {
      userId: body.userId || (session.user as any).id,
      type: body.type,
      method: body.method,
      amount: body.amount,
      description: body.description || null,
      status: 'RECEIVED',
      registeredBy: (session.user as any).id,
    },
  });
  return NextResponse.json({ payment });
}
