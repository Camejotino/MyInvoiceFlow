import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MyInvoiceFlow',
  description: 'Offline invoicing desktop app',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
