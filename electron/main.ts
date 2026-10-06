import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { initializeDb, getCustomers, saveCustomer, getProducts, addProduct, getNotes, saveNote, getSales, addSale, getInvoices, addInvoice, getSettings, updateSettings, getDailyUsage } from './db';

let mainWindow: BrowserWindow | null = null;
let whatsappWindow: BrowserWindow | null = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1420,
    height: 980,
    minWidth: 1100,
    minHeight: 760,
    backgroundColor: '#101b20',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function openWhatsappWindow() {
  if (whatsappWindow) {
    whatsappWindow.show();
    return;
  }

  whatsappWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    title: 'WhatsApp Web',
    backgroundColor: '#111b21',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true
    }
  });

  whatsappWindow.loadURL('https://web.whatsapp.com');
  whatsappWindow.on('closed', () => {
    whatsappWindow = null;
  });
}

async function getWhatsappStatus() {
  if (!whatsappWindow) {
    return { status: 'disconnected', connected: false };
  }

  try {
    const result = await whatsappWindow.webContents.executeJavaScript(`
      (() => {
        const url = location.href;
        const loggedIn = url.includes('/chat') || !!document.querySelector('[data-testid="conversation-panel"]');
        const qrVisible = !!document.querySelector('canvas[aria-label="Scan me!"]') || url.includes('/app') || url.includes('/qr');

        if (loggedIn) return { status: 'connected', connected: true };
        if (qrVisible) return { status: 'qr-required', connected: false };
        return { status: 'disconnected', connected: false };
      })()
    `);
    return result || { status: 'disconnected', connected: false };
  } catch {
    return { status: 'disconnected', connected: false };
  }
}

app.whenReady().then(() => {
  initializeDb();
  createMainWindow();

  ipcMain.handle('crm:get-customers', () => getCustomers());
  ipcMain.handle('crm:save-customer', (_event, customer) => saveCustomer(customer));
  ipcMain.handle('crm:get-products', () => getProducts());
  ipcMain.handle('crm:add-product', (_event, product) => addProduct(product));
  ipcMain.handle('crm:get-notes', (_event, customerId) => getNotes(customerId));
  ipcMain.handle('crm:save-note', (_event, note) => saveNote(note));
  ipcMain.handle('crm:get-sales', (_event, customerId) => getSales(customerId));
  ipcMain.handle('crm:add-sale', (_event, sale) => addSale(sale));
  ipcMain.handle('crm:get-invoices', (_event, customerId) => getInvoices(customerId));
  ipcMain.handle('crm:add-invoice', (_event, invoice) => addInvoice(invoice));
  ipcMain.handle('crm:get-settings', () => getSettings());
  ipcMain.handle('crm:update-settings', (_event, settings) => updateSettings(settings));
  ipcMain.handle('crm:get-daily-usage', () => getDailyUsage());
  ipcMain.handle('crm:open-whatsapp', () => openWhatsappWindow());
  ipcMain.handle('crm:get-whatsapp-status', () => getWhatsappStatus());

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
