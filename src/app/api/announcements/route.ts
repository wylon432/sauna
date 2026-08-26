import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  try {
    const now = new Date();

    const announcements = await prisma.announcement.findMany({
      where: {
        active: true,
        endDate: { gte: now },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(announcements, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar avisos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
