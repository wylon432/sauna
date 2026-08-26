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

    const beverage = await prisma.beverage.findUnique({ where: { id } });
    if (!beverage) {
      return NextResponse.json({ error: 'Beverage not found' }, { status: 404 });
    }

    const updated = await prisma.beverage.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.unit !== undefined && { unit: body.unit }),
        ...(body.price !== undefined && { price: Number(body.price) }),
        ...(body.minStock !== undefined && { minStock: Number(body.minStock) }),
        ...(body.currentStock !== undefined && { currentStock: Number(body.currentStock) }),
        ...(body.active !== undefined && { active: body.active }),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE',
        resource: 'Beverage',
        resourceId: id,
        details: `Updated beverage: ${updated.name}`,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating beverage:', error);
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

    const beverage = await prisma.beverage.findUnique({ where: { id } });
    if (!beverage) {
      return NextResponse.json({ error: 'Beverage not found' }, { status: 404 });
    }

    await prisma.beverage.update({
      where: { id },
      data: { active: false },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DELETE',
        resource: 'Beverage',
        resourceId: id,
        details: `Soft-deleted beverage: ${beverage.name}`,
      },
    });

    return NextResponse.json({ message: 'Beverage deactivated' });
  } catch (error) {
    console.error('Error deleting beverage:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
