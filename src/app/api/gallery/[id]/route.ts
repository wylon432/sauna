import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

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

    const image = await prisma.galleryImage.findUnique({ where: { id } });
    if (!image) {
      return NextResponse.json({ error: 'Gallery image not found' }, { status: 404 });
    }

    if (body.isMain && body.isMain !== image.isMain) {
      await prisma.galleryImage.updateMany({
        where: { category: image.category, isMain: true },
        data: { isMain: false },
      });
    }

    const updated = await prisma.galleryImage.update({
      where: { id },
      data: {
        ...(body.url !== undefined && { url: body.url }),
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.isMain !== undefined && { isMain: body.isMain }),
        ...(body.thumbnail !== undefined && { thumbnail: body.thumbnail }),
        ...(body.sortOrder !== undefined && { sortOrder: Number(body.sortOrder) }),
        ...(body.published !== undefined && { published: body.published }),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE',
        resource: 'GalleryImage',
        resourceId: id,
        details: `Updated gallery image`,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating gallery image:', error);
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

    const image = await prisma.galleryImage.findUnique({ where: { id } });
    if (!image) {
      return NextResponse.json({ error: 'Gallery image not found' }, { status: 404 });
    }

    await prisma.galleryImage.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DELETE',
        resource: 'GalleryImage',
        resourceId: id,
        details: `Deleted gallery image`,
      },
    });

    return NextResponse.json({ message: 'Image deleted' });
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
