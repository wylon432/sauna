import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = (session.user as any).role === 'ADMIN';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.lte = end;
    }

    const payments = await prisma.payment.findMany({
      where: {
        status: 'RECEIVED',
        ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
      },
    });

    const expenses = await prisma.expense.findMany({
      where: {
        ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
      },
    });

    const totalReceived = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const balance = totalReceived - totalExpenses;

    const byType: Record<string, number> = {};
    payments.forEach(p => {
      byType[p.type] = (byType[p.type] || 0) + p.amount;
    });

    const byMethod: Record<string, number> = {};
    payments.forEach(p => {
      byMethod[p.method] = (byMethod[p.method] || 0) + p.amount;
    });

    const byCategory: Record<string, number> = {};
    expenses.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });

    const now = new Date();
    const monthlyData = [];

    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);

      const monthPayments = payments.filter(p => {
        const d = new Date(p.createdAt);
        return d >= monthDate && d <= monthEnd;
      });
      const monthExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d >= monthDate && d <= monthEnd;
      });

      monthlyData.push({
        month: monthDate.toISOString().slice(0, 7),
        received: monthPayments.reduce((sum, p) => sum + p.amount, 0),
        expenses: monthExpenses.reduce((sum, e) => sum + e.amount, 0),
        balance: monthPayments.reduce((sum, p) => sum + p.amount, 0) - monthExpenses.reduce((sum, e) => sum + e.amount, 0),
      });
    }

    const pendingPayments = await prisma.payment.findMany({
      where: { status: 'PENDING' },
    });
    const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      totalReceived,
      totalExpenses,
      totalPending,
      balance,
      byType,
      byMethod,
      byCategory,
      monthlyData,
      paymentCount: payments.length,
      expenseCount: expenses.length,
    });
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
