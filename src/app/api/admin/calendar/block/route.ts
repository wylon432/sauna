import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const date = new Date(body.date);

  const service = body.service || 'GERAL';

  const existing = await prisma.calendarBlock.findFirst({
    where: { date, service },
  });

  if (existing) {
    const updated = await prisma.calendarBlock.update({
      where: { id: existing.id },
      data: { blocked: !existing.blocked, reason: body.reason || existing.reason },
    });
    return NextResponse.json({ block: updated });
  }

  const block = await prisma.calendarBlock.create({
    data: {
      date,
      service,
      blocked: true,
      reason: body.reason || null,
      createdBy: (session.user as any).id,
    },
  });
  return NextResponse.json({ block });
}
