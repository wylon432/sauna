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
    const { status } = body;

    if (!status || !['PENDING', 'PUBLISHED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { status },
      include: { user: { select: { id: true, name: true } } },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE_STATUS',
        resource: 'Review',
        resourceId: id,
        details: `Review status changed from ${review.status} to ${status}`,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id as string;
    const isAdmin = (session.user as any).role === 'ADMIN';
    const { id } = params;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (!isAdmin && review.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.review.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DELETE',
        resource: 'Review',
        resourceId: id,
        details: 'Review deleted',
      },
    });

    return NextResponse.json({ message: 'Review deleted' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
