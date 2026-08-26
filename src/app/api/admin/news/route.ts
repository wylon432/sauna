import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const news = await prisma.news.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ news });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const item = await prisma.news.create({
    data: {
      title: body.title,
      slug: body.slug,
      summary: body.summary || null,
      content: body.content,
      image: body.image || null,
      category: body.category || 'GERAL',
      author: body.author || null,
      status: body.status || 'DRAFT',
      featured: body.featured || false,
      publishedAt: body.status === 'PUBLISHED' ? new Date() : null,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
    },
  });
  return NextResponse.json({ item });
}
