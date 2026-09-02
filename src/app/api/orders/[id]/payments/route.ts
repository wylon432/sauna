import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const addPaymentSchema = z.object({
  method: z.string().min(1, 'Forma de pagamento é obrigatória'),
  amount: z.number().int().min(1, 'Valor deve ser maior que zero'),
  notes: z.string().optional().nullable(),
});

async function logAudit(userId: string, action: string, resource: string, resourceId?: string, details?: string) {
  await prisma.auditLog.create({ data: { userId, action, resource, resourceId, details } });
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
    const parsed = addPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { method, amount, notes } = parsed.data;

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { payments: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Comanda não encontrada' }, { status: 404 });
    }

    if (order.status === 'FECHADA') {
      return NextResponse.json({ error: 'Comanda já está fechada' }, { status: 400 });
    }

    const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = order.total - totalPaid;

    if (amount > remaining) {
      return NextResponse.json(
        { error: `Valor excede o saldo restante. Saldo: R$ ${(remaining / 100).toFixed(2)}` },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.create({
      data: {
        orderId: params.id,
        userId: (session.user as any).id,
        method,
        amount,
        notes: notes?.trim() || null,
      },
    });

    const newTotalPaid = totalPaid + amount;
    if (newTotalPaid >= order.total && order.status === 'ABERTA') {
      await prisma.order.update({
        where: { id: params.id },
        data: { status: 'PAGA' },
      });
    }

    await logAudit(
      (session.user as any).id,
      'CREATE',
      'PAYMENT',
      payment.id,
      `Pagamento adicionado à comanda #${order.orderNumber}: R$ ${(amount / 100).toFixed(2)} (${method})`
    );

    return NextResponse.json(payment, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 });
  }
}
