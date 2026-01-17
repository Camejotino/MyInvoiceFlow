import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export async function generateStaticParams() {
  const trucks = await prisma.truck.findMany({
    select: { id: true },
  });

  return trucks.map((truck) => ({
    id: truck.id.toString(),
  }));
}

export default function Page({ params }: { params: { id: string } }) {
  // Redirige a la página basada en query para compatibilidad con output: 'export'
  redirect(`/trucks/edit?id=${encodeURIComponent(params.id)}`);
}
