import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const createExpenseSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  amount: z.number().int().min(1, 'Valor deve ser maior que zero'),
  date: z.string().optional(),
  paymentMethod: z.string().default('DINHEIRO'),
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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: { user: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(expenses);
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

    const body = await req.json();
    const parsed = createExpenseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { description, category, amount, date, paymentMethod, notes } = parsed.data;

    const expense = await prisma.expense.create({
      data: {
        description: description.trim(),
        category: category.trim(),
        amount,
        date: date ? new Date(date) : new Date(),
        paymentMethod,
        notes: notes?.trim() || null,
        userId: (session.user as any).id,
      },
      include: { user: { select: { id: true, name: true } } },
    });

    await logAudit(
      (session.user as any).id,
      'CREATE',
      'EXPENSE',
      expense.id,
      `Despesa criada: ${expense.description} - R$ ${(amount / 100).toFixed(2)}`
    );

    return NextResponse.json(expense, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 });
  }
}
