export interface IpcApi {
    // Invoices
    getInvoiceNextNumber: () => Promise<{ invoiceNumber: number }>;
    createInvoice: (data: any) => Promise<any>;
    getInvoiceById: (id: number) => Promise<any>;
    updateInvoice: (id: number, data: any) => Promise<any>;
    deleteInvoice: (id: number) => Promise<any>;
    searchInvoices: (params: { q: string; page: number; pageSize: number }) => Promise<{ items: any[]; total: number; page: number; pageSize: number }>;

    // Trucks
    searchTrucks: (params: { q?: string; page?: number; pageSize?: number }) => Promise<{ items: any[]; total: number; page: number; pageSize: number }>;
    getTruck: (id: number) => Promise<any>;
    createTruck: (data: { number: string; description: string; active?: boolean }) => Promise<any>;
    updateTruck: (id: number, data: any) => Promise<any>;
    deleteTruck: (id: number) => Promise<any>;
}

declare global {
    interface Window {
        api: IpcApi;
    }
}
