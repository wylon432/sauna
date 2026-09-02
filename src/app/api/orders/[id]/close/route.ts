import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

async function logAudit(userId: string, action: string, resource: string, resourceId?: string, details?: string) {
  await prisma.auditLog.create({ data: { userId, action, resource, resourceId, details } });
}

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { payments: true, items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Comanda não encontrada' }, { status: 404 });
    }

    if (order.status === 'FECHADA') {
      return NextResponse.json({ error: 'Comanda já está fechada' }, { status: 400 });
    }

    if (order.items.length === 0) {
      return NextResponse.json({ error: 'Comanda não possui itens' }, { status: 400 });
    }

    const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0);
    if (totalPaid < order.total) {
      return NextResponse.json(
        {
          error: 'Comanda não está totalmente paga',
          remaining: order.total - totalPaid,
        },
        { status: 400 }
      );
    }

    const closedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: 'FECHADA',
        closedAt: new Date(),
      },
    });

    const openRegister = await prisma.cashRegister.findFirst({
      where: { status: 'ABERTO' },
    });

    if (openRegister) {
      await prisma.cashMovement.create({
        data: {
          cashRegisterId: openRegister.id,
          orderId: params.id,
          type: 'VENDA',
          amount: order.total,
          description: `Comanda #${order.orderNumber} - Fechamento`,
          userId: (session.user as any).id,
        },
      });
    }

    await logAudit(
      (session.user as any).id,
      'CLOSE',
      'ORDER',
      order.id,
      `Comanda #${order.orderNumber} fechada - Total: R$ ${(order.total / 100).toFixed(2)}`
    );

    return NextResponse.json(closedOrder);
  } catch {
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 });
  }
}
