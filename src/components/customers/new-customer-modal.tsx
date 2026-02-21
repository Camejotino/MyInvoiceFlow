"use client";
import { useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface Customer {
    id: number;
    name: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    active: boolean;
}

interface NewCustomerModalProps {
    onClose: () => void;
    onSave: () => void;
    customer?: Customer | null;
}

export default function NewCustomerModal({ onClose, onSave, customer }: NewCustomerModalProps) {
    const [name, setName] = useState(customer?.name || '');
    const [address, setAddress] = useState(customer?.address || '');
    const [phone, setPhone] = useState(customer?.phone || '');
    const [email, setEmail] = useState(customer?.email || '');
    const [active, setActive] = useState(customer ? customer.active : true);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const isEditing = !!customer;

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            if (isEditing && customer) {
                await apiClient.updateCustomer(customer.id, { name, address, phone, email, active });
            } else {
                await apiClient.createCustomer({ name, address, phone, email, active });
            }
            onSave();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error al guardar');
        } finally {
            setLoading(false);
        }
    }

    const inputClass = "w-full border rounded px-3 py-2 focus:outline-none";
    const inputStyle = { borderColor: '#74654F', borderWidth: '1px' };
    const focusHandlers = {
        onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
            e.currentTarget.style.borderColor = '#F89E1A';
            e.currentTarget.style.boxShadow = '0 0 0 2px rgba(248, 158, 26, 0.2)';
        },
        onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
            e.currentTarget.style.borderColor = '#74654F';
            e.currentTarget.style.boxShadow = 'none';
        },
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
            <div className="p-6 max-w-xl w-full mx-4 bg-white rounded-lg shadow-xl">
                <h1 className="text-xl font-semibold mb-4" style={{ color: '#1F1E1D' }}>
                    {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
                </h1>
                {error && <div className="mb-3 text-red-600">{error}</div>}
                <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: '#FEFEFE', border: '1px solid #74654F' }}>
                    <form onSubmit={onSubmit} className="space-y-3">
                        <div>
                            <label className="block text-sm mb-1" style={{ color: '#1F1E1D' }}>Nombre *</label>
                            <input
                                className={inputClass}
                                style={inputStyle}
                                {...focusHandlers}
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                                placeholder="Nombre del cliente"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1" style={{ color: '#1F1E1D' }}>Dirección</label>
                            <input
                                className={inputClass}
                                style={inputStyle}
                                {...focusHandlers}
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                placeholder="Dirección"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1" style={{ color: '#1F1E1D' }}>Teléfono</label>
                            <input
                                className={inputClass}
                                style={inputStyle}
                                {...focusHandlers}
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="Teléfono"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1" style={{ color: '#1F1E1D' }}>Email</label>
                            <input
                                type="email"
                                className={inputClass}
                                style={inputStyle}
                                {...focusHandlers}
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="correo@ejemplo.com"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                id="customer-active"
                                type="checkbox"
                                checked={active}
                                onChange={e => setActive(e.target.checked)}
                                style={{ accentColor: '#F89E1A' }}
                            />
                            <label htmlFor="customer-active" style={{ color: '#1F1E1D' }}>Activo</label>
                        </div>
                        <div className="flex gap-2">
                            <button
                                disabled={loading}
                                className="px-3 py-2 text-white rounded transition-colors duration-200"
                                style={{ backgroundColor: '#F89E1A' }}
                                onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#F3B85E')}
                                onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#F89E1A')}
                                type="submit"
                            >
                                {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Guardar')}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-3 py-2 border rounded transition-colors duration-200"
                                style={{ borderColor: '#74654F', color: '#74654F', backgroundColor: '#FEFEFE' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ECD8B6'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FEFEFE'}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
