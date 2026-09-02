const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('admin123', 12);
  const funcPassword = await bcrypt.hash('func123', 12);

  await prisma.user.upsert({
    where: { email: 'admin@sauna.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@sauna.com',
      password: adminPassword,
      role: 'ADMIN',
      active: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'funcionario@sauna.com' },
    update: {},
    create: {
      name: 'Funcionário',
      email: 'funcionario@sauna.com',
      password: funcPassword,
      role: 'FUNCIONARIO',
      active: true,
    },
  });

  const categories = ['Bebidas', 'Alimentos', 'Produtos', 'Serviços'];
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const cats = await prisma.category.findMany();
  const bebidas = cats.find(c => c.name === 'Bebidas');

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

  console.log('Seed complete!');
  console.log('Admin: admin@sauna.com / admin123');
  console.log('Func:  funcionario@sauna.com / func123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
