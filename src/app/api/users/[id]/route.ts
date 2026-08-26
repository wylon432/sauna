import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const updateProfileSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  zipCode: z.string().nullable().optional(),
  cpf: z.string().nullable().optional(),
  birthDate: z.string().nullable().optional(),
});

type Params = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = (session.user as any).id;
    if (user !== params.id && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const profile = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const sessionUserId = (session.user as any).id;
    if (sessionUserId !== params.id && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const data = updateProfileSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const { name, phone, address, city, state, zipCode, cpf, birthDate } = data as any;

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(phone !== undefined && { phone: phone?.trim() || null }),
        ...(address !== undefined || city !== undefined || state !== undefined || zipCode !== undefined || cpf !== undefined || birthDate !== undefined
          ? {
              profile: {
                upsert: {
                  create: {
                    ...(address !== undefined && { address: address?.trim() || null }),
                    ...(city !== undefined && { city: city?.trim() || null }),
                    ...(state !== undefined && { state: state?.trim() || null }),
                    ...(zipCode !== undefined && { zipCode: zipCode?.trim() || null }),
                    ...(cpf !== undefined && { cpf: cpf?.trim() || null }),
                    ...(birthDate !== undefined && { birthDate: birthDate ? new Date(birthDate) : null }),
                  },
                  update: {
                    ...(address !== undefined && { address: address?.trim() || null }),
                    ...(city !== undefined && { city: city?.trim() || null }),
                    ...(state !== undefined && { state: state?.trim() || null }),
                    ...(zipCode !== undefined && { zipCode: zipCode?.trim() || null }),
                    ...(cpf !== undefined && { cpf: cpf?.trim() || null }),
                    ...(birthDate !== undefined && { birthDate: birthDate ? new Date(birthDate) : null }),
                  },
                },
              },
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
