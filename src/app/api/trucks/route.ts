import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idParam = searchParams.get('id');

  // Single item GET
  if (idParam) {
    const id = Number(idParam);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ error: 'id inválido' }, { status: 400 });
    }
    const item = await prisma.truck.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json(item);
  }

  // List GET
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

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get('id'));

  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

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

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get('id'));

  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

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

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get('id'));

  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

  try {
    // Check for associated tickets involved in an invoice
    const ticketsWithInvoice = await prisma.ticket.findFirst({
      where: {
        truckId: id,
        invoiceId: { not: null }
      }
    });

    if (ticketsWithInvoice) {
      return NextResponse.json({
        error: 'No se puede eliminar el camión porque tiene tickets asociados a una factura.'
      }, { status: 409 });
    }

    // Check for any associated tickets (integrity check)
    const anyTickets = await prisma.ticket.findFirst({
      where: { truckId: id }
    });

    if (anyTickets) {
      return NextResponse.json({
        error: 'No se puede eliminar el camión porque tiene tickets registrados. '
      }, { status: 409 });
    }

    const deleted = await prisma.truck.delete({ where: { id } });
    return NextResponse.json(deleted);
  } catch (err: any) {
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}
