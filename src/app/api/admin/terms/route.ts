import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const terms = await prisma.termsVersion.findMany({ orderBy: [{ type: 'asc' }, { version: 'desc' }] });
  return NextResponse.json({ terms });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  
  const lastVersion = await prisma.termsVersion.findFirst({
    where: { type: body.type },
    orderBy: { version: 'desc' },
  });

  const term = await prisma.termsVersion.create({
    data: {
      type: body.type,
      title: body.title,
      content: body.content,
      version: (lastVersion?.version ?? 0) + 1,
      author: (session.user as any).id,
    },
  });
  return NextResponse.json({ term });
}
