import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('crmApi', {
  getCustomers: () => ipcRenderer.invoke('crm:get-customers'),
  saveCustomer: (customer: unknown) => ipcRenderer.invoke('crm:save-customer', customer),
  getProducts: () => ipcRenderer.invoke('crm:get-products'),
  addProduct: (product: unknown) => ipcRenderer.invoke('crm:add-product', product),
  getNotes: (customerId: string) => ipcRenderer.invoke('crm:get-notes', customerId),
  saveNote: (note: unknown) => ipcRenderer.invoke('crm:save-note', note),
  getSales: (customerId: string) => ipcRenderer.invoke('crm:get-sales', customerId),
  addSale: (sale: unknown) => ipcRenderer.invoke('crm:add-sale', sale),
  getInvoices: (customerId: string) => ipcRenderer.invoke('crm:get-invoices', customerId),
  addInvoice: (invoice: unknown) => ipcRenderer.invoke('crm:add-invoice', invoice),
  getSettings: () => ipcRenderer.invoke('crm:get-settings'),
  updateSettings: (settings: Record<string, string>) => ipcRenderer.invoke('crm:update-settings', settings),
  getDailyUsage: () => ipcRenderer.invoke('crm:get-daily-usage'),
  openWhatsapp: () => ipcRenderer.invoke('crm:open-whatsapp'),
  getWhatsappStatus: () => ipcRenderer.invoke('crm:get-whatsapp-status')
});
