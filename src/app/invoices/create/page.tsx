"use client";

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { Invoice, InvoiceRow } from '@/components/invoice/types';
import InvoiceHeader from '@/components/invoice/InvoiceHeader';
import InvoiceTable from '@/components/invoice/InvoiceTable';
import InvoiceTotals from '@/components/invoice/InvoiceTotals';

/**
 * Página de creación de facturas
 * Integra todos los componentes de facturación con React Hook Form
 */
export default function CreateInvoicePage() {
  const router = useRouter();

  // Generar número de factura único (en producción, esto vendría de la BD)
  const invoiceNumber = useMemo(() => {
    const timestamp = Date.now();
    return `INV-${timestamp.toString().slice(-6)}`;
  }, []);

  // Inicializar formulario con valores por defecto
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Invoice>({
    defaultValues: {
      date: new Date(),
      soldTo: '',
      invoiceNumber: invoiceNumber,
      items: [
        {
          date: new Date(),
          truckNumber: '',
          ticketNumber: '',
          projectName: '',
          quantity: 0,
          rate: 0,
          total: 0,
        },
      ],
      subtotal: 0,
      dispatchFee: 0,
      total: 0,
    },
  });

  // Observar cambios en items para actualizar totales
  const items = watch('items');
  const dispatchFee = watch('dispatchFee');

  // Calcular y actualizar subtotal y total automáticamente
  useEffect(() => {
    if (!items || items.length === 0) {
      setValue('subtotal', 0);
      setValue('total', Number(dispatchFee) || 0);
      return;
    }

    const subtotal = items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const rate = Number(item.rate) || 0;
      const total = quantity * rate;
      
      // Actualizar el total de cada fila
      const index = items.indexOf(item);
      setValue(`items.${index}.total`, total);
      
      return sum + total;
    }, 0);

    const fee = Number(dispatchFee) || 0;
    const total = subtotal + fee;

    setValue('subtotal', subtotal);
    setValue('total', total);
  }, [items, dispatchFee, setValue]);

  /**
   * Maneja el envío del formulario
   */
  const onSubmit = async (data: Invoice) => {
    try {
      // Validar que haya al menos un item con datos
      const validItems = data.items.filter(
        (item) => item.truckNumber || item.ticketNumber || item.projectName
      );

      if (validItems.length === 0) {
        alert('Por favor, agregue al menos un item a la factura');
        return;
      }

      // Preparar los datos para enviar
      const invoiceData = {
        invoiceNumber: data.invoiceNumber,
        date: data.date instanceof Date ? data.date.toISOString() : new Date(data.date).toISOString(),
        soldTo: data.soldTo,
        items: validItems.map(item => ({
          date: item.date ? (item.date instanceof Date ? item.date.toISOString() : new Date(item.date).toISOString()) : null,
          truckNumber: item.truckNumber || '',
          ticketNumber: item.ticketNumber || '',
          projectName: item.projectName || '',
          quantity: Number(item.quantity) || 0,
          rate: Number(item.rate) || 0,
          total: Number(item.total) || 0,
        })),
        subtotal: Number(data.subtotal) || 0,
        dispatchFee: Number(data.dispatchFee) || 0,
        total: Number(data.total) || 0,
      };

      // Guardar en la base de datos
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al guardar la factura');
      }

      const savedInvoice = await response.json();
      
      alert('Factura guardada exitosamente');
      
      // Redirigir al historial de facturas
      router.push('/invoices/history');
    } catch (error: any) {
      console.error('Error al guardar factura:', error);
      alert(error.message || 'Error al guardar la factura');
    }
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: '#FEFEFE' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header de la página - FUERA del formulario */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold print:hidden" style={{ color: '#1F1E1D' }}>Crear Factura</h1>
            <p className="mt-1 print:hidden" style={{ color: '#74654F' }}>Complete los datos para generar una nueva factura</p>
          </div>
          <div className="flex gap-2 print:hidden" style={{ zIndex: 9999, position: 'relative', pointerEvents: 'auto' }}>
            <a
              href="/invoices/history"
              className="px-4 py-2 text-white rounded-lg transition-colors duration-200 no-underline cursor-pointer"
              style={{ display: 'inline-block', textDecoration: 'none', backgroundColor: '#F89E1A' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3B85E'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F89E1A'}
            >
              Historial de Facturas
            </a>
            <a
              href="/"
              className="px-4 py-2 text-white rounded-lg transition-colors duration-200 no-underline cursor-pointer"
              style={{ display: 'inline-block', textDecoration: 'none', backgroundColor: '#74654F' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1F1E1D'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#74654F'}
            >
              Volver a Inicio
            </a>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Encabezado de Factura */}
          <InvoiceHeader
            control={control}
            register={register}
            invoiceNumber={invoiceNumber}
          />

          {/* Tabla de Detalles */}
          <InvoiceTable control={control} setValue={setValue} />

          {/* Resumen de Totales */}
          <div className="flex justify-end">
            <InvoiceTotals control={control} />
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-4 pt-6 print:hidden" style={{ borderTop: '1px solid #74654F' }}>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
              style={{ border: '1px solid #74654F', color: '#74654F', backgroundColor: '#FEFEFE' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ECD8B6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FEFEFE'}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 text-white rounded-lg transition-colors duration-200 font-medium shadow-lg"
              style={{ backgroundColor: '#F89E1A' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3B85E'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F89E1A'}
            >
              Guardar Factura
            </button>
            <button
              type="button"
              onClick={() => {
                // Función para imprimir/exportar PDF (pendiente)
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
            <div className="rounded-lg p-4" style={{ backgroundColor: '#ECD8B6', border: '1px solid #74654F' }}>
              <p className="font-medium" style={{ color: '#1F1E1D' }}>Por favor, complete todos los campos requeridos</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
