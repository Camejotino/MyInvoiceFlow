import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/invoices/next-number
 * Obtiene el siguiente número de factura disponible
 * Si no existe Settings, lo inicializa con 2500
 */
export async function GET() {
    try {
        // Obtener o crear Settings
        let settings = await prisma.settings.findUnique({
            where: { id: 1 },
        });

        // Si no existe, crear con valor inicial 2500
        if (!settings) {
            settings = await prisma.settings.create({
                data: {
                    id: 1,
                    nextInvoiceNumber: 2500,
                    defaultDispatchFee: 0,
                    companyInfo: 'Pino\'s Enterprise Multiservices',
                },
            });
        }

        return NextResponse.json({
            invoiceNumber: settings.nextInvoiceNumber
        });
    } catch (error: any) {
        console.error('Error al obtener siguiente número de factura:', error);
        return NextResponse.json(
            { error: 'Error al obtener siguiente número de factura' },
            { status: 500 }
        );
    }
}
