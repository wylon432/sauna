import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

async function logAudit(userId: string, action: string, resource: string, resourceId?: string, details?: string) {
  await prisma.auditLog.create({ data: { userId, action, resource, resourceId, details } });
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const settings = await prisma.systemSetting.findMany();
    const settingsObj: Record<string, string> = {};
    settings.forEach((s) => { settingsObj[s.key] = s.value; });

    return NextResponse.json(settingsObj);
  } catch {
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    if ((session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });

    const body = await req.json();

    if (body.currentPassword && body.newPassword) {
      const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
      if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

      const valid = await bcrypt.compare(body.currentPassword, user.password);
      if (!valid) return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 });

      const hashed = await bcrypt.hash(body.newPassword, 12);
      await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

      await logAudit(
        (session.user as any).id,
        'UPDATE',
        'USER',
        user.id,
        'Senha alterada'
      );

      return NextResponse.json({ success: true });
    }

    const entries: { key: string; value: string }[] = [];
    if (body.businessName !== undefined) entries.push({ key: 'businessName', value: body.businessName });
    if (body.businessPhone !== undefined) entries.push({ key: 'businessPhone', value: body.businessPhone });
    if (body.businessAddress !== undefined) entries.push({ key: 'businessAddress', value: body.businessAddress });

    for (const entry of entries) {
      await prisma.systemSetting.upsert({
        where: { key: entry.key },
        update: { value: entry.value },
        create: { key: entry.key, value: entry.value },
      });
    }

    await logAudit(
      (session.user as any).id,
      'UPDATE',
      'SETTING',
      undefined,
      'Configurações do sistema atualizadas'
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 });
  }
}
