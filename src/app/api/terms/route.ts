import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const where: any = { active: true };
    if (type) {
      where.type = type;
    }

    const terms = await prisma.termsVersion.findMany({
      where,
      orderBy: { version: 'desc' },
    });

    return NextResponse.json(terms);
  } catch (error) {
    console.error('Error fetching terms:', error);
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
    const { type, title, content } = body;

    if (!type || !title || !content) {
      return NextResponse.json({ error: 'type, title, and content are required' }, { status: 400 });
    }

    const latest = await prisma.termsVersion.findFirst({
      where: { type },
      orderBy: { version: 'desc' },
    });

    const newVersion = latest ? latest.version + 1 : 1;

    if (latest) {
      await prisma.termsVersion.update({
        where: { id: latest.id },
        data: { active: false },
      });
    }

    const terms = await prisma.termsVersion.create({
      data: {
        type,
        title,
        content,
        version: newVersion,
        active: true,
        author: userId,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        resource: 'TermsVersion',
        resourceId: terms.id,
        details: `Created terms v${newVersion} for type: ${type}`,
      },
    });

    return NextResponse.json(terms, { status: 201 });
  } catch (error) {
    console.error('Error creating terms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
