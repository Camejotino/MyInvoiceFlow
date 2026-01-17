import { prisma } from '@/lib/prisma';

export async function generateStaticParams() {
  const trucks = await prisma.truck.findMany({
    select: { id: true },
  });

  return trucks.map((truck) => ({
    id: truck.id.toString(),
  }));
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
