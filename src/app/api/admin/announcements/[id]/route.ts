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
  const updateData: any = {};
  if (body.text !== undefined) updateData.text = body.text;
  if (body.service !== undefined) updateData.service = body.service;
  if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate);
  if (body.endDate !== undefined) updateData.endDate = new Date(body.endDate);
  if (body.active !== undefined) updateData.active = body.active;
  const announcement = await prisma.announcement.update({ where: { id: params.id }, data: updateData });
  return NextResponse.json({ announcement });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await prisma.announcement.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
