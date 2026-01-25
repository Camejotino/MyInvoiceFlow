"use client";

import { Control, useWatch } from 'react-hook-form';
import { useMemo, useState, useEffect } from 'react';
import { Invoice } from './types';
import { apiClient } from '@/lib/api-client';

type Truck = {
    id: number;
    number: string;
    description: string;
    active: boolean;
};

interface TruckTotalsProps {
    control: Control<Invoice>;
}

/**
 * Componente que muestra el total por cada camión (rastra)
 * Agrupa los items por truck number y calcula el total de cada uno
 */
export default function TruckTotals({ control }: TruckTotalsProps) {
    const [trucks, setTrucks] = useState<Truck[]>([]);

    const items = useWatch({
        control,
        name: 'items',
    });

    // Fetch trucks on mount
    useEffect(() => {
        async function fetchTrucks() {
            try {
                const data = await apiClient.searchTrucks({ pageSize: 1000 });
                setTrucks(data.items || []);
            } catch (error) {
                console.error('Error fetching trucks:', error);
            }
        }
        fetchTrucks();
    }, []);

    /**
     * Agrupa los items por truck number y calcula el total de cada camión
     */
    const truckTotals = useMemo(() => {
        if (!items || items.length === 0) return [];

        // Crear un mapa de truck number -> total
        const totalsMap = new Map<string, number>();

        items.forEach((item) => {
            const truckNumber = item.truckNumber?.trim();
            if (!truckNumber) return; // Ignorar items sin truck number

            const quantity = Number(item.quantity) || 0;
            const rate = Number(item.rate) || 0;
            const total = quantity * rate;

            const currentTotal = totalsMap.get(truckNumber) || 0;
            totalsMap.set(truckNumber, currentTotal + total);
        });

        // Convertir el mapa a un array ordenado
        return Array.from(totalsMap.entries())
            .map(([truckNumber, total]) => ({ truckNumber, total }))
            .sort((a, b) => a.truckNumber.localeCompare(b.truckNumber));
    }, [items]);

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

    // No mostrar el componente si no hay trucks
    if (truckTotals.length === 0) {
        return null;
    }

    return (
        <div className="rounded-lg shadow-sm p-6 " style={{ backgroundColor: '#FEFEFE', border: '1px solid #74654F' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#1F1E1D' }}>
                Totales por Camión
            </h3>
            <div className="space-y-2">
                {truckTotals.map(({ truckNumber, total }) => {
                    const truck = trucks.find(t => t.number === truckNumber);
                    const description = truck?.description || '';

                    return (
                        <div
                            key={truckNumber}
                            className="flex justify-between items-center py-2 px-4 rounded-md"
                            style={{ backgroundColor: '#ECD8B6' }}
                        >
                            <span className="text-sm font-medium" style={{ color: '#1F1E1D' }}>
                                Camión {truckNumber} {description ? `- ${description}` : ''}
                            </span>
                            <span className="text-sm font-semibold text-right" style={{ color: '#1F1E1D' }}>
                                {formatCurrency(total)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
