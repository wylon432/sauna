import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const expense = await prisma.expense.create({
    data: {
      description: body.description,
      category: body.category,
      amount: body.amount,
      registeredBy: (session.user as any).id,
    },
  });
  return NextResponse.json({ expense });
}
