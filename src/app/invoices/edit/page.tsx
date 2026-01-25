"use client";

import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { Invoice, InvoiceRow } from '@/components/invoice/types';
import InvoiceHeader from '@/components/invoice/InvoiceHeader';
import InvoiceTable from '@/components/invoice/InvoiceTable';
import InvoiceTotals from '@/components/invoice/InvoiceTotals';
import TruckTotals from '@/components/invoice/TruckTotals';
import { apiClient } from '@/lib/api-client';

/**
 * Componente interno que contiene la lógica de edición
 * Separado para usar Suspense con useSearchParams
 */
function EditInvoiceContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const invoiceId = searchParams.get('id');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [invoiceNumber, setInvoiceNumber] = useState<string>('...');

    // Inicializar formulario con valores por defecto
    const {
        control,
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm<Invoice>({
        defaultValues: {
            date: new Date(),
            soldTo: '',
            invoiceNumber: '...',
            items: Array(5).fill({
                date: null,
                truckNumber: '',
                ticketNumber: '',
                projectName: '',
                quantity: 0,
                rate: 0,
                total: 0,
            }),
            subtotal: 0,
            dispatchFee: 0,
            total: 0,
        },
    });

    // Cargar los datos de la factura al montar el componente
    useEffect(() => {
        if (!invoiceId) {
            setError('No se proporcionó un ID de factura');
            setLoading(false);
            return;
        }

        async function loadInvoice() {
            try {
                setLoading(true);
                setError(null);

                // Obtener la factura por ID
                const invoice = await apiClient.getInvoiceById(Number(invoiceId));

                if (!invoice) {
                    setError('Factura no encontrada');
                    return;
                }

                setInvoiceNumber(invoice.invoiceNumber);

                // Rellenar el formulario con los datos de la factura
                // Asegurarnos de tener al menos 5 items para mantener la estructura
                const itemsToLoad = [...invoice.items];
                while (itemsToLoad.length < 5) {
                    itemsToLoad.push({
                        date: null,
                        truckNumber: '',
                        ticketNumber: '',
                        projectName: '',
                        quantity: 0,
                        rate: 0,
                        total: 0,
                    } as any);
                }

                // Debug: ver los datos que estamos cargando
                console.log('Invoice items loaded:', itemsToLoad);

                reset({
                    date: new Date(invoice.date),
                    soldTo: invoice.soldTo,
                    invoiceNumber: invoice.invoiceNumber,
                    items: itemsToLoad.map(item => ({
                        date: item.date ? new Date(item.date) : null,
                        truckNumber: item.truckNumber || '',
                        ticketNumber: item.ticketNumber || '',
                        projectName: item.projectName || '',
                        quantity: Number(item.quantity) || 0,
                        rate: Number(item.rate) || 0,
                        total: Number(item.total) || 0,
                    })),
                    subtotal: invoice.subtotal,
                    dispatchFee: invoice.dispatchFee,
                    total: invoice.total,
                });

                // Debug: ver los valores después del reset
                console.log('Form values after reset:', getValues());


            } catch (err: any) {
                console.error('Error al cargar factura:', err);
                setError(err.message || 'Error al cargar la factura');
            } finally {
                setLoading(false);
            }
        }

        loadInvoice();
    }, [invoiceId, reset]);

    /**
     * Maneja el envío del formulario
     */
    const onSubmit = async (data: Invoice) => {
        try {
            if (!invoiceId) {
                alert('Error: No se puede actualizar sin un ID de factura');
                return;
            }

            // Validar que haya al menos un item con datos
            const validItems = data.items.filter(
                (item) => item.truckNumber || item.ticketNumber || item.projectName
            );

            if (validItems.length === 0) {
                alert('Por favor, agregue al menos un item a la factura');
                return;
            }

            // Calcular totales finales antes de enviar
            const finalSubtotal = validItems.reduce((sum, item) => {
                return sum + (Number(item.quantity) * Number(item.rate));
            }, 0);
            const finalDispatchFeePercent = Number(data.dispatchFee) || 0;
            const finalTotal = finalSubtotal - (finalSubtotal * (finalDispatchFeePercent / 100));

            // Preparar los datos para enviar
            const invoiceData = {
                date: data.date instanceof Date ? data.date.toISOString() : new Date(data.date).toISOString(),
                soldTo: data.soldTo,
                items: validItems.map(item => {
                    const quantity = Number(item.quantity) || 0;
                    const rate = Number(item.rate) || 0;
                    const total = quantity * rate;

                    return {
                        date: item.date ? (item.date instanceof Date ? item.date.toISOString() : new Date(item.date).toISOString()) : null,
                        truckNumber: item.truckNumber || '',
                        ticketNumber: item.ticketNumber || '',
                        projectName: item.projectName || '',
                        quantity,
                        rate,
                        total,
                    };
                }),
                subtotal: finalSubtotal,
                dispatchFee: finalDispatchFeePercent,
                total: finalTotal,
            };

            // Actualizar en la base de datos
            await apiClient.updateInvoice(Number(invoiceId), invoiceData);

            // Redirigir al historial de facturas
            router.push('/invoices/history');

        } catch (error: any) {
            console.error('Error al actualizar factura:', error);
            alert(error.message || 'Error al actualizar la factura');
        }
    };

    // Mostrar loading
    if (loading) {
        return (
            <div className="min-h-screen py-8 px-4" style={{ backgroundColor: '#FEFEFE' }}>
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-12">
                        <p style={{ color: '#74654F' }}>Cargando factura...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Mostrar error
    if (error) {
        return (
            <div className="min-h-screen py-8 px-4" style={{ backgroundColor: '#FEFEFE' }}>
                <div className="max-w-7xl mx-auto">
                    <div className="mb-4 rounded-lg p-4" style={{ backgroundColor: '#ECD8B6', border: '1px solid #74654F' }}>
                        <p style={{ color: '#1F1E1D' }}>{error}</p>
                    </div>
                    <Link
                        href="/invoices/history"
                        className="px-4 py-2 text-white rounded-lg transition-colors duration-200 inline-block"
                        style={{ backgroundColor: '#F89E1A' }}
                    >
                        Volver al Historial
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4" style={{ backgroundColor: '#FEFEFE' }}>
            <div className="max-w-7xl mx-auto">
                {/* Header de la página - FUERA del formulario */}
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold print:hidden" style={{ color: '#1F1E1D' }}>Editar Factura</h1>
                        <p className="mt-1 print:hidden" style={{ color: '#74654F' }}>Modifica los datos de la factura existente</p>
                    </div>
                    <div className="flex gap-2 print:hidden">
                        <Link
                            href="/invoices/history"
                            className="px-4 py-2 text-white rounded-lg transition-colors duration-200 no-underline cursor-pointer"
                            style={{ display: 'inline-block', textDecoration: 'none', backgroundColor: '#F89E1A' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3B85E'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F89E1A'}
                        >
                            Historial de Facturas
                        </Link>
                        <Link
                            href="/"
                            className="px-4 py-2 text-white rounded-lg transition-colors duration-200 no-underline cursor-pointer"
                            style={{ display: 'inline-block', textDecoration: 'none', backgroundColor: '#74654F' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1F1E1D'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#74654F'}
                        >
                            Volver a Inicio
                        </Link>
                    </div>
                </div>

                {/* Formulario */}
                <form key={invoiceNumber} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Encabezado de Factura */}
                    <InvoiceHeader
                        control={control}
                        register={register}
                        invoiceNumber={invoiceNumber}
                    />

                    {/* Tabla de Detalles */}
                    <InvoiceTable control={control} setValue={setValue} getValues={getValues} />

                    {/* Resumen de Totales - Layout de dos columnas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Totales por Camión - Izquierda */}
                        <div>
                            <TruckTotals control={control} />
                        </div>
                        {/* Totales Generales - Derecha */}
                        <div className="flex justify-end">
                            <InvoiceTotals
                                control={control}
                                setValue={setValue}
                                getValues={getValues}
                            />
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end gap-4 pt-6 print:hidden" style={{ borderTop: '1px solid #74654F' }}>
                        <Link
                            href="/invoices/history"
                            className="px-6 py-3 rounded-lg transition-colors duration-200 font-medium no-underline"
                            style={{ border: '1px solid #74654F', color: '#74654F', backgroundColor: '#FEFEFE', display: 'inline-block' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ECD8B6'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FEFEFE'}
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-3 text-white rounded-lg transition-colors duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#F89E1A' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3B85E'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F89E1A'}
                        >
                            {isSubmitting ? 'Actualizando...' : 'Actualizar Factura'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                window.print();
                            }}
                            className="px-6 py-3 text-white rounded-lg transition-colors duration-200 font-medium shadow-lg"
                            style={{ backgroundColor: '#74654F' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1F1E1D'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#74654F'}
                        >
                            Imprimir / PDF
                        </button>
                    </div>

                    {/* Mostrar errores si los hay */}
                    {Object.keys(errors).length > 0 && (
                        <div className="rounded-lg p-4 print:hidden" style={{ backgroundColor: '#ECD8B6', border: '1px solid #74654F' }}>
                            <p className="font-medium" style={{ color: '#1F1E1D' }}>Por favor, complete todos los campos requeridos</p>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

/**
 * Página de edición de facturas
 * Integra todos los componentes de facturación con React Hook Form
 * Usa query params para recibir el ID de la factura (ej: /invoices/edit?id=123)
 */
export default function EditInvoicePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen py-8 px-4" style={{ backgroundColor: '#FEFEFE' }}>
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-12">
                        <p style={{ color: '#74654F' }}>Cargando...</p>
                    </div>
                </div>
            </div>
        }>
            <EditInvoiceContent />
        </Suspense>
    );
}
