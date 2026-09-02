import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional().nullable(),
  role: z.enum(['ADMIN', 'FUNCIONARIO']).optional(),
  active: z.boolean().optional(),
});

async function logAudit(userId: string, action: string, resource: string, resourceId?: string, details?: string) {
  await prisma.auditLog.create({ data: { userId, action, resource, resourceId, details } });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    if ((session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });

    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

    const existing = await prisma.user.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

    const updateData: any = {};
    if (parsed.data.name !== undefined) updateData.name = parsed.data.name.trim();
    if (parsed.data.email !== undefined) {
      const emailLower = parsed.data.email.toLowerCase().trim();
      if (emailLower !== existing.email) {
        const emailTaken = await prisma.user.findUnique({ where: { email: emailLower } });
        if (emailTaken) return NextResponse.json({ error: 'Email já está em uso' }, { status: 409 });
      }
      updateData.email = emailLower;
    }
    if (parsed.data.password) updateData.password = await bcrypt.hash(parsed.data.password, 12);
    if (parsed.data.role !== undefined) updateData.role = parsed.data.role;
    if (parsed.data.active !== undefined) updateData.active = parsed.data.active;

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true, updatedAt: true },
    });

    await logAudit(
      (session.user as any).id,
      'UPDATE',
      'USER',
      user.id,
      `Usuário atualizado: ${user.email}`
    );

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 });
  }
}
