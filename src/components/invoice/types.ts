/**
 * Tipos de datos para el sistema de facturación
 */

export interface InvoiceRow {
  date: Date | null
  truckNumber: string
  ticketNumber: string
  projectName: string
  quantity: number
  rate: number
  total: number
}

export interface Invoice {
  date: Date
  soldTo: string
  invoiceNumber: string
  items: InvoiceRow[]
  subtotal: number
  dispatchFee: number
  total: number
}
