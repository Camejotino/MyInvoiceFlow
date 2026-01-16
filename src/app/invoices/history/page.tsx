"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

  /**
   * Carga las facturas desde la API
   */
  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/invoices');
      
      if (!response.ok) {
        throw new Error('Error al cargar facturas');
      }

      const data = await response.json();
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
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al eliminar factura');
      }

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
          <div className="rounded-lg shadow-sm overflow-hidden" style={{ backgroundColor: '#FEFEFE', border: '1px solid #74654F' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: '#ECD8B6' }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#1F1E1D' }}>
                      Número
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#1F1E1D' }}>
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#1F1E1D' }}>
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#1F1E1D' }}>
                      Items
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: '#1F1E1D' }}>
                      Subtotal
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: '#1F1E1D' }}>
                      Dispatch Fee
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: '#1F1E1D' }}>
                      Total
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: '#1F1E1D' }}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ backgroundColor: '#FEFEFE', borderColor: '#74654F' }}>
                  {invoices.map((invoice) => (
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
                          {formatCurrency(Number(invoice.dispatchFee))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-bold" style={{ color: '#F89E1A' }}>
                          {formatCurrency(Number(invoice.total))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
