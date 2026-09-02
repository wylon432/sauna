import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const openRegisterSchema = z.object({
  initialValue: z.number().int().min(0, 'Valor inicial deve ser positivo'),
});

async function logAudit(userId: string, action: string, resource: string, resourceId?: string, details?: string) {
  await prisma.auditLog.create({ data: { userId, action, resource, resourceId, details } });
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const openRegister = await prisma.cashRegister.findFirst({
      where: { status: 'ABERTO' },
      include: {
        user: { select: { id: true, name: true } },
        movements: { orderBy: { createdAt: 'desc' } },
      },
    });

    const recentClosed = await prisma.cashRegister.findMany({
      where: { status: 'FECHADO' },
      include: {
        user: { select: { id: true, name: true } },
        closedBy: { select: { id: true, name: true } },
      },
      orderBy: { closedAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      open: openRegister,
      recentClosed,
    });
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

    const existingOpen = await prisma.cashRegister.findFirst({
      where: { status: 'ABERTO' },
    });

    if (existingOpen) {
      return NextResponse.json(
        { error: 'Já existe um caixa aberto. Feche o caixa atual antes de abrir um novo.' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = openRegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { initialValue } = parsed.data;

    const register = await prisma.cashRegister.create({
      data: {
        status: 'ABERTO',
        initialValue,
        userId: (session.user as any).id,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    await logAudit(
      (session.user as any).id,
      'CREATE',
      'CASH_REGISTER',
      register.id,
      `Caixa aberto - Valor inicial: R$ ${(initialValue / 100).toFixed(2)}`
    );

    return NextResponse.json(register, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 });
  }
}
