import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const images = await prisma.galleryImage.findMany({ orderBy: { sortOrder: 'asc' } });
  return NextResponse.json({ images });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const image = await prisma.galleryImage.create({
    data: {
      url: body.url,
      title: body.title || null,
      description: body.description || null,
      category: body.category || 'GERAL',
      isMain: body.isMain || false,
      published: body.published !== false,
      sortOrder: body.sortOrder || 0,
      uploadedBy: (session.user as any).id,
    },
  });
  return NextResponse.json({ image });
}
