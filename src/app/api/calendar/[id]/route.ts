import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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
    const { id } = params;

    const block = await prisma.calendarBlock.findUnique({ where: { id } });
    if (!block) {
      return NextResponse.json({ error: 'Calendar block not found' }, { status: 404 });
    }

    await prisma.calendarBlock.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DELETE',
        resource: 'CalendarBlock',
        resourceId: id,
        details: `Deleted calendar block for ${block.service} on ${block.date.toISOString()}`,
      },
    });

    return NextResponse.json({ message: 'Block deleted successfully' });
  } catch (error) {
    console.error('Error deleting calendar block:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
