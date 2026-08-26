import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();

  const old = await prisma.rentalReservation.findUnique({ where: { id: params.id } });

  const reservation = await prisma.rentalReservation.update({
    where: { id: params.id },
    data: { status: body.status, adminNotes: body.reason || undefined },
  });

  await prisma.reservationStatusHistory.create({
    data: {
      reservationId: params.id,
      oldStatus: old?.status || null,
      newStatus: body.status,
      changedBy: (session.user as any).id,
      reason: body.reason,
    },
  });

  return NextResponse.json({ reservation });
}
