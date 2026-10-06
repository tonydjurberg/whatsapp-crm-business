import Database from 'better-sqlite3';
import path from 'node:path';
import os from 'node:os';

const dbDir = path.join(os.homedir(), 'whatsapp-crm-business-data');
const dbPath = path.join(dbDir, 'crm.db');

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    address TEXT,
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    cpf TEXT,
    company_name TEXT,
    notes TEXT,
    status TEXT,
    created_at TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    customer_id TEXT,
    content TEXT,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT,
    category TEXT,
    description TEXT,
    price REAL,
    stock INTEGER,
    company_name TEXT,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    customer_id TEXT,
    product_id TEXT,
    quantity INTEGER,
    unit_price REAL,
    total REAL,
    notes TEXT,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    customer_id TEXT,
    sale_id TEXT,
    template_id TEXT,
    invoice_number TEXT,
    total REAL,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS daily_usage (
    day_key TEXT PRIMARY KEY,
    count INTEGER DEFAULT 0
  );
`);

export function initializeDb() {
  return db;
}

export function getCustomers() {
  return db.prepare('SELECT * FROM customers ORDER BY created_at DESC').all();
}

export function saveCustomer(customer: any) {
  const exists = db.prepare('SELECT 1 FROM customers WHERE id = ?').get(customer.id);
  if (exists) {
    db.prepare(`
      UPDATE customers
      SET first_name = ?, last_name = ?, address = ?, phone = ?, whatsapp = ?, email = ?, cpf = ?, company_name = ?, notes = ?, status = ?, updated_at = ?
      WHERE id = ?
    `).run(
      customer.first_name ?? '',
      customer.last_name ?? '',
      customer.address ?? '',
      customer.phone ?? '',
      customer.whatsapp ?? '',
      customer.email ?? '',
      customer.cpf ?? '',
      customer.company_name ?? '',
      customer.notes ?? '',
      customer.status ?? 'active',
      new Date().toISOString(),
      customer.id
    );
    return db.prepare('SELECT * FROM customers WHERE id = ?').get(customer.id);
  }

  db.prepare(`
    INSERT INTO customers (id, first_name, last_name, address, phone, whatsapp, email, cpf, company_name, notes, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    customer.id,
    customer.first_name ?? '',
    customer.last_name ?? '',
    customer.address ?? '',
    customer.phone ?? '',
    customer.whatsapp ?? '',
    customer.email ?? '',
    customer.cpf ?? '',
    customer.company_name ?? '',
    customer.notes ?? '',
    customer.status ?? 'active',
    new Date().toISOString(),
    new Date().toISOString()
  );

  return db.prepare('SELECT * FROM customers WHERE id = ?').get(customer.id);
}

export function getProducts() {
  return db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
}

export function addProduct(product: any) {
  db.prepare(`
    INSERT INTO products (id, name, category, description, price, stock, company_name, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    product.id,
    product.name ?? '',
    product.category ?? 'general',
    product.description ?? '',
    product.price ?? 0,
    product.stock ?? 0,
    product.company_name ?? '',
    new Date().toISOString()
  );
  return getProducts();
}

export function getNotes(customerId: string) {
  return db.prepare('SELECT * FROM notes WHERE customer_id = ? ORDER BY created_at DESC').all(customerId);
}

export function saveNote(note: any) {
  db.prepare(`
    INSERT INTO notes (id, customer_id, content, created_at)
    VALUES (?, ?, ?, ?)
  `).run(note.id, note.customer_id, note.content, new Date().toISOString());
  return getNotes(note.customer_id);
}

export function getSales(customerId: string) {
  return db.prepare('SELECT * FROM sales WHERE customer_id = ? ORDER BY created_at DESC').all(customerId);
}

export function addSale(sale: any) {
  db.prepare(`
    INSERT INTO sales (id, customer_id, product_id, quantity, unit_price, total, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    sale.id,
    sale.customer_id,
    sale.product_id ?? '',
    sale.quantity ?? 1,
    sale.unit_price ?? 0,
    sale.total ?? 0,
    sale.notes ?? '',
    new Date().toISOString()
  );
  return getSales(sale.customer_id);
}

export function getInvoices(customerId: string) {
  return db.prepare('SELECT * FROM invoices WHERE customer_id = ? ORDER BY created_at DESC').all(customerId);
}

export function addInvoice(invoice: any) {
  db.prepare(`
    INSERT INTO invoices (id, customer_id, sale_id, template_id, invoice_number, total, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    invoice.id,
    invoice.customer_id,
    invoice.sale_id ?? '',
    invoice.template_id ?? 'basic',
    invoice.invoice_number ?? 'INV-0001',
    invoice.total ?? 0,
    new Date().toISOString()
  );
  return getInvoices(invoice.customer_id);
}

export function getSettings() {
  return Object.fromEntries(
    db.prepare('SELECT key, value FROM settings').all().map((row: any) => [row.key, row.value])
  );
}

export function updateSettings(settings: Record<string, string>) {
  const stmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
  for (const [key, value] of Object.entries(settings)) {
    stmt.run(key, String(value));
  }
  return getSettings();
}

export function getDailyUsage() {
  const today = new Date().toISOString().slice(0, 10);
  const row = db.prepare('SELECT count FROM daily_usage WHERE day_key = ?').get(today);
  return { day: today, count: row?.count ?? 0 };
}

export function incrementDailyUsage() {
  const today = new Date().toISOString().slice(0, 10);
  const row = db.prepare('SELECT count FROM daily_usage WHERE day_key = ?').get(today);
  const nextCount = (row?.count ?? 0) + 1;
  db.prepare(`
    INSERT INTO daily_usage (day_key, count) VALUES (?, ?) ON CONFLICT(day_key) DO UPDATE SET count = excluded.count
  `).run(today, nextCount);
  return nextCount;
}

export { db };
