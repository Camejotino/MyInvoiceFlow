"use client";

import { useFieldArray, Control, useWatch, UseFormSetValue, UseFormGetValues, Controller } from 'react-hook-form';
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
  getValues: UseFormGetValues<Invoice>;
}

/**
 * Componente de tabla editable para los detalles de la factura
 * Permite agregar/eliminar filas y calcula automáticamente los totales
 */
export default function InvoiceTable({ control, setValue, getValues }: InvoiceTableProps) {
  const [trucks, setTrucks] = useState<Truck[]>([]);

  const { fields, append, remove, insert } = useFieldArray({
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
        console.log('Trucks loaded:', data.items);
        setTrucks(data.items || []);
      } catch (error) {
        console.error('Error fetching trucks:', error);
      }
    }
    fetchTrucks();
  }, []);

  // Debug: log items when they change
  useEffect(() => {
    if (items && items.length > 0) {
      console.log('Current items in InvoiceTable:', items);
    }
  }, [items]);


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
    if (fields.length >= 20) {
      alert('Se ha alcanzado el límite máximo de 20 filas, haga otra factura');
      return;
    }
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
   * Duplica una fila existente copiando campos seleccionados
   */
  const handleDuplicateRow = (index: number) => {
    if (fields.length >= 20) {
      alert('Se ha alcanzado el límite máximo de 20 filas');
      return;
    }

    const currentItems = getValues().items;
    const rowToCopy = currentItems[index];

    insert(index + 1, {
      date: rowToCopy.date ? new Date(rowToCopy.date) : null,
      truckNumber: rowToCopy.truckNumber || '',
      ticketNumber: '',
      projectName: rowToCopy.projectName || '',
      quantity: 0,
      rate: rowToCopy.rate || 0,
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
          disabled={fields.length >= 21}
          className="px-4 py-2 text-white rounded-md transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: fields.length >= 20 ? '#74654F' : '#F89E1A' }}
          onMouseEnter={(e) => {
            if (fields.length < 20) e.currentTarget.style.backgroundColor = '#F3B85E';
          }}
          onMouseLeave={(e) => {
            if (fields.length < 20) e.currentTarget.style.backgroundColor = '#F89E1A';
          }}
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
          Add Row {fields.length >= 20 && '(Max)'}
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
                      <Controller
                        control={control}
                        name={`items.${index}.date`}
                        render={({ field: { value, onChange, onBlur, ref } }) => (
                          <input
                            type="date"
                            ref={ref}
                            value={value && value instanceof Date ? value.toISOString().split('T')[0] : (typeof value === 'string' ? (value as string).split('T')[0] : '')}
                            onChange={(e) => {
                              // Ensure we save a proper Date object (or null)
                              onChange(e.target.valueAsDate);
                            }}
                            onBlur={(e) => {
                              onBlur();
                              e.currentTarget.style.borderColor = '#74654F';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                            className="w-full px-2 py-1 text-sm border rounded focus:outline-none"
                            style={{ borderColor: '#74654F', borderWidth: '1px' }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = '#F89E1A';
                              e.currentTarget.style.boxShadow = '0 0 0 1px #F89E1A';
                            }}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                          />
                        )}
                      />
                    </td>

                    {/* Truck # */}
                    <td className="px-3 py-2 border-b" style={{ borderColor: '#ECD8B6' }}>
                      <div className="hidden print:block text-sm px-2 py-1">
                        {currentItem?.truckNumber || ''}
                      </div>
                      <Controller
                        control={control}
                        name={`items.${index}.truckNumber`}
                        render={({ field }) => (
                          <select
                            {...field}
                            className="w-full px-2 py-1 text-sm border rounded focus:outline-none bg-white print:hidden"
                            style={{ borderColor: '#74654F', borderWidth: '1px' }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = '#F89E1A';
                              e.currentTarget.style.boxShadow = '0 0 0 1px #F89E1A';
                            }}
                            onBlur={(e) => {
                              field.onBlur();
                              e.currentTarget.style.borderColor = '#74654F';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                          >
                            <option value="">Selecciona un camión</option>
                            {trucks
                              .filter(truck => truck.active || truck.number === field.value)
                              .map((truck) => (
                                <option key={truck.id} value={truck.number}>
                                  {truck.number} - {truck.description}
                                </option>
                              ))}
                          </select>
                        )}
                      />
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
                          if (e.target.value === '0') e.target.value = '';
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
                          if (e.target.value === '0') e.target.value = '';
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
                      <div className="flex items-center justify-center gap-2">
                        {fields.length < 20 && (
                          <button
                            type="button"
                            onClick={() => handleDuplicateRow(index)}
                            className="transition-colors"
                            style={{ color: '#F89E1A' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#F3B85E'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#F89E1A'}
                            title="Duplicar fila (Date, Truck, Project, Rate)"
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
                                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                              />
                            </svg>
                          </button>
                        )}
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
                      </div>
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
