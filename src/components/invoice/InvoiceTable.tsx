"use client";

import { useFieldArray, Control, useWatch, UseFormSetValue } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { Invoice, InvoiceRow } from './types';
import { apiClient } from '@/lib/api-client';

type Truck = {
  id: number;
  number: string;
  description: string;
  active: boolean;
};

interface InvoiceTableProps {
  control: Control<Invoice>;
  setValue: UseFormSetValue<Invoice>;
}

/**
 * Componente de tabla editable para los detalles de la factura
 * Permite agregar/eliminar filas y calcula automáticamente los totales
 */
export default function InvoiceTable({ control, setValue }: InvoiceTableProps) {
  const [trucks, setTrucks] = useState<Truck[]>([]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  // Observar cambios en los items para recalcular
  const items = useWatch({
    control,
    name: 'items',
  });

  // Fetch trucks on mount
  useEffect(() => {
    async function fetchTrucks() {
      try {
        // Use apiClient to handle both Web and Electron (IPC) environments
        const data = await apiClient.searchTrucks({ pageSize: 1000 });
        setTrucks(data.items || []);
      } catch (error) {
        console.error('Error fetching trucks:', error);
      }
    }
    fetchTrucks();
  }, []);

  // Actualizar totales cuando cambian quantity o rate
  useEffect(() => {
    if (!items || items.length === 0) return;

    items.forEach((item, index) => {
      const quantity = Number(item.quantity) || 0;
      const rate = Number(item.rate) || 0;
      const total = quantity * rate;

      // Solo actualizar si el valor cambió para evitar loops infinitos
      if (item.total !== total) {
        setValue(`items.${index}.total`, total, { shouldValidate: false });
      }
    });
  }, [items, setValue]);

  /**
   * Calcula el total de una fila (quantity * rate)
   */
  const calculateRowTotal = (row: InvoiceRow): number => {
    const quantity = Number(row.quantity) || 0;
    const rate = Number(row.rate) || 0;
    return quantity * rate;
  };

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

  /**
   * Agrega una nueva fila vacía
   */
  const handleAddRow = () => {
    append({
      date: null,
      truckNumber: '',
      ticketNumber: '',
      projectName: '',
      quantity: 0,
      rate: 0,
      total: 0,
    });
  };

  /**
   * Maneja la eliminación de una fila
   */
  const handleRemoveRow = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  /**
   * Maneja la navegación con teclado (Enter para agregar fila)
   */
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleAddRow();
    }
    if (e.key === 'Delete' && e.ctrlKey && fields.length > 1) {
      e.preventDefault();
      handleRemoveRow(index);
    }
  };

  // Asegurar que siempre haya al menos una fila (se maneja en el componente padre)

  return (
    <div className="rounded-lg shadow-sm p-6 mb-6" style={{ backgroundColor: '#FEFEFE', border: '1px solid #74654F' }}>
      <div className="flex justify-between items-center mb-4 print:hidden">
        <h3 className="text-lg font-semibold " style={{ color: '#1F1E1D' }}>Detalles de Factura</h3>
        <button
          type="button"
          onClick={handleAddRow}
          className="px-4 py-2 text-white rounded-md transition-colors duration-200 flex items-center gap-2 "
          style={{ backgroundColor: '#F89E1A' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3B85E'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F89E1A'}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Row
        </button>
      </div>

      <div className="overflow-x-auto invoice-table-scroll">
        <div className="overflow-y-auto max-h-[500px] invoice-table-scroll">
          <table className="w-full border-collapse invoice-table">
            <thead style={{ backgroundColor: '#ECD8B6' }}>
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider border-b" style={{ color: '#1F1E1D', borderColor: '#74654F' }}>
                  Date
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider border-b" style={{ color: '#1F1E1D', borderColor: '#74654F' }}>
                  Truck #
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider border-b" style={{ color: '#1F1E1D', borderColor: '#74654F' }}>
                  Ticket #
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider border-b" style={{ color: '#1F1E1D', borderColor: '#74654F' }}>
                  P.O / Project Name
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wider border-b" style={{ color: '#1F1E1D', borderColor: '#74654F' }}>
                  Tons / Hours
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wider border-b" style={{ color: '#1F1E1D', borderColor: '#74654F' }}>
                  Rate
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wider border-b" style={{ color: '#1F1E1D', borderColor: '#74654F' }}>
                  Total x load
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider border-b w-16 print:hidden" style={{ color: '#1F1E1D', borderColor: '#74654F' }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ backgroundColor: '#FEFEFE', borderColor: '#74654F' }}>
              {fields.map((field, index) => {
                const currentItem = items?.[index] || field;
                const rowTotal = calculateRowTotal(currentItem as InvoiceRow);

                return (
                  <tr key={field.id} style={{ backgroundColor: '#FEFEFE' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ECD8B6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FEFEFE'}>
                    {/* Date */}
                    <td className="px-3 py-2 border-b" style={{ borderColor: '#ECD8B6' }}>
                      <input
                        type="date"
                        {...control.register(`items.${index}.date` as const, {
                          valueAsDate: true,
                        })}
                        className="w-full px-2 py-1 text-sm border rounded focus:outline-none"
                        style={{ borderColor: '#74654F', borderWidth: '1px' }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#F89E1A';
                          e.currentTarget.style.boxShadow = '0 0 0 1px #F89E1A';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#74654F';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                      />
                    </td>

                    {/* Truck # */}
                    <td className="px-3 py-2 border-b" style={{ borderColor: '#ECD8B6' }}>
                      <div className="hidden print:block text-sm px-2 py-1">
                        {currentItem?.truckNumber || ''}
                      </div>
                      <select
                        {...control.register(`items.${index}.truckNumber` as const)}
                        className="w-full px-2 py-1 text-sm border rounded focus:outline-none bg-white print:hidden"
                        style={{ borderColor: '#74654F', borderWidth: '1px' }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#F89E1A';
                          e.currentTarget.style.boxShadow = '0 0 0 1px #F89E1A';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#74654F';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                      >
                        <option value="">Selecciona un camión</option>
                        {trucks.map((truck) => (
                          <option key={truck.id} value={truck.number}>
                            {truck.number} - {truck.description}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Ticket # */}
                    <td className="px-3 py-2 border-b" style={{ borderColor: '#ECD8B6' }}>
                      <input
                        type="text"
                        {...control.register(`items.${index}.ticketNumber` as const)}
                        placeholder="Ticket #"
                        className="w-full px-2 py-1 text-sm border rounded focus:outline-none"
                        style={{ borderColor: '#74654F', borderWidth: '1px' }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#F89E1A';
                          e.currentTarget.style.boxShadow = '0 0 0 1px #F89E1A';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#74654F';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                      />
                    </td>

                    {/* P.O / Project Name */}
                    <td className="px-3 py-2 border-b" style={{ borderColor: '#ECD8B6' }}>
                      <input
                        type="text"
                        {...control.register(`items.${index}.projectName` as const)}
                        placeholder="Project Name"
                        className="w-full px-2 py-1 text-sm border rounded focus:outline-none"
                        style={{ borderColor: '#74654F', borderWidth: '1px' }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#F89E1A';
                          e.currentTarget.style.boxShadow = '0 0 0 1px #F89E1A';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#74654F';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                      />
                    </td>

                    {/* Tons / Hours */}
                    <td className="px-3 py-2 border-b" style={{ borderColor: '#ECD8B6' }}>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        {...control.register(`items.${index}.quantity` as const, {
                          valueAsNumber: true,
                          min: 0,
                        })}
                        placeholder="0.00"
                        className="w-full px-2 py-1 text-sm border rounded text-right focus:outline-none"
                        style={{ borderColor: '#74654F', borderWidth: '1px' }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#F89E1A';
                          e.currentTarget.style.boxShadow = '0 0 0 1px #F89E1A';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#74654F';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                      />
                    </td>

                    {/* Rate */}
                    <td className="px-3 py-2 border-b" style={{ borderColor: '#ECD8B6' }}>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        {...control.register(`items.${index}.rate` as const, {
                          valueAsNumber: true,
                          min: 0,
                        })}
                        placeholder="0.00"
                        className="w-full px-2 py-1 text-sm border rounded text-right focus:outline-none"
                        style={{ borderColor: '#74654F', borderWidth: '1px' }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#F89E1A';
                          e.currentTarget.style.boxShadow = '0 0 0 1px #F89E1A';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#74654F';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                      />
                    </td>

                    {/* Total x load (readonly, calculado) */}
                    <td className="px-3 py-2 border-b" style={{ borderColor: '#ECD8B6' }}>
                      <div className="text-right text-sm font-medium px-2 py-1 rounded" style={{ color: '#1F1E1D', backgroundColor: '#ECD8B6' }}>
                        {formatCurrency(rowTotal)}
                      </div>
                      <input
                        type="hidden"
                        {...control.register(`items.${index}.total` as const, {
                          valueAsNumber: true,
                        })}
                        value={rowTotal}
                      />
                    </td>

                    {/* Acciones */}
                    <td className="px-3 py-2 border-b text-center print:hidden" style={{ borderColor: '#ECD8B6' }}>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(index)}
                          className="transition-colors"
                          style={{ color: '#74654F' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#1F1E1D'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#74654F'}
                          title="Eliminar fila"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-xs print:hidden" style={{ color: '#74654F' }}>
        <p>💡 Presiona Ctrl+Enter para agregar una fila | Ctrl+Delete para eliminar</p>
      </div>
    </div>
  );
}
