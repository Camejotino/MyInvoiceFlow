"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface NewTruckModalProps {
  onClose: () => void;
  onSave: () => void;
}

export default function NewTruckModal({ onClose, onSave }: NewTruckModalProps) {
  const router = useRouter();
  const [number, setNumber] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/trucks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number, description, active })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Error al crear');
      } else {
        onSave(); // Call onSave to refresh the truck list
        onClose(); // Close the modal
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
      <div className="p-6 max-w-xl bg-white rounded-lg shadow-xl">
        <h1 className="text-xl font-semibold mb-4" style={{ color: '#1F1E1D' }}>Nuevo Camión</h1>
        {error && <div className="mb-3" style={{ color: '#74654F' }}>{error}</div>}
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
              {loading ? 'Guardando...' : 'Guardar'}
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
