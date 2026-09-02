import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateProductSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  categoryId: z.string().optional().nullable(),
  price: z.number().int().min(0, 'Preço deve ser positivo').optional(),
  cost: z.number().int().min(0, 'Custo deve ser positivo').optional(),
  stock: z.number().int().min(0).optional(),
  minStock: z.number().int().min(0).optional(),
  unit: z.string().optional(),
  code: z.string().optional().nullable(),
  active: z.boolean().optional(),
});

async function logAudit(userId: string, action: string, resource: string, resourceId?: string, details?: string) {
  await prisma.auditLog.create({ data: { userId, action, resource, resourceId, details } });
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { category: true },
    });
    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
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

    const body = await req.json();
    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    if (parsed.data.categoryId) {
      const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
      if (!category) {
        return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
      }
    }

    const data: any = {};
    if (parsed.data.name !== undefined) data.name = parsed.data.name.trim();
    if (parsed.data.categoryId !== undefined) data.categoryId = parsed.data.categoryId || null;
    if (parsed.data.price !== undefined) data.price = parsed.data.price;
    if (parsed.data.cost !== undefined) data.cost = parsed.data.cost;
    if (parsed.data.stock !== undefined) data.stock = parsed.data.stock;
    if (parsed.data.minStock !== undefined) data.minStock = parsed.data.minStock;
    if (parsed.data.unit !== undefined) data.unit = parsed.data.unit.trim();
    if (parsed.data.code !== undefined) data.code = parsed.data.code?.trim() || null;
    if (parsed.data.active !== undefined) data.active = parsed.data.active;

    const product = await prisma.product.update({ where: { id: params.id }, data });

    await logAudit((session.user as any).id, 'UPDATE', 'PRODUCT', product.id, `Produto atualizado: ${product.name}`);

    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 });
  }
}

export async function DELETE(
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

    const existing = await prisma.product.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: { active: false },
    });

    await logAudit((session.user as any).id, 'DELETE', 'PRODUCT', product.id, `Produto desativado: ${product.name}`);

    return NextResponse.json({ message: 'Produto removido com sucesso' });
  } catch {
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 });
  }
}
