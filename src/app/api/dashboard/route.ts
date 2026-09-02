import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    const [
      todayOrders,
      totalCustomers,
      totalProducts,
      lowStockProducts,
      recentOrders,
      monthlyOrders,
    ] = await Promise.all([
      prisma.order.findMany({
        where: {
          status: { in: ['PAGA', 'FECHADA'] },
          closedAt: { gte: today, lt: tomorrow },
        },
      }),
      prisma.customer.count({ where: { active: true } }),
      prisma.product.count({ where: { active: true } }),
      prisma.product.findMany({
        where: { active: true },
        select: { id: true, name: true, stock: true, minStock: true, unit: true },
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true } },
          user: { select: { id: true, name: true } },
          items: true,
          payments: true,
        },
      }),
      prisma.order.findMany({
        where: {
          status: { in: ['PAGA', 'FECHADA'] },
          closedAt: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
    ]);

    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const todayOrderCount = todayOrders.length;

    const lowStockAlerts = lowStockProducts.filter(p => p.stock <= p.minStock);

    const chartData: { day: string; revenue: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

      const dayOrders = monthlyOrders.filter(o => {
        if (!o.closedAt) return false;
        return o.closedAt >= dayStart && o.closedAt <= dayEnd;
      });

      chartData.push({
        day: dayStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
        orders: dayOrders.length,
      });
    }

    return NextResponse.json({
      today: {
        revenue: todayRevenue,
        orders: todayOrderCount,
      },
      totals: {
        customers: totalCustomers,
        products: totalProducts,
      },
      lowStockAlerts,
      recentOrders,
      chartData,
    });
  } catch {
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 });
  }
}
