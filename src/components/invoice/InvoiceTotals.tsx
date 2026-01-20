"use client";

import { Control, useWatch, UseFormSetValue, UseFormGetValues } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { Invoice } from './types';

interface InvoiceTotalsProps {
  control: Control<Invoice>;
  setValue: UseFormSetValue<Invoice>;
  getValues: UseFormGetValues<Invoice>;
}

/**
 * Componente de resumen de totales
 * Muestra subtotal, dispatch fee y total final
 * Actualización automática basada en los items
 */
export default function InvoiceTotals({ control, setValue, getValues }: InvoiceTotalsProps) {
  const items = useWatch({
    control,
    name: 'items',
  });

  const dispatchFee = useWatch({
    control,
    name: 'dispatchFee',
  });

  /**
   * Calcula el subtotal sumando todos los totales de las filas
   */
  const subtotal = useMemo(() => {
    if (!items || items.length === 0) return 0;

    return items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const rate = Number(item.rate) || 0;
      return sum + (quantity * rate);
    }, 0);
  }, [items]);

  /**
   * Calcula el total final (subtotal - porciento de despacho)
   * El total es el subtotal menos el dispatch fee (porcentaje) multiplicado por el subtotal
   */
  const total = useMemo(() => {
    const feePercent = Number(dispatchFee) || 0;
    const discount = subtotal * (feePercent / 100);
    return subtotal - discount;
  }, [subtotal, dispatchFee]);

  // No sincronizaremos con el estado del formulario aquí para evitar bucles.
  // Los totales se calcularán en el onSubmit final del componente padre.


  /**
   * Formatea un número como moneda
   */
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="rounded-lg shadow-sm p-6 invoice-totals" style={{ backgroundColor: '#FEFEFE', border: '1px solid #74654F' }}>
      <div className="flex justify-end">
        <div className="w-full max-w-md space-y-4 invoice-totals-inner">
          {/* Subtotal */}
          <div className="flex justify-between items-center py-2 px-4 rounded-md invoice-total-item" style={{ backgroundColor: '#ECD8B6' }}>
            <span className="text-sm font-medium" style={{ color: '#1F1E1D' }}>Subtotal</span>
            <span className="text-sm font-semibold text-right" style={{ color: '#1F1E1D' }}>
              {formatCurrency(subtotal)}
            </span>
          </div>

          {/* Dispatch Fee */}
          <div className="flex justify-between items-center py-2 px-4 invoice-total-item">
            <label className="text-sm font-medium" style={{ color: '#1F1E1D' }}>
              Dispatch Fee
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm print:hidden" style={{ color: '#74654F' }}>%</span>
              <input
                type="number"
                step="0.01"
                min="0"
                {...control.register('dispatchFee', {
                  valueAsNumber: true,
                  min: 0,
                })}
                placeholder="0.00"
                size={Math.max(4, String(dispatchFee || '0.00').length)}
                className="w-32 px-2 py-1 text-sm border rounded text-right focus:outline-none"
                style={{ borderColor: '#74654F', borderWidth: '1px' }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#F89E1A';
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(248, 158, 26, 0.2)';
                  if (e.target.value === '0') e.target.value = '';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#74654F';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center py-3 px-4 rounded-md invoice-total-item invoice-total-final" style={{ backgroundColor: '#ECD8B6', border: '2px solid #F89E1A' }}>
            <span className="text-base font-bold" style={{ color: '#1F1E1D' }}>Total</span>
            <span className="text-lg font-bold text-right" style={{ color: '#1F1E1D' }}>
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
