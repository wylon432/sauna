import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    let news = await prisma.news.findUnique({ where: { id } });
    if (!news) {
      news = await prisma.news.findUnique({ where: { slug: id } });
    }

    if (!news) {
      return NextResponse.json({ error: 'News not found' }, { status: 404 });
    }

    return NextResponse.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = (session.user as any).role === 'ADMIN';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = (session.user as any).id as string;
    const { id } = params;
    const body = await request.json();

    const existing = await prisma.news.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'News not found' }, { status: 404 });
    }

    const data: any = {};
    if (body.title !== undefined) {
      data.title = body.title;
      if (body.title !== existing.title) {
        let slug = body.title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        const existingSlug = await prisma.news.findFirst({ where: { slug, id: { not: id } } });
        if (existingSlug) {
          slug = `${slug}-${Date.now()}`;
        }
        data.slug = slug;
      }
    }
    if (body.summary !== undefined) data.summary = body.summary;
    if (body.content !== undefined) data.content = body.content;
    if (body.image !== undefined) data.image = body.image;
    if (body.category !== undefined) data.category = body.category;
    if (body.author !== undefined) data.author = body.author;
    if (body.featured !== undefined) data.featured = body.featured;
    if (body.scheduledAt !== undefined) data.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;

    if (body.status !== undefined) {
      data.status = body.status;
      if (body.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
        data.publishedAt = new Date();
      }
    }

    const updated = await prisma.news.update({ where: { id }, data });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE',
        resource: 'News',
        resourceId: id,
        details: `Updated news: ${updated.title}`,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating news:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = (session.user as any).role === 'ADMIN';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = (session.user as any).id as string;
    const { id } = params;

    const news = await prisma.news.findUnique({ where: { id } });
    if (!news) {
      return NextResponse.json({ error: 'News not found' }, { status: 404 });
    }

    await prisma.news.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DELETE',
        resource: 'News',
        resourceId: id,
        details: `Deleted news: ${news.title}`,
      },
    });

    return NextResponse.json({ message: 'News deleted' });
  } catch (error) {
    console.error('Error deleting news:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
