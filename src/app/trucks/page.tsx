"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Truck } from '@prisma/client';
import NewTruckModal from '@/components/trucks/new-truck-modal';
import DeleteTruckModal from '@/components/trucks/delete-truck-modal';
import { apiClient } from '@/lib/api-client';

export default function TrucksPage() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [truckToDelete, setTruckToDelete] = useState<Truck | null>(null);
  const [truckToEdit, setTruckToEdit] = useState<Truck | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrucks();
  }, []);

  async function fetchTrucks() {
    try {
      const data = await apiClient.searchTrucks({});
      setTrucks(data.items || []);
    } catch (error) {
      console.error('Error fetching trucks:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = () => {
    fetchTrucks(); // Refresh the truck list
    setTruckToEdit(null);
  };

  const handleDeleted = () => {
    fetchTrucks(); // Refresh after delete
    setTruckToDelete(null);
  };

  const openEditModal = (truck: Truck) => {
    setTruckToEdit(truck);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setTruckToEdit(null);
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
                <td colSpan={4} className="text-center py-4">Cargando...</td>
              </tr>
            ) : trucks.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4" style={{ color: '#74654F' }}>No hay camiones</td>
              </tr>
            ) : (
              trucks.map((t: Truck) => (
                <tr key={t.id} className="border-b hover-row" style={{ borderColor: '#ECD8B6', backgroundColor: '#FEFEFE' }}>
                  <td className="py-2 px-4" style={{ color: '#1F1E1D' }}>{t.number}</td>
                  <td className="py-2 px-4" style={{ color: '#74654F' }}>{t.description}</td>
                  <td className="py-2 px-4" style={{ color: '#74654F' }}>{t.active ? 'Sí' : 'No'}</td>
                  <td className="py-2 px-4 flex gap-3">
                    <button
                      onClick={() => openEditModal(t)}
                      className="hover:text-blue-600 transition-colors"
                      style={{ color: '#74654F' }}
                      title="Editar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setTruckToDelete(t)}
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
        <NewTruckModal
          onClose={() => {
            setShowModal(false);
            setTruckToEdit(null);
          }}
          onSave={handleSave}
          truck={truckToEdit}
        />
      )}
      {truckToDelete && (
        <DeleteTruckModal
          truck={truckToDelete}
          onClose={() => setTruckToDelete(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
