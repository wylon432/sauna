import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const createProductSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  categoryId: z.string().optional().nullable(),
  price: z.number().int().min(0, 'Preço deve ser positivo'),
  cost: z.number().int().min(0, 'Custo deve ser positivo').default(0),
  stock: z.number().int().min(0).default(0),
  minStock: z.number().int().min(0).default(0),
  unit: z.string().default('UN'),
  code: z.string().optional().nullable(),
});

async function logAudit(userId: string, action: string, resource: string, resourceId?: string, details?: string) {
  await prisma.auditLog.create({ data: { userId, action, resource, resourceId, details } });
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const active = searchParams.get('active');

    const where: any = {};

    if (active !== null && active !== undefined) {
      where.active = active === 'true';
    } else {
      where.active = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(products);
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

    if ((session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { name, categoryId, price, cost, stock, minStock, unit, code } = parsed.data;

    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) {
        return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
      }
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        categoryId: categoryId || null,
        price,
        cost,
        stock,
        minStock,
        unit: unit.trim(),
        code: code?.trim() || null,
      },
    });

    if (stock > 0) {
      await prisma.inventoryMovement.create({
        data: {
          productId: product.id,
          type: 'ESTOQUE_INICIAL',
          quantity: stock,
          reference: 'Cadastro inicial',
          userId: (session.user as any).id,
        },
      });
    }

    await logAudit((session.user as any).id, 'CREATE', 'PRODUCT', product.id, `Produto criado: ${product.name}`);

    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 });
  }
}
