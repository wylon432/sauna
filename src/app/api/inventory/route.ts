import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id as string;
    const body = await request.json();
    const { beverageId, type, quantity, reason } = body;

    if (!beverageId || !type || quantity === undefined) {
      return NextResponse.json({ error: 'beverageId, type, and quantity are required' }, { status: 400 });
    }

    if (!['ADD', 'REMOVE', 'ADJUST'].includes(type)) {
      return NextResponse.json({ error: 'type must be ADD, REMOVE, or ADJUST' }, { status: 400 });
    }

    const beverage = await prisma.beverage.findUnique({ where: { id: beverageId } });
    if (!beverage) {
      return NextResponse.json({ error: 'Beverage not found' }, { status: 404 });
    }

    const qty = Number(quantity);
    let newStock = beverage.currentStock;

    if (type === 'ADD') {
      newStock = beverage.currentStock + qty;
    } else if (type === 'REMOVE') {
      if (qty > beverage.currentStock) {
        return NextResponse.json({ error: `Insufficient stock. Current: ${beverage.currentStock}, requested: ${qty}` }, { status: 400 });
      }
      newStock = beverage.currentStock - qty;
    } else if (type === 'ADJUST') {
      if (qty < 0) {
        return NextResponse.json({ error: 'Adjustment quantity cannot result in negative stock' }, { status: 400 });
      }
      newStock = qty;
    }

    const [movement] = await prisma.$transaction([
      prisma.inventoryMovement.create({
        data: {
          beverageId,
          type,
          quantity: qty,
          reason: reason || null,
          performedBy: userId,
        },
      }),
      prisma.beverage.update({
        where: { id: beverageId },
        data: { currentStock: newStock },
      }),
    ]);

    return NextResponse.json(movement, { status: 201 });
  } catch (error) {
    console.error('Error registering inventory movement:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
