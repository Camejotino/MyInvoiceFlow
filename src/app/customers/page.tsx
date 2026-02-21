"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import NewCustomerModal from '@/components/customers/new-customer-modal';
import DeleteCustomerModal from '@/components/customers/delete-customer-modal';
import { apiClient } from '@/lib/api-client';

interface Customer {
    id: number;
    name: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    active: boolean;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
    const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCustomers();
    }, []);

    async function fetchCustomers() {
        try {
            const data = await apiClient.searchCustomers({});
            setCustomers(data.items || []);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleSave = () => {
        fetchCustomers();
        setCustomerToEdit(null);
    };

    const handleDeleted = () => {
        fetchCustomers();
        setCustomerToDelete(null);
    };

    const openEditModal = (customer: Customer) => {
        setCustomerToEdit(customer);
        setShowModal(true);
    };

    const openCreateModal = () => {
        setCustomerToEdit(null);
        setShowModal(true);
    };

    return (
        <div className="p-6 space-y-4" style={{ backgroundColor: '#FEFEFE', minHeight: '100vh' }}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={openCreateModal}
                        className="px-3 py-2 text-white rounded hover-primary"
                        style={{ backgroundColor: '#F89E1A' }}
                    >
                        Nuevo
                    </button>
                    <h1 className="text-xl font-semibold" style={{ color: '#1F1E1D' }}>Clientes</h1>
                </div>
                <Link
                    href="/"
                    className="px-4 py-2 text-white rounded-lg hover-primary-dark"
                    style={{ backgroundColor: '#74654F' }}
                >
                    Volver a Inicio
                </Link>
            </div>

            <div className="rounded-lg shadow-sm overflow-hidden" style={{ backgroundColor: '#FEFEFE', border: '1px solid #74654F' }}>
                <table className="w-full text-sm">
                    <thead style={{ backgroundColor: '#ECD8B6' }}>
                        <tr className="text-left border-b" style={{ borderColor: '#74654F' }}>
                            <th className="py-2 px-4" style={{ color: '#1F1E1D' }}>Nombre</th>
                            <th className="py-2 px-4" style={{ color: '#1F1E1D' }}>Dirección</th>
                            <th className="py-2 px-4" style={{ color: '#1F1E1D' }}>Teléfono</th>
                            <th className="py-2 px-4" style={{ color: '#1F1E1D' }}>Email</th>
                            <th className="py-2 px-4" style={{ color: '#1F1E1D' }}>Activo</th>
                            <th className="py-2 px-4" style={{ color: '#1F1E1D' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="text-center py-4">Cargando...</td>
                            </tr>
                        ) : customers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-4" style={{ color: '#74654F' }}>No hay clientes</td>
                            </tr>
                        ) : (
                            customers.map((c: Customer) => (
                                <tr key={c.id} className="border-b hover-row" style={{ borderColor: '#ECD8B6', backgroundColor: '#FEFEFE' }}>
                                    <td className="py-2 px-4 font-medium" style={{ color: '#1F1E1D' }}>{c.name}</td>
                                    <td className="py-2 px-4" style={{ color: '#74654F' }}>{c.address || '—'}</td>
                                    <td className="py-2 px-4" style={{ color: '#74654F' }}>{c.phone || '—'}</td>
                                    <td className="py-2 px-4" style={{ color: '#74654F' }}>{c.email || '—'}</td>
                                    <td className="py-2 px-4" style={{ color: '#74654F' }}>{c.active ? 'Sí' : 'No'}</td>
                                    <td className="py-2 px-4 flex gap-3">
                                        <button
                                            onClick={() => openEditModal(c)}
                                            className="hover:text-blue-600 transition-colors"
                                            style={{ color: '#74654F' }}
                                            title="Editar"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setCustomerToDelete(c)}
                                            className="hover:text-red-600 transition-colors"
                                            style={{ color: '#F89E1A' }}
                                            title="Eliminar"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <NewCustomerModal
                    onClose={() => {
                        setShowModal(false);
                        setCustomerToEdit(null);
                    }}
                    onSave={handleSave}
                    customer={customerToEdit}
                />
            )}
            {customerToDelete && (
                <DeleteCustomerModal
                    customer={customerToDelete}
                    onClose={() => setCustomerToDelete(null)}
                    onDeleted={handleDeleted}
                />
            )}
        </div>
    );
}
