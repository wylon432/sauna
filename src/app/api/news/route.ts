import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export async function GET(request: NextRequest) {
  try {
    // Auto-delete news older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    await prisma.news.deleteMany({
      where: { createdAt: { lt: thirtyDaysAgo } },
    });

    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('all') === 'true';

    const session = await getServerSession(authOptions);
    const isAdmin = session && (session.user as any).role === 'ADMIN';

    const where: any = {};
    if (!showAll || !isAdmin) {
      where.status = 'PUBLISHED';
    }

    const news = await prisma.news.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const { title, summary, content, image, category, author, status, featured, scheduledAt } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'title and content are required' }, { status: 400 });
    }

    let slug = generateSlug(title);
    const existingSlug = await prisma.news.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const news = await prisma.news.create({
      data: {
        title,
        slug,
        summary: summary || null,
        content,
        image: image || null,
        category: category || 'GERAL',
        author: author || null,
        status: status || 'DRAFT',
        featured: featured || false,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        resource: 'News',
        resourceId: news.id,
        details: `Created news: ${title}`,
      },
    });

    return NextResponse.json(news, { status: 201 });
  } catch (error) {
    console.error('Error creating news:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
