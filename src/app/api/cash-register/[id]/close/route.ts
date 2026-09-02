import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const closeRegisterSchema = z.object({
  finalValue: z.number().int().min(0, 'Valor final deve ser positivo'),
});

async function logAudit(userId: string, action: string, resource: string, resourceId?: string, details?: string) {
  await prisma.auditLog.create({ data: { userId, action, resource, resourceId, details } });
}

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if ((session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const register = await prisma.cashRegister.findUnique({
      where: { id: params.id },
      include: { movements: true },
    });

    if (!register) {
      return NextResponse.json({ error: 'Caixa não encontrado' }, { status: 404 });
    }

    if (register.status !== 'ABERTO') {
      return NextResponse.json({ error: 'Caixa já está fechado' }, { status: 400 });
    }

    const body = await _req.json();
    const parsed = closeRegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { finalValue } = parsed.data;

    const movementsTotal = register.movements.reduce((sum, m) => {
      if (m.type === 'VENDA' || m.type === 'SUPRIMENTO' || m.type === 'ENTRADA') {
        return sum + m.amount;
      }
      if (m.type === 'DESPESA' || m.type === 'RETIRADA' || m.type === 'SANGRIA') {
        return sum - m.amount;
      }
      return sum;
    }, 0);

    const expectedValue = register.initialValue + movementsTotal;
    const difference = finalValue - expectedValue;

    const closedRegister = await prisma.cashRegister.update({
      where: { id: params.id },
      data: {
        status: 'FECHADO',
        finalValue,
        expectedValue,
        difference,
        closedAt: new Date(),
        closedById: (session.user as any).id,
      },
      include: {
        user: { select: { id: true, name: true } },
        closedBy: { select: { id: true, name: true } },
      },
    });

    await logAudit(
      (session.user as any).id,
      'CLOSE',
      'CASH_REGISTER',
      register.id,
      `Caixa fechado - Valor final: R$ ${(finalValue / 100).toFixed(2)}, Esperado: R$ ${(expectedValue / 100).toFixed(2)}, Diferença: R$ ${(difference / 100).toFixed(2)}`
    );

    return NextResponse.json(closedRegister);
  } catch {
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 });
  }
}
