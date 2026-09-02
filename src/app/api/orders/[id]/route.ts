import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateOrderSchema = z.object({
  notes: z.string().optional().nullable(),
  customerId: z.string().optional().nullable(),
});

async function logAudit(userId: string, action: string, resource: string, resourceId?: string, details?: string) {
  await prisma.auditLog.create({ data: { userId, action, resource, resourceId, details } });
}

export async function GET(
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
      include: {
        customer: true,
        user: { select: { id: true, name: true } },
        items: { include: { product: true } },
        payments: true,
        manualCharges: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Comanda não encontrada' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const existing = await prisma.order.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Comanda não encontrada' }, { status: 404 });
    }

    if (existing.status === 'FECHADA') {
      return NextResponse.json({ error: 'Comanda já está fechada' }, { status: 400 });
    }

    if (parsed.data.customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: parsed.data.customerId } });
      if (!customer) {
        return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
      }
    }

    const data: any = {};
    if (parsed.data.notes !== undefined) data.notes = parsed.data.notes?.trim() || null;
    if (parsed.data.customerId !== undefined) data.customerId = parsed.data.customerId || null;

    const order = await prisma.order.update({
      where: { id: params.id },
      data,
      include: {
        customer: true,
        user: { select: { id: true, name: true } },
        items: { include: { product: true } },
        payments: true,
        manualCharges: true,
      },
    });

    await logAudit((session.user as any).id, 'UPDATE', 'ORDER', order.id, `Comanda #${order.orderNumber} atualizada`);

    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 });
  }
}
