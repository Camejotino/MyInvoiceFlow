"use client";

import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FEFEFE' }}>
      {/* Navbar */}
      <nav className="bg-neutral-white shadow-md" style={{ backgroundColor: '#FEFEFE' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold" style={{ color: '#1F1E1D' }}>MyInvoiceFlow</h1>
            </div>
            
            {/* Icono en la parte superior derecha */}
            <div className="flex items-center space-x-4">
              <Image 
                src="/K.webp" 
                alt="Logo" 
                width={64} 
                height={64}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="flex-grow flex items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-2xl">
          <div className="space-y-4">
            <div className="flex justify-center mb-4">
              <Image 
                src="/K.webp" 
                alt="Logo" 
                width={320} 
                height={320}
                className="object-contain"
              />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold" style={{ color: '#1F1E1D' }}>
              Sistema de Facturación
            </h2>
            <p className="text-lg" style={{ color: '#74654F' }}>
              Gestiona tus facturas y rastras de manera eficiente
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/invoices/create"
              className="px-8 py-4 text-neutral-white rounded-lg font-semibold text-lg shadow-lg transition-colors duration-200 transform hover:scale-105"
              style={{ backgroundColor: '#F89E1A' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3B85E'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F89E1A'}
            >
              Crear Factura
            </Link>
            
            <Link
              href="/trucks"
              className="px-8 py-4 bg-neutral-white rounded-lg font-semibold text-lg shadow-lg transition-colors duration-200 transform hover:scale-105 border-2 hover-primary-light"
              style={{ color: '#F89E1A', backgroundColor: '#FEFEFE', borderColor: '#F89E1A' }}
            >
              Administrar Rastras
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-white py-4" style={{ backgroundColor: '#FEFEFE', borderTop: '1px solid #74654F' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm" style={{ color: '#74654F' }}>
            <p>&copy; {new Date().getFullYear()} MyInvoiceFlow. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
