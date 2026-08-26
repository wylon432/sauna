const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const user = await prisma.user.findUnique({ where: { email: 'admin@sauna.com' } });
  if (!user) { console.log('USER NOT FOUND'); return; }
  console.log('User found:', user.name, 'Role:', user.role, 'Active:', user.active, 'HasPassword:', !!user.password);
  if (user.password) {
    const valid = await bcrypt.compare('admin123', user.password);
    console.log('Password valid:', valid);
  }
}
test().catch(e => console.error(e)).finally(() => prisma.$disconnect());
