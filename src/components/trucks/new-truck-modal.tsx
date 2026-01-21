"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Truck } from '@prisma/client';
import { apiClient } from '@/lib/api-client';

interface NewTruckModalProps {
  onClose: () => void;
  onSave: () => void;
  truck?: Truck | null;
}

export default function NewTruckModal({ onClose, onSave, truck }: NewTruckModalProps) {
  const [number, setNumber] = useState(truck?.number || '');
  const [description, setDescription] = useState(truck?.description || '');
  const [active, setActive] = useState(truck ? truck.active : true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEditing = !!truck;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isEditing && truck) {
        await apiClient.updateTruck(truck.id, { number, description, active });
      } else {
        await apiClient.createTruck({ number, description, active });
      }
      onSave(); // Call onSave to refresh the truck list
      onClose(); // Close the modal
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div className="p-6 max-w-xl w-full mx-4 bg-white rounded-lg shadow-xl">
        <h1 className="text-xl font-semibold mb-4" style={{ color: '#1F1E1D' }}>
          {isEditing ? 'Editar Camión' : 'Nuevo Camión'}
        </h1>
        {error && <div className="mb-3 text-red-600">{error}</div>}
        <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: '#FEFEFE', border: '1px solid #74654F' }}>
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="block text-sm mb-1" style={{ color: '#1F1E1D' }}>Número</label>
              <input
                className="w-full border rounded px-3 py-2 focus:outline-none"
                style={{ borderColor: '#74654F', borderWidth: '1px' }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#F89E1A';
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(248, 158, 26, 0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#74654F';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                value={number}
                onChange={e => setNumber(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: '#1F1E1D' }}>Descripción</label>
              <input
                className="w-full border rounded px-3 py-2 focus:outline-none"
                style={{ borderColor: '#74654F', borderWidth: '1px' }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#F89E1A';
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(248, 158, 26, 0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#74654F';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <input id="active" type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} style={{ accentColor: '#F89E1A' }} />
              <label htmlFor="active" style={{ color: '#1F1E1D' }}>Activo</label>
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
