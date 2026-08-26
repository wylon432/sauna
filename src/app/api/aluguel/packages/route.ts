import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  try {
    const packages = await prisma.rentalPackage.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(packages);
  } catch (error) {
    console.error('Error fetching rental packages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
