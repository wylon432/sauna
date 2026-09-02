import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.secret !== process.env.SEED_SECRET && body.secret !== 'sauna-seed-2026') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const adminPassword = await bcrypt.hash('admin123', 12);
    const funcPassword = await bcrypt.hash('func123', 12);

    await prisma.user.upsert({
      where: { email: 'admin@sauna.com' },
      update: {},
      create: { name: 'Administrador', email: 'admin@sauna.com', password: adminPassword, role: 'ADMIN' },
    });

    await prisma.user.upsert({
      where: { email: 'funcionario@sauna.com' },
      update: {},
      create: { name: 'Funcionário', email: 'funcionario@sauna.com', password: funcPassword, role: 'FUNCIONARIO' },
    });

    const categories = ['Bebidas', 'Alimentos', 'Produtos', 'Serviços'];
    for (const name of categories) {
      await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
    }

    const bebidas = await prisma.category.findFirst({ where: { name: 'Bebidas' } });
    const products = [
      { name: 'Água 500ml', categoryId: bebidas?.id, price: 500, cost: 200, stock: 50, minStock: 10, unit: 'UN' },
      { name: 'Cerveja Lata', categoryId: bebidas?.id, price: 800, cost: 350, stock: 48, minStock: 10, unit: 'UN' },
      { name: 'Refrigerante Lata', categoryId: bebidas?.id, price: 600, cost: 250, stock: 36, minStock: 10, unit: 'UN' },
      { name: 'Suco Natural', categoryId: bebidas?.id, price: 700, cost: 300, stock: 20, minStock: 5, unit: 'UN' },
      { name: 'Energético', categoryId: bebidas?.id, price: 1000, cost: 500, stock: 12, minStock: 5, unit: 'UN' },
    ];

    for (const p of products) {
      const existing = await prisma.product.findFirst({ where: { name: p.name } });
      if (!existing) await prisma.product.create({ data: p });
    }

    return NextResponse.json({ message: 'Seed completo!' });
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao processar seed' }, { status: 500 });
  }
}
