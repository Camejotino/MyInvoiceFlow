import './globals.css'
import type { Metadata } from 'next'
import { ToastProvider } from '@/context/ToastContext'

export const metadata: Metadata = {
  title: 'MyInvoiceFlow',
  description: 'Offline invoicing desktop app',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <base href="./" />
      </head>
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
