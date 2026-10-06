import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  initializeDb,
  getCustomers,
  saveCustomer,
  getProducts,
  addProduct,
  getNotes,
  saveNote,
  getSales,
  addSale,
  getInvoices,
  addInvoice,
  getSettings,
  updateSettings,
  getDailyUsage
} from './db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let whatsappWindow: BrowserWindow | null = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1420,
    height: 980,
    minWidth: 1100,
    minHeight: 760,
    backgroundColor: '#121b22',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const isDev = !app.isPackaged;
  if (isDev) {
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

async function getWhatsAppStatus() {
  if (!whatsappWindow) {
    return { status: 'disconnected', connected: false };
  }

  try {
    const result = await whatsappWindow.webContents.executeJavaScript(`
      (() => {
        const url = location.href;
        const isLoggedIn = !!document.querySelector('canvas[aria-label="WhatsApp"]') || url.includes('/chat');
        const qrVisible = !!document.querySelector('canvas[aria-label="Scan me!"]') || url.includes('/qr');
        const hasChat = url.includes('/chat');

        if (hasChat || isLoggedIn) {
          return { status: 'connected', connected: true };
        }

        if (qrVisible || url.includes('/app')) {
          return { status: 'qr-required', connected: false };
        }

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
  ipcMain.handle('crm:save-customer', (_, customer) => saveCustomer(customer));
  ipcMain.handle('crm:get-products', () => getProducts());
  ipcMain.handle('crm:add-product', (_, product) => addProduct(product));
  ipcMain.handle('crm:get-notes', (_, customerId) => getNotes(customerId));
  ipcMain.handle('crm:save-note', (_, note) => saveNote(note));
  ipcMain.handle('crm:get-sales', (_, customerId) => getSales(customerId));
  ipcMain.handle('crm:add-sale', (_, sale) => addSale(sale));
  ipcMain.handle('crm:get-invoices', (_, customerId) => getInvoices(customerId));
  ipcMain.handle('crm:add-invoice', (_, invoice) => addInvoice(invoice));
  ipcMain.handle('crm:get-settings', () => getSettings());
  ipcMain.handle('crm:update-settings', (_, settings) => updateSettings(settings));
  ipcMain.handle('crm:get-daily-usage', () => getDailyUsage());
  ipcMain.handle('crm:open-whatsapp', () => openWhatsappWindow());
  ipcMain.handle('crm:get-whatsapp-status', () => getWhatsAppStatus());

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
