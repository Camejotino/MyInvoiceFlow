import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/invoices/[id]
 * Obtiene una factura por ID
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ error: 'id inválido' }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(invoice);
  } catch (error: any) {
    console.error('Error al obtener factura:', error);
    return NextResponse.json(
      { error: 'Error al obtener factura' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/invoices/[id]
 * Elimina una factura por ID
 */
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ error: 'id inválido' }, { status: 400 });
    }

    // Eliminar la factura (los items se eliminan en cascada)
    await prisma.invoice.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Factura eliminada exitosamente' });
  } catch (error: any) {
    console.error('Error al eliminar factura:', error);
    
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Error al eliminar factura' },
      { status: 500 }
    );
  }
}
