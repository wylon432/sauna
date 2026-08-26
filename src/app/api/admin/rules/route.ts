import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const rules = await prisma.rules.findMany({ orderBy: [{ type: 'asc' }, { version: 'desc' }] });
  return NextResponse.json({ rules });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  
  const lastRule = await prisma.rules.findFirst({
    where: { type: body.type },
    orderBy: { version: 'desc' },
  });

  const rule = await prisma.rules.create({
    data: {
      type: body.type,
      content: body.content,
      version: (lastRule?.version ?? 0) + 1,
      author: (session.user as any).id,
    },
  });
  return NextResponse.json({ rule });
}
