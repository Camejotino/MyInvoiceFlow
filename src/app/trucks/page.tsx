"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Truck } from '@prisma/client';
import NewTruckModal from '@/components/trucks/new-truck-modal';

export default function TrucksPage() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrucks();
  }, []);

  async function fetchTrucks() {
    try {
      const res = await fetch('/api/trucks');
      if (res.ok) {
        const data = await res.json();
        setTrucks(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching trucks:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = () => {
    fetchTrucks(); // Refresh the truck list
  };

  return (
    <div className="p-6 space-y-4" style={{ backgroundColor: '#FEFEFE', minHeight: '100vh' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowModal(true)}
            className="px-3 py-2 text-white rounded hover-primary"
            style={{ backgroundColor: '#F89E1A' }}
          >
            Nuevo
          </button>
          <h1 className="text-xl font-semibold" style={{ color: '#1F1E1D' }}>Camiones</h1>
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
              <th className="py-2 px-4" style={{ color: '#1F1E1D' }}>Número</th>
              <th className="py-2 px-4" style={{ color: '#1F1E1D' }}>Descripción</th>
              <th className="py-2 px-4" style={{ color: '#1F1E1D' }}>Activo</th>
              <th className="py-2 px-4" style={{ color: '#1F1E1D' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-4">Cargando...</td>
              </tr>
            ) : trucks.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4" style={{ color: '#74654F' }}>No hay camiones</td>
              </tr>
            ) : (
              trucks.map((t: Truck) => (
                <tr key={t.id} className="border-b hover-row" style={{ borderColor: '#ECD8B6', backgroundColor: '#FEFEFE' }}>
                  <td className="py-2 px-4" style={{ color: '#1F1E1D' }}>{t.number}</td>
                  <td className="py-2 px-4" style={{ color: '#74654F' }}>{t.description}</td>
                  <td className="py-2 px-4" style={{ color: '#74654F' }}>{t.active ? 'Sí' : 'No'}</td>
                  <td className="py-2 px-4">
                    <Link 
                      className="hover:underline hover-text-primary transition-colors" 
                      style={{ color: '#F89E1A' }}
                      href={`/trucks/edit?id=${t.id}`}
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showModal && (
        <NewTruckModal 
          onClose={() => setShowModal(false)} 
          onSave={handleSave}
        />
      )}
    </div>
  );
}
