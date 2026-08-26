import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  try {
    const beverages = await prisma.beverage.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(beverages);
  } catch (error) {
    console.error('Error fetching beverages:', error);
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
    const { name, category, unit, price, minStock, currentStock } = body;

    if (!name || !category || price === undefined) {
      return NextResponse.json({ error: 'name, category, and price are required' }, { status: 400 });
    }

    const beverage = await prisma.beverage.create({
      data: {
        name,
        category,
        unit: unit || 'un',
        price: Number(price),
        minStock: minStock !== undefined ? Number(minStock) : 5,
        currentStock: currentStock !== undefined ? Number(currentStock) : 0,
        active: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        resource: 'Beverage',
        resourceId: beverage.id,
        details: `Created beverage: ${name}`,
      },
    });

    return NextResponse.json(beverage, { status: 201 });
  } catch (error) {
    console.error('Error creating beverage:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
