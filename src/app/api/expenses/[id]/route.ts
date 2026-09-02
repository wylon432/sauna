import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateExpenseSchema = z.object({
  description: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  amount: z.number().int().min(1).optional(),
  date: z.string().optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional().nullable(),
});

async function logAudit(userId: string, action: string, resource: string, resourceId?: string, details?: string) {
  await prisma.auditLog.create({ data: { userId, action, resource, resourceId, details } });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const existing = await prisma.expense.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Despesa não encontrada' }, { status: 404 });

    const body = await req.json();
    const parsed = updateExpenseSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

    const updateData: any = {};
    if (parsed.data.description !== undefined) updateData.description = parsed.data.description.trim();
    if (parsed.data.category !== undefined) updateData.category = parsed.data.category.trim();
    if (parsed.data.amount !== undefined) updateData.amount = parsed.data.amount;
    if (parsed.data.date !== undefined) updateData.date = new Date(parsed.data.date);
    if (parsed.data.paymentMethod !== undefined) updateData.paymentMethod = parsed.data.paymentMethod;
    if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes?.trim() || null;

    const expense = await prisma.expense.update({
      where: { id: params.id },
      data: updateData,
      include: { user: { select: { id: true, name: true } } },
    });

    await logAudit(
      (session.user as any).id,
      'UPDATE',
      'EXPENSE',
      expense.id,
      `Despesa atualizada: ${expense.description}`
    );

    return NextResponse.json(expense);
  } catch {
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const existing = await prisma.expense.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Despesa não encontrada' }, { status: 404 });

    await prisma.expense.delete({ where: { id: params.id } });

    await logAudit(
      (session.user as any).id,
      'DELETE',
      'EXPENSE',
      params.id,
      `Despesa excluída: ${existing.description}`
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 });
  }
}
