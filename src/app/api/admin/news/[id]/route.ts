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
  const updateData: any = { ...body };
  if (body.scheduledAt) updateData.scheduledAt = new Date(body.scheduledAt);
  if (body.publishedAt) updateData.publishedAt = new Date(body.publishedAt);
  const item = await prisma.news.update({ where: { id: params.id }, data: updateData });
  return NextResponse.json({ item });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await prisma.news.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
