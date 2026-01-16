import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: 'id inválido' }, { status: 400 });
  }
  const item = await prisma.truck.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  try {
    const body = await request.json();
    const { number, description, active } = body;
    const updated = await prisma.truck.update({ where: { id }, data: { number, description, active } });
    return NextResponse.json(updated);
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: 'El número ya existe' }, { status: 409 });
    }
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  try {
    const body = await request.json();
    const { active } = body;
    const updated = await prisma.truck.update({ where: { id }, data: { active } });
    return NextResponse.json(updated);
  } catch (err: any) {
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Error al actualizar estado' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  try {
    const updated = await prisma.truck.update({ where: { id }, data: { active: false } });
    return NextResponse.json(updated);
  } catch (err: any) {
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}
