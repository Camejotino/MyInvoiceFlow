import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * GET /api/invoices
 * Lista todas las facturas con paginación
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const page = Number(searchParams.get('page') || '1');
    const pageSize = Number(searchParams.get('pageSize') || '20');
    const skip = (page - 1) * pageSize;

    const where = q
      ? {
          OR: [
            { invoiceNumber: { contains: q } },
            { soldTo: { contains: q } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json({ items, total, page, pageSize });
  } catch (error: any) {
    console.error('Error al listar facturas:', error);
    return NextResponse.json(
      { error: 'Error al listar facturas' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/invoices
 * Crea una nueva factura
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      invoiceNumber,
      date,
      soldTo,
      items,
      subtotal,
      dispatchFee,
      total,
    } = body;

    // Validaciones
    if (!invoiceNumber || typeof invoiceNumber !== 'string') {
      return NextResponse.json(
        { error: 'invoiceNumber requerido' },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json({ error: 'date requerido' }, { status: 400 });
    }

    if (!soldTo || typeof soldTo !== 'string') {
      return NextResponse.json({ error: 'soldTo requerido' }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'items requerido y debe tener al menos un elemento' },
        { status: 400 }
      );
    }

    // Crear la factura con sus items
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        date: new Date(date),
        soldTo,
        subtotal: new Prisma.Decimal(subtotal || 0),
        dispatchFee: new Prisma.Decimal(dispatchFee || 0),
        total: new Prisma.Decimal(total || 0),
        items: {
          create: items.map((item: any) => ({
            date: item.date ? new Date(item.date) : null,
            truckNumber: item.truckNumber || '',
            ticketNumber: item.ticketNumber || '',
            projectName: item.projectName || '',
            quantity: new Prisma.Decimal(item.quantity || 0),
            rate: new Prisma.Decimal(item.rate || 0),
            total: new Prisma.Decimal(item.total || 0),
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear factura:', error);
    
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'El número de factura ya existe' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear factura' },
      { status: 500 }
    );
  }
}
