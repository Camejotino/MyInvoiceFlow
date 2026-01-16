import { redirect } from 'next/navigation';

export function generateStaticParams() {
  return [] as Array<{ id: string }>;
}

export default function Page({ params }: { params: { id: string } }) {
  // Redirige a la página basada en query para compatibilidad con output: 'export'
  redirect(`/trucks/edit?id=${encodeURIComponent(params.id)}`);
}
