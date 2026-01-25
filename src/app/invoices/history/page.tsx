"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

interface InvoiceRowItem {
  id: number;
  date: string | null;
  truckNumber: string;
  ticketNumber: string;
  projectName: string;
  quantity: number;
  rate: number;
  total: number;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  date: string;
  soldTo: string;
  subtotal: number;
  dispatchFee: number;
  total: number;
  createdAt: string;
  items: InvoiceRowItem[];
}

/**
 * Página de historial de facturas
 * Muestra todas las facturas guardadas con opción de eliminar
 */
export default function InvoiceHistoryPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Invoice | 'itemsCount'; direction: 'asc' | 'desc' } | null>({ key: 'date', direction: 'desc' });

  /**
   * Carga las facturas desde la API
   */
  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiClient.searchInvoices({
        q: '',
        page: 1,
        pageSize: 100 // Load more by default or implement pagination properly
      });

      setInvoices(data.items || []);
    } catch (err: any) {
      console.error('Error al cargar facturas:', err);
      setError(err.message || 'Error al cargar facturas');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Elimina una factura
   */
  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de que desea eliminar esta factura?')) {
      return;
    }

    try {
      setDeletingId(id);
      await apiClient.deleteInvoice(id);

      // Recargar la lista
      await loadInvoices();
      alert('Factura eliminada exitosamente');
    } catch (err: any) {
      console.error('Error al eliminar factura:', err);
      alert(err.message || 'Error al eliminar factura');
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Formatea una fecha
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  useEffect(() => {
    loadInvoices();
  }, []);

  /**
   * Maneja el ordenamiento
   */
  const requestSort = (key: keyof Invoice | 'itemsCount') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  /**
   * Obtiene las facturas filtradas y ordenadas
   */
  const getProcessedInvoices = () => {
    let processed = [...invoices];

    // Filtrado
    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      processed = processed.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(lowSearch) ||
        invoice.soldTo.toLowerCase().includes(lowSearch) ||
        formatDate(invoice.date).toLowerCase().includes(lowSearch)
      );
    }

    // Ordenamiento
    if (sortConfig) {
      processed.sort((a, b) => {
        let aValue: any = sortConfig.key === 'itemsCount' ? a.items.length : a[sortConfig.key as keyof Invoice];
        let bValue: any = sortConfig.key === 'itemsCount' ? b.items.length : b[sortConfig.key as keyof Invoice];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return processed;
  };

  const processedInvoices = getProcessedInvoices();

  const SortIndicator = ({ column }: { column: keyof Invoice | 'itemsCount' }) => {
    if (sortConfig?.key !== column) return <span className="ml-1 opacity-30">↕</span>;
    return <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: '#FEFEFE' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#1F1E1D' }}>Historial de Facturas</h1>
            <p className="mt-1" style={{ color: '#74654F' }}>Visualiza y gestiona todas tus facturas</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/invoices/create"
              className="px-4 py-2 text-white rounded-lg transition-colors duration-200"
              style={{ backgroundColor: '#F89E1A' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3B85E'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F89E1A'}
            >
              Crear Nueva Factura
            </Link>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-white rounded-lg transition-colors duration-200"
              style={{ backgroundColor: '#74654F' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1F1E1D'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#74654F'}
            >
              Volver a Inicio
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg p-4" style={{ backgroundColor: '#ECD8B6', border: '1px solid #74654F' }}>
            <p style={{ color: '#1F1E1D' }}>{error}</p>
          </div>
        )}

        {/* Filtros */}
        {!loading && invoices.length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Buscar por número, cliente o fecha..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200"
                style={{
                  backgroundColor: '#FEFEFE',
                  borderColor: '#74654F',
                  color: '#1F1E1D'
                }}
              />
              <div className="absolute left-3 top-2.5">
                <svg className="w-5 h-5" style={{ color: '#74654F' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <p style={{ color: '#74654F' }}>Cargando facturas...</p>
          </div>
        )}

        {/* Lista de facturas */}
        {!loading && invoices.length === 0 && (
          <div className="rounded-lg shadow-sm p-12 text-center" style={{ backgroundColor: '#FEFEFE', border: '1px solid #74654F' }}>
            <svg
              className="w-16 h-16 mx-auto mb-4"
              style={{ color: '#74654F' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#1F1E1D' }}>
              No hay facturas guardadas
            </h3>
            <p className="mb-4" style={{ color: '#74654F' }}>
              Crea tu primera factura para comenzar
            </p>
            <Link
              href="/invoices/create"
              className="inline-block px-6 py-3 text-white rounded-lg transition-colors duration-200"
              style={{ backgroundColor: '#F89E1A' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3B85E'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F89E1A'}
            >
              Crear Factura
            </Link>
          </div>
        )}

        {/* Tabla de facturas */}
        {!loading && invoices.length > 0 && (
          <div className="rounded-lg shadow-sm border overflow-hidden" style={{ backgroundColor: '#FEFEFE', borderColor: '#74654F' }}>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-10" style={{ backgroundColor: '#ECD8B6' }}>
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-80 transition-colors"
                      style={{ color: '#1F1E1D' }}
                      onClick={() => requestSort('invoiceNumber')}
                    >
                      Número <SortIndicator column="invoiceNumber" />
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-80 transition-colors"
                      style={{ color: '#1F1E1D' }}
                      onClick={() => requestSort('date')}
                    >
                      Fecha <SortIndicator column="date" />
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-80 transition-colors"
                      style={{ color: '#1F1E1D' }}
                      onClick={() => requestSort('soldTo')}
                    >
                      Cliente <SortIndicator column="soldTo" />
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-80 transition-colors"
                      style={{ color: '#1F1E1D' }}
                      onClick={() => requestSort('itemsCount')}
                    >
                      Items <SortIndicator column="itemsCount" />
                    </th>
                    <th
                      className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-80 transition-colors"
                      style={{ color: '#1F1E1D' }}
                      onClick={() => requestSort('subtotal')}
                    >
                      Subtotal <SortIndicator column="subtotal" />
                    </th>
                    <th
                      className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-80 transition-colors"
                      style={{ color: '#1F1E1D' }}
                      onClick={() => requestSort('dispatchFee')}
                    >
                      Dispatch Fee <SortIndicator column="dispatchFee" />
                    </th>
                    <th
                      className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-80 transition-colors"
                      style={{ color: '#1F1E1D' }}
                      onClick={() => requestSort('total')}
                    >
                      Total <SortIndicator column="total" />
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: '#1F1E1D' }}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ backgroundColor: '#FEFEFE', borderColor: '#74654F' }}>
                  {processedInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center" style={{ color: '#74654F' }}>
                        No se encontraron facturas que coincidan con la búsqueda.
                      </td>
                    </tr>
                  ) : (
                    processedInvoices.map((invoice) => (
                      <tr key={invoice.id} style={{ backgroundColor: '#FEFEFE' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ECD8B6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FEFEFE'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium" style={{ color: '#1F1E1D' }}>
                            {invoice.invoiceNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm" style={{ color: '#74654F' }}>
                            {formatDate(invoice.date)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm" style={{ color: '#1F1E1D' }}>{invoice.soldTo}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm" style={{ color: '#74654F' }}>
                            {invoice.items.length} item(s)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium" style={{ color: '#1F1E1D' }}>
                            {formatCurrency(Number(invoice.subtotal))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm" style={{ color: '#74654F' }}>
                            {invoice.dispatchFee}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-bold" style={{ color: '#F89E1A' }}>
                            {formatCurrency(Number(invoice.total))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center gap-2">
                            {/* Botón de editar */}
                            <Link
                              href={`/invoices/edit?id=${invoice.id}`}
                              className="transition-colors"
                              style={{ color: '#F89E1A' }}
                              onMouseEnter={(e) => e.currentTarget.style.color = '#F3B85E'}
                              onMouseLeave={(e) => e.currentTarget.style.color = '#F89E1A'}
                              title="Editar factura"
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
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </Link>

                            {/* Botón de eliminar */}
                            <button
                              onClick={() => handleDelete(invoice.id)}
                              disabled={deletingId === invoice.id}
                              className="transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ color: '#74654F' }}
                              onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.color = '#1F1E1D')}
                              onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.color = '#74654F')}
                              title="Eliminar factura"
                            >
                              {deletingId === invoice.id ? (
                                <svg
                                  className="w-5 h-5 animate-spin"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                  />
                                </svg>
                              ) : (
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
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
