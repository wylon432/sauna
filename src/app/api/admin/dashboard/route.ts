import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const next7 = new Date(today);
  next7.setDate(next7.getDate() + 7);

  const [
    todayReservations,
    todayPaymentsAgg,
    todayConsumptionAgg,
    pendingRental,
    pendingSauna,
    upcomingReservations,
    pendingPayments,
    expiringPreReservations,
    lowStock,
    pendingReviews,
  ] = await Promise.all([
    prisma.rentalReservation.count({
      where: { date: { gte: today, lt: tomorrow }, status: { not: 'CANCELLED' } },
    }),
    prisma.payment.aggregate({
      where: { createdAt: { gte: today, lt: tomorrow }, status: 'RECEIVED' },
      _sum: { amount: true },
    }),
    prisma.consumptionRecord.aggregate({
      where: { createdAt: { gte: today, lt: tomorrow } },
      _sum: { totalValue: true },
    }),
    prisma.rentalReservation.count({ where: { status: { in: ['REQUESTED', 'PRE_RESERVED', 'AWAITING_SIGNAL'] } } }),
    prisma.saunaReservation.count({ where: { status: 'CONFIRMED', date: { gte: today, lt: tomorrow } } }),
    prisma.rentalReservation.findMany({
      where: { date: { gte: today, lte: next7 }, status: { not: 'CANCELLED' } },
      include: { user: true, package: true },
      orderBy: { date: 'asc' },
      take: 10,
    }),
    prisma.payment.findMany({
      where: { status: 'PENDING' },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.rentalReservation.count({
      where: { status: 'PRE_RESERVED', date: { lte: new Date(Date.now() + 2 * 86400000) } },
    }),
    prisma.beverage.findMany({ where: { active: true } }),
    prisma.review.count({ where: { status: 'PENDING' } }),
  ]);

  const todayPayments = todayPaymentsAgg._sum.amount ?? 0;
  const todayConsumption = todayConsumptionAgg._sum.totalValue ?? 0;
  const pendingItems = pendingRental + pendingSauna;

  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const monthlyData: { month: string; reservas: number; receita: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    monthlyData.push({
      month: months[d.getMonth()],
      reservas: 0,
      receita: 0,
    });
  }

  const sixMonthsAgo = new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1);

  const [monthlyPayments, monthlyRentals] = await Promise.all([
    prisma.payment.findMany({
      where: { createdAt: { gte: sixMonthsAgo }, status: 'RECEIVED' },
      select: { amount: true, createdAt: true },
    }),
    prisma.rentalReservation.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { date: true },
    }),
  ]);

  for (const p of monthlyPayments) {
    const key = months[p.createdAt.getMonth()];
    const entry = monthlyData.find((md) => md.month === key);
    if (entry) entry.receita += p.amount;
  }

  for (const r of monthlyRentals) {
    const key = months[r.date.getMonth()];
    const entry = monthlyData.find((md) => md.month === key);
    if (entry) entry.reservas += 1;
  }

  return NextResponse.json({
    todayReservations,
    todayPayments,
    todayConsumption,
    pendingItems,
    upcomingReservations,
    pendingPayments,
    alerts: {
      expiringPreReservations,
      lowStock: lowStock.filter((b) => b.currentStock <= b.minStock),
      pendingReviews,
    },
    monthlyData,
  });
}
