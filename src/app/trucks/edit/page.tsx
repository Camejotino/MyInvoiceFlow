"use client";
import EditForm, { type TruckDTO } from '@/app/trucks/EditForm';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [initial, setInitial] = useState<TruckDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = searchParams?.get('id') ?? '';
    const id = Number(raw);
    
    if (!Number.isFinite(id) || id <= 0) {
      router.push('/trucks');
      return;
    }

    async function fetchTruck() {
      try {
        setLoading(true);
        const res = await fetch(`/api/trucks/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            router.push('/trucks');
            return;
          }
          setError('Error al cargar el camión');
          return;
        }
        const tr = await res.json();
        setInitial({
          id: tr.id,
          number: tr.number,
          description: tr.description,
          active: tr.active,
        });
      } catch (err) {
        setError('Error al cargar el camión');
      } finally {
        setLoading(false);
      }
    }

    fetchTruck();
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="p-6" style={{ backgroundColor: '#FEFEFE', minHeight: '100vh' }}>
        <div style={{ color: '#74654F' }}>Cargando...</div>
      </div>
    );
  }

  if (error || !initial) {
    return (
      <div className="p-6" style={{ backgroundColor: '#FEFEFE', minHeight: '100vh' }}>
        <div style={{ color: '#74654F' }}>{error || 'Camión no encontrado'}</div>
      </div>
    );
  }

  return <EditForm initial={initial} />;
}
