import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  try {
    const schedules = await prisma.saunaSchedule.findMany({
      where: { active: true },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching sauna schedules:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
