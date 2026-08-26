import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id as string;
    const body = await request.json();
    const { termsId, reservationId } = body;

    if (!termsId) {
      return NextResponse.json({ error: 'termsId is required' }, { status: 400 });
    }

    const terms = await prisma.termsVersion.findUnique({ where: { id: termsId } });
    if (!terms) {
      return NextResponse.json({ error: 'Terms not found' }, { status: 404 });
    }
    if (!terms.active) {
      return NextResponse.json({ error: 'These terms are no longer active' }, { status: 400 });
    }

    const existing = await prisma.termsAcceptance.findFirst({
      where: { userId, termsId },
    });
    if (existing) {
      return NextResponse.json({ message: 'Already accepted', acceptance: existing });
    }

    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0] || null;

    const acceptance = await prisma.termsAcceptance.create({
      data: {
        userId,
        termsId,
        reservationId: reservationId || null,
        ipAddress: ip,
      },
    });

    return NextResponse.json(acceptance, { status: 201 });
  } catch (error) {
    console.error('Error accepting terms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
