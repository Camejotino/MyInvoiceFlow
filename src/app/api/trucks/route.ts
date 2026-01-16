import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const page = Number(searchParams.get('page') || '1');
  const pageSize = Number(searchParams.get('pageSize') || '20');
  const skip = (page - 1) * pageSize;

  const where = q
    ? { OR: [{ number: { contains: q } }, { description: { contains: q } }] }
    : {};

  const [items, total] = await Promise.all([
    prisma.truck.findMany({ where, skip, take: pageSize, orderBy: { createdAt: 'desc' } }),
    prisma.truck.count({ where })
  ]);

  return NextResponse.json({ items, total, page, pageSize });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { number, description, active = true } = body;

    if (!number || typeof number !== 'string') {
      return NextResponse.json({ error: 'number requerido' }, { status: 400 });
    }

    const created = await prisma.truck.create({ data: { number, description: description ?? '', active } });
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: 'El número ya existe' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Error al crear' }, { status: 500 });
  }
}
