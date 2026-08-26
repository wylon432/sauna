import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [receivedAgg, pendingAgg, expensesAgg, payments, expenses, categoryAgg] = await Promise.all([
    prisma.payment.aggregate({ where: { status: 'RECEIVED' }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { status: 'PENDING' }, _sum: { amount: true } }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.payment.findMany({
      where: { status: 'RECEIVED' },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 15,
    }),
    prisma.expense.findMany({ orderBy: { date: 'desc' }, take: 15 }),
    prisma.payment.groupBy({
      by: ['type'],
      where: { status: 'RECEIVED' },
      _sum: { amount: true },
    }),
  ]);

  const totalReceived = receivedAgg._sum.amount ?? 0;
  const totalPending = pendingAgg._sum.amount ?? 0;
  const totalExpenses = expensesAgg._sum.amount ?? 0;

  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const monthlyRevenue = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = months[d.getMonth()];
    monthlyRevenue.push({ month: monthName, receita: 0, despesas: 0 });
  }

  const paymentMonthly = await prisma.payment.findMany({
    where: { status: 'RECEIVED', createdAt: { gte: sixMonthsAgo } },
    select: { amount: true, createdAt: true },
  });
  const expenseMonthly = await prisma.expense.findMany({
    where: { date: { gte: sixMonthsAgo } },
    select: { amount: true, date: true },
  });

  for (const p of paymentMonthly) {
    const d = new Date(p.createdAt);
    const idx = (now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth();
    if (idx >= 0 && idx < 6) {
      monthlyRevenue[5 - idx].receita += p.amount;
    }
  }
  for (const e of expenseMonthly) {
    const d = new Date(e.date);
    const idx = (now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth();
    if (idx >= 0 && idx < 6) {
      monthlyRevenue[5 - idx].despesas += e.amount;
    }
  }

  const typeLabels: Record<string, string> = { RENTAL: 'Aluguel', SAUNA: 'Sauna', BEVERAGE: 'Bebidas' };
  const revenueByCategory = categoryAgg.map((c) => ({
    category: typeLabels[c.type] || c.type,
    total: c._sum.amount ?? 0,
  }));

  return NextResponse.json({
    totalReceived,
    totalPending,
    totalExpenses,
    operatingBalance: totalReceived - totalExpenses,
    revenueByCategory,
    monthlyRevenue,
    recentPayments: payments,
    recentExpenses: expenses,
  });
}
