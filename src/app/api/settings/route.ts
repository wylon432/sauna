import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

const PUBLIC_KEYS = ['BUSINESS_NAME', 'BUSINESS_PHONE', 'BUSINESS_EMAIL', 'BUSINESS_ADDRESS', 'LOGO_URL'];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = session && (session.user as any).role === 'ADMIN';

    const settings = await prisma.systemSetting.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });

    if (!isAdmin) {
      const filtered = settings.filter(s => PUBLIC_KEYS.includes(s.key));
      return NextResponse.json(filtered);
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = (session.user as any).role === 'ADMIN';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = (session.user as any).id as string;
    const body = await request.json();
    const { settings } = body;

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json({ error: 'settings array is required' }, { status: 400 });
    }

    const results = await Promise.all(
      settings.map(async (s: { key: string; value: string; category?: string }) => {
        return prisma.systemSetting.upsert({
          where: { key: s.key },
          update: { value: s.value, ...(s.category && { category: s.category }) },
          create: {
            key: s.key,
            value: s.value,
            category: s.category || 'GENERAL',
          },
        });
      })
    );

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE',
        resource: 'SystemSetting',
        details: `Updated ${results.length} settings`,
      },
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
