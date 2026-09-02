import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const addItemSchema = z.object({
  productId: z.string().min(1, 'Produto é obrigatório'),
  quantity: z.number().int().min(1, 'Quantidade deve ser pelo menos 1'),
});

const removeItemSchema = z.object({
  itemId: z.string().min(1, 'Item é obrigatório'),
});

async function logAudit(userId: string, action: string, resource: string, resourceId?: string, details?: string) {
  await prisma.auditLog.create({ data: { userId, action, resource, resourceId, details } });
}

async function recalculateOrder(orderId: string) {
  const items = await prisma.orderItem.findMany({ where: { orderId } });
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  const total = subtotal - (order?.discount || 0) + (order?.addition || 0);
  await prisma.order.update({ where: { id: orderId }, data: { subtotal, total } });
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = addItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { productId, quantity } = parsed.data;

    const order = await prisma.order.findUnique({ where: { id: params.id } });
    if (!order) {
      return NextResponse.json({ error: 'Comanda não encontrada' }, { status: 404 });
    }

    if (order.status === 'FECHADA') {
      return NextResponse.json({ error: 'Comanda já está fechada' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    if (!product.active) {
      return NextResponse.json({ error: 'Produto está inativo' }, { status: 400 });
    }

    if (product.stock < quantity) {
      return NextResponse.json({ error: 'Estoque insuficiente' }, { status: 400 });
    }

    const total = product.price * quantity;

    const item = await prisma.orderItem.create({
      data: {
        orderId: params.id,
        productId,
        quantity,
        unitPrice: product.price,
        costPrice: product.cost,
        total,
      },
      include: { product: true },
    });

    await prisma.product.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } },
    });

    await prisma.inventoryMovement.create({
      data: {
        productId,
        type: 'VENDA',
        quantity: -quantity,
        reference: `Comanda #${order.orderNumber}`,
        userId: (session.user as any).id,
      },
    });

    await recalculateOrder(params.id);

    await logAudit(
      (session.user as any).id,
      'CREATE',
      'ORDER_ITEM',
      item.id,
      `Item adicionado à comanda #${order.orderNumber}: ${product.name} x${quantity}`
    );

    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = removeItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { itemId } = parsed.data;

    const order = await prisma.order.findUnique({ where: { id: params.id } });
    if (!order) {
      return NextResponse.json({ error: 'Comanda não encontrada' }, { status: 404 });
    }

    if (order.status === 'FECHADA') {
      return NextResponse.json({ error: 'Comanda já está fechada' }, { status: 400 });
    }

    const item = await prisma.orderItem.findUnique({
      where: { id: itemId },
      include: { product: true },
    });

    if (!item || item.orderId !== params.id) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
    }

    await prisma.orderItem.delete({ where: { id: itemId } });

    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    });

    await prisma.inventoryMovement.create({
      data: {
        productId: item.productId,
        type: 'ESTORNO',
        quantity: item.quantity,
        reference: `Comanda #${order.orderNumber} - Estorno`,
        userId: (session.user as any).id,
      },
    });

    await recalculateOrder(params.id);

    await logAudit(
      (session.user as any).id,
      'DELETE',
      'ORDER_ITEM',
      itemId,
      `Item removido da comanda #${order.orderNumber}: ${item.product.name} x${item.quantity}`
    );

    return NextResponse.json({ message: 'Item removido com sucesso' });
  } catch {
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 });
  }
}
