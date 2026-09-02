import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const adjustmentSchema = z.object({
  productId: z.string().min(1, 'Produto é obrigatório'),
  quantity: z.number().int(),
  notes: z.string().optional().nullable(),
});

async function logAudit(userId: string, action: string, resource: string, resourceId?: string, details?: string) {
  await prisma.auditLog.create({ data: { userId, action, resource, resourceId, details } });
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId') || '';

    const where: any = {};

    if (productId) {
      where.productId = productId;
    }

    const movements = await prisma.inventoryMovement.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, unit: true } },
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return NextResponse.json(movements);
  } catch {
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if ((session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = adjustmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { productId, quantity, notes } = parsed.data;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    const newStock = product.stock + quantity;
    if (newStock < 0) {
      return NextResponse.json({ error: 'Estoque não pode ficar negativo' }, { status: 400 });
    }

    await prisma.product.update({
      where: { id: productId },
      data: { stock: newStock },
    });

    const movement = await prisma.inventoryMovement.create({
      data: {
        productId,
        type: 'AJUSTE',
        quantity,
        reference: 'Ajuste manual',
        notes: notes?.trim() || null,
        userId: (session.user as any).id,
      },
      include: {
        product: { select: { id: true, name: true, unit: true } },
        user: { select: { id: true, name: true } },
      },
    });

    await logAudit(
      (session.user as any).id,
      'CREATE',
      'INVENTORY_MOVEMENT',
      movement.id,
      `Ajuste manual: ${product.name} - Quantidade: ${quantity > 0 ? '+' : ''}${quantity}`
    );

    return NextResponse.json(movement, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 });
  }
}
