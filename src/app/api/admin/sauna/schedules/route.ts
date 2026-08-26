import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const schedules = await prisma.saunaSchedule.findMany({ orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] });
  return NextResponse.json({ schedules });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const schedule = await prisma.saunaSchedule.create({
    data: {
      dayOfWeek: body.dayOfWeek,
      dayName: body.dayName,
      gender: body.gender,
      startTime: body.startTime,
      endTime: body.endTime,
    },
  });
  return NextResponse.json({ schedule });
}
