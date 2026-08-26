import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ announcements });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const announcement = await prisma.announcement.create({
    data: {
      text: body.text,
      service: body.service || 'GERAL',
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      createdBy: (session.user as any).id,
    },
  });
  return NextResponse.json({ announcement });
}
