import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where: any = { published: true };
    if (category) {
      where.category = category;
    }

    const images = await prisma.galleryImage.findMany({
      where,
      orderBy: [{ isMain: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching gallery images:', error);
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
    const { url, title, description, category, isMain, thumbnail, sortOrder } = body;

    if (!url || !category) {
      return NextResponse.json({ error: 'url and category are required' }, { status: 400 });
    }

    if (isMain) {
      await prisma.galleryImage.updateMany({
        where: { category, isMain: true },
        data: { isMain: false },
      });
    }

    const image = await prisma.galleryImage.create({
      data: {
        url,
        title: title || null,
        description: description || null,
        category,
        isMain: isMain || false,
        thumbnail: thumbnail || null,
        sortOrder: sortOrder || 0,
        uploadedBy: userId,
        published: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        resource: 'GalleryImage',
        resourceId: image.id,
        details: `Added gallery image in category: ${category}`,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error('Error creating gallery image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
