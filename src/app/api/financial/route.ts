import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

function getDateRange(period: string, customStart?: string, customEnd?: string): { start: Date; end: Date } {
  const now = new Date();
  let start: Date;
  const end = new Date(now);

  switch (period) {
    case 'today':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      break;
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    case 'custom':
      start = customStart ? new Date(customStart) : new Date(now.getFullYear(), now.getMonth(), 1);
      if (customEnd) {
        const customEndDate = new Date(customEnd);
        customEndDate.setHours(23, 59, 59, 999);
        end.setTime(customEndDate.getTime());
      }
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return { start, end };
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'month';
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const { start, end } = getDateRange(period, startDate, endDate);

    const [orders, expenses] = await Promise.all([
      prisma.order.findMany({
        where: {
          status: { in: ['PAGA', 'FECHADA'] },
          closedAt: { gte: start, lte: end },
        },
        include: { items: true },
      }),
      prisma.expense.findMany({
        where: {
          date: { gte: start, lte: end },
        },
      }),
    ]);

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    const totalCosts = orders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => itemSum + item.costPrice * item.quantity, 0);
    }, 0);

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    const grossProfit = totalRevenue - totalCosts;
    const netProfit = grossProfit - totalExpenses;

    return NextResponse.json({
      period,
      start: start.toISOString(),
      end: end.toISOString(),
      totalRevenue,
      totalCosts,
      totalExpenses,
      grossProfit,
      netProfit,
      orderCount: orders.length,
      expenseCount: expenses.length,
    });
  } catch {
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 });
  }
}
