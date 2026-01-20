import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
    // Invoices
    getInvoiceNextNumber: () => ipcRenderer.invoke('invoices:next-number'),
    createInvoice: (data: any) => ipcRenderer.invoke('invoices:create', data),
    deleteInvoice: (id: number) => ipcRenderer.invoke('invoices:delete', id),
    searchInvoices: (params: any) => ipcRenderer.invoke('invoices:list', params),

    // Trucks
    searchTrucks: (params: any) => ipcRenderer.invoke('trucks:list', params),
    getTruck: (id: number) => ipcRenderer.invoke('trucks:get', id),
    createTruck: (data: any) => ipcRenderer.invoke('trucks:create', data),
    updateTruck: (id: number, data: any) => ipcRenderer.invoke('trucks:update', id, data),
    deleteTruck: (id: number) => ipcRenderer.invoke('trucks:delete', id),
});
