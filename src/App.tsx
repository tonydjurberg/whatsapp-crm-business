import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const api = (window as any).crmApi;

type Customer = {
  id: string;
  first_name: string;
  last_name: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  cpf: string;
  company_name: string;
  notes: string;
  status: string;
};

type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  company_name: string;
};

const defaultCustomer = {
  id: uuidv4(),
  first_name: '',
  last_name: '',
  address: '',
  phone: '',
  whatsapp: '',
  email: '',
  cpf: '',
  company_name: '',
  notes: '',
  status: 'active'
};

export default function App() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [whatsappStatus, setWhatsappStatus] = useState('disconnected');
  const [dailyUsage, setDailyUsage] = useState({ count: 0, day: '' });
  const [customerForm, setCustomerForm] = useState(defaultCustomer);
  const [productForm, setProductForm] = useState({
    id: uuidv4(),
    name: '',
    category: 'service',
    description: '',
    price: 0,
    stock: 0,
    company_name: ''
  });

  async function refreshAll() {
    const list = await api.getCustomers();
    setCustomers(list);
    if (list.length && !selectedCustomerId) {
      setSelectedCustomerId(list[0].id);
    }

    const items = await api.getProducts();
    setProducts(items);

    const usage = await api.getDailyUsage();
    setDailyUsage(usage);

    const whatsapp = await api.getWhatsappStatus();
    setWhatsappStatus(whatsapp.status || 'disconnected');
  }

  useEffect(() => {
    refreshAll();
  }, []);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  async function handleSaveCustomer() {
    const payload = { ...customerForm, id: customerForm.id || uuidv4() };
    await api.saveCustomer(payload);
    setCustomerForm({ ...defaultCustomer, id: uuidv4() });
    await refreshAll();
  }

  async function handleAddProduct() {
    await api.addProduct({ ...productForm, id: productForm.id || uuidv4() });
    setProductForm({
      id: uuidv4(),
      name: '',
      category: 'service',
      description: '',
      price: 0,
      stock: 0,
      company_name: ''
    });
    await refreshAll();
  }

  async function handleOpenWhatsapp() {
    await api.openWhatsapp();
    const status = await api.getWhatsappStatus();
    setWhatsappStatus(status.status || 'disconnected');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-icon">W</div>
          <div>
            <h2>CRM</h2>
            <small>WhatsApp Business</small>
          </div>
        </div>

        <button className="primary-button" onClick={handleOpenWhatsapp}>Open WhatsApp</button>

        <div className="mini-status">
          <span className={`dot ${whatsappStatus}`} />
          <span>{whatsappStatus}</span>
        </div>

        <div className="limit-box">
          <div className="label">Daily messages</div>
          <strong>{dailyUsage.count}/250</strong>
        </div>

        <div className="customer-list">
          {customers.map((customer) => (
            <button
              key={customer.id}
              className={`customer-item ${selectedCustomer?.id === customer.id ? 'active' : ''}`}
              onClick={() => setSelectedCustomerId(customer.id)}
            >
              <div className="avatar">{(customer.first_name || 'C').charAt(0).toUpperCase()}</div>
              <div>
                <strong>{customer.first_name} {customer.last_name}</strong>
                <small>{customer.whatsapp || customer.phone}</small>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <h3>{selectedCustomer ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}` : 'No customer selected'}</h3>
            <small>{selectedCustomer?.company_name || 'Business customer'}</small>
          </div>
          <div className="status-pill">{whatsappStatus}</div>
        </header>

        <section className="content-grid">
          <div className="chat-panel">
            <div className="chat-header">
              <strong>Messages</strong>
              <button className="secondary-button">Send invoice</button>
            </div>
            <div className="chat-box">
              <div className="message incoming">
                <span>Hi, thanks for your order. We can help with more details.</span>
              </div>
              <div className="message outgoing">
                <span>Perfect, I want to see the price for the package.</span>
              </div>
            </div>
            <div className="composer">
              <input type="text" placeholder="Type your message..." />
              <button className="primary-button">Send</button>
            </div>
          </div>

          <div className="right-panel">
            <div className="card-section">
              <h4>Customer details</h4>
              <div className="field-grid">
                <input value={customerForm.first_name} onChange={(e) => setCustomerForm({ ...customerForm, first_name: e.target.value })} placeholder="First name" />
                <input value={customerForm.last_name} onChange={(e) => setCustomerForm({ ...customerForm, last_name: e.target.value })} placeholder="Last name" />
                <input value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} placeholder="Phone" />
                <input value={customerForm.whatsapp} onChange={(e) => setCustomerForm({ ...customerForm, whatsapp: e.target.value })} placeholder="WhatsApp" />
                <input value={customerForm.email} onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} placeholder="Email" />
                <input value={customerForm.cpf} onChange={(e) => setCustomerForm({ ...customerForm, cpf: e.target.value })} placeholder="CPF" />
                <input value={customerForm.company_name} onChange={(e) => setCustomerForm({ ...customerForm, company_name: e.target.value })} placeholder="Company" />
                <input value={customerForm.address} onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })} placeholder="Address" />
              </div>
              <textarea value={customerForm.notes} onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })} placeholder="Notes" />
              <button className="primary-button" onClick={handleSaveCustomer}>Save customer</button>
            </div>

            <div className="card-section">
              <h4>Add product</h4>
              <input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} placeholder="Product name" />
              <input value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} placeholder="Category" />
              <input value={productForm.price} type="number" onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })} placeholder="Price" />
              <input value={productForm.company_name} onChange={(e) => setProductForm({ ...productForm, company_name: e.target.value })} placeholder="Company" />
              <textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} placeholder="Description" />
              <button className="primary-button" onClick={handleAddProduct}>Save product</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
