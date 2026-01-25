import { IpcApi } from '@/types/global';

class ApiClient implements IpcApi {
    private get isElectron(): boolean {
        return typeof window !== 'undefined' && 'api' in window;
    }

    // Invoices
    async getInvoiceNextNumber(): Promise<{ invoiceNumber: number }> {
        if (this.isElectron) {
            return window.api.getInvoiceNextNumber();
        }
        const res = await fetch('/api/invoices/next-number');
        if (!res.ok) throw new Error('Failed to fetch next invoice number');
        return res.json();
    }

    async createInvoice(data: any): Promise<any> {
        if (this.isElectron) {
            return window.api.createInvoice(data);
        }
        const res = await fetch('/api/invoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to create invoice');
        }
        return res.json();
    }

    async getInvoiceById(id: number): Promise<any> {
        if (this.isElectron) {
            return window.api.getInvoiceById(id);
        }
        const res = await fetch(`/api/invoices/${id}`);
        if (!res.ok) throw new Error('Failed to get invoice');
        return res.json();
    }

    async updateInvoice(id: number, data: any): Promise<any> {
        if (this.isElectron) {
            return window.api.updateInvoice(id, data);
        }
        const res = await fetch(`/api/invoices/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to update invoice');
        }
        return res.json();
    }

    async deleteInvoice(id: number): Promise<any> {
        if (this.isElectron) {
            return window.api.deleteInvoice(id);
        }
        const res = await fetch(`/api/invoices/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete invoice');
        return res.json();
    }

    async searchInvoices(params: { q: string; page: number; pageSize: number }): Promise<{ items: any[]; total: number; page: number; pageSize: number }> {
        if (this.isElectron) {
            return window.api.searchInvoices(params);
        }
        const searchParams = new URLSearchParams({
            q: params.q,
            page: params.page.toString(),
            pageSize: params.pageSize.toString(),
        });
        const res = await fetch(`/api/invoices?${searchParams}`);
        if (!res.ok) throw new Error('Failed to search invoices');
        return res.json();
    }

    // Trucks
    async searchTrucks(params: { q?: string; page?: number; pageSize?: number }): Promise<{ items: any[]; total: number; page: number; pageSize: number }> {
        if (this.isElectron) {
            return window.api.searchTrucks(params);
        }
        const searchParams = new URLSearchParams();
        if (params.q) searchParams.append('q', params.q);
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());

        const res = await fetch(`/api/trucks?${searchParams}`);
        if (!res.ok) throw new Error('Failed to search trucks');
        return res.json();
    }

    async getTruck(id: number): Promise<any> {
        if (this.isElectron) {
            return window.api.getTruck(id);
        }
        const res = await fetch(`/api/trucks/${id}`);
        if (!res.ok) throw new Error('Failed to get truck');
        return res.json();
    }

    async createTruck(data: { number: string; description: string; active?: boolean }): Promise<any> {
        if (this.isElectron) {
            return window.api.createTruck(data);
        }
        const res = await fetch('/api/trucks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to create truck');
        }
        return res.json();
    }

    async updateTruck(id: number, data: any): Promise<any> {
        if (this.isElectron) {
            return window.api.updateTruck(id, data);
        }
        const res = await fetch(`/api/trucks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update truck');
        return res.json();
    }

    async deleteTruck(id: number): Promise<any> {
        if (this.isElectron) {
            return window.api.deleteTruck(id);
        }
        const res = await fetch(`/api/trucks/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to delete truck');
        }
        return res.json();
    }
}

export const apiClient = new ApiClient();
