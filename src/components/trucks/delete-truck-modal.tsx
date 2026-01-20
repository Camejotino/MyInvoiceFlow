"use client";
import { useState } from 'react';
import type { Truck } from '@prisma/client';
import { apiClient } from '@/lib/api-client';

interface DeleteTruckModalProps {
    truck: Truck;
    onClose: () => void;
    onDeleted: () => void;
}

export default function DeleteTruckModal({ truck, onClose, onDeleted }: DeleteTruckModalProps) {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function onDelete() {
        setError(null);
        setLoading(true);
        try {
            try {
                await apiClient.deleteTruck(truck.id);
                onDeleted();
                onClose();
            } catch (err: any) {
                setError(err.message || 'Error de conexión');
            } finally {
                setLoading(false);
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
            <div className="p-6 max-w-sm bg-white rounded-lg shadow-xl relative">
                <h2 className="text-xl font-semibold mb-4 text-red-600">Eliminar Camión</h2>
                <p className="mb-4 text-gray-700">
                    ¿Estás seguro de que deseas eliminar el camión <b>{truck.number}</b>?
                    Esta acción no se puede deshacer.
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 border rounded hover:bg-gray-100 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onDelete}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Eliminando...' : 'Eliminar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
