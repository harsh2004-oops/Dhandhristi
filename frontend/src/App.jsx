
import Expenses from "./Expenses";
import Reports from "./Reports";
import BusinessInsights from "./BusinessInsights";
import InvoiceOCR from "./InvoiceOCR";
import { useEffect, useState } from 'react';
import axios from 'axios';

import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  ShoppingCart,
  Search,
  Pencil,
  Trash2,
  X,
  Plus,
  Receipt,
  Wallet,
  Lightbulb,
  FileText
} from 'lucide-react';

import './App.css';

const PRODUCT_API = 'http://localhost:8080/api/products';
const CUSTOMER_API = 'http://localhost:8080/api/customers';
const SUPPLIER_API = 'http://localhost:8080/api/suppliers';
const PURCHASE_API = 'http://localhost:8080/api/purchases';
const SALE_API = 'http://localhost:8080/api/sales';

function App() {
  const [page, setPage] = useState('dashboard');

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);

  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [productForm, setProductForm] = useState({
    name: '', category: '', description: '', price: '', stock: ''
  });

  const [customerForm, setCustomerForm] = useState({
    name: '', phone: '', email: '', address: ''
  });

  const [supplierForm, setSupplierForm] = useState({
    supplierName: '', contactPerson: '', phone: '', email: '', address: ''
  });

  const [purchaseForm, setPurchaseForm] = useState({
    productId: '', supplierId: '', quantity: '',
    purchasePrice: '', purchaseDate: new Date().toISOString().slice(0, 10)
  });

  const [saleForm, setSaleForm] = useState({
    productId: '', customerId: '', quantity: '',
    sellingPrice: '', saleDate: new Date().toISOString().slice(0, 10)
  });

  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editingSupplier, setEditingSupplier] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
    fetchSuppliers();
    fetchPurchases();
    fetchSales();
  }, []);

  // FETCH DATA

  const fetchProducts = async () => {
    try {
      const res = await axios.get(PRODUCT_API);
      setProducts(res.data);
    } catch {
      setError('Unable to load products.');
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(CUSTOMER_API);
      setCustomers(res.data);
    } catch {
      setError('Unable to load customers.');
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(SUPPLIER_API);
      setSuppliers(res.data);
    } catch {
      setError('Unable to load suppliers.');
    }
  };

  const fetchPurchases = async () => {
    try {
      const res = await axios.get(PURCHASE_API);
      setPurchases(res.data);
    } catch {
      setError('Unable to load purchases.');
    }
  };

  const fetchSales = async () => {
    try {
      const res = await axios.get(SALE_API);
      setSales(res.data);
    } catch {
      setError('Unable to load sales.');
    }
  };

  // NAVIGATION

  const changePage = (newPage) => {
    setPage(newPage);
    setSearch('');
    setError('');
    setSuccess('');
  };

  // PRODUCT OPERATIONS

  const handleProductSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = {
        ...productForm,
        price: Number(productForm.price),
        stock: Number(productForm.stock)
      };

      if (editingProduct) {
        await axios.put(`${PRODUCT_API}/${editingProduct}`, data);
      } else {
        await axios.post(PRODUCT_API, data);
      }

      setProductForm({
        name: '', category: '', description: '', price: '', stock: ''
      });

      setEditingProduct(null);
      setSuccess('Product saved successfully.');
      setError('');
      fetchProducts();

    } catch {
      setError('Unable to save product.');
    }
  };

  const editProduct = (p) => {
    setEditingProduct(p.id);

    setProductForm({
      name: p.name || '',
      category: p.category || '',
      description: p.description || '',
      price: p.price ?? '',
      stock: p.stock ?? ''
    });
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;

    try {
      await axios.delete(`${PRODUCT_API}/${id}`);
      setSuccess('Product deleted successfully.');
      fetchProducts();
    } catch {
      setError('Unable to delete product.');
    }
  };

  // CUSTOMER OPERATIONS

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingCustomer) {
        await axios.put(`${CUSTOMER_API}/${editingCustomer}`, customerForm);
      } else {
        await axios.post(CUSTOMER_API, customerForm);
      }

      setCustomerForm({
        name: '', phone: '', email: '', address: ''
      });

      setEditingCustomer(null);
      setSuccess('Customer saved successfully.');
      setError('');
      fetchCustomers();

    } catch {
      setError('Unable to save customer.');
    }
  };

  const editCustomer = (c) => {
    setEditingCustomer(c.id);

    setCustomerForm({
      name: c.name || '',
      phone: c.phone || '',
      email: c.email || '',
      address: c.address || ''
    });
  };

  const deleteCustomer = async (id) => {
    if (!window.confirm('Delete this customer?')) return;

    try {
      await axios.delete(`${CUSTOMER_API}/${id}`);
      setSuccess('Customer deleted successfully.');
      fetchCustomers();
    } catch {
      setError('Unable to delete customer.');
    }
  };

  // SUPPLIER OPERATIONS

  const handleSupplierSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingSupplier) {
        await axios.put(`${SUPPLIER_API}/${editingSupplier}`, supplierForm);
      } else {
        await axios.post(SUPPLIER_API, supplierForm);
      }

      setSupplierForm({
        supplierName: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: ''
      });

      setEditingSupplier(null);
      setSuccess('Supplier saved successfully.');
      setError('');
      fetchSuppliers();

    } catch {
      setError('Unable to save supplier.');
    }
  };

  const editSupplier = (s) => {
    setEditingSupplier(s.id);

    setSupplierForm({
      supplierName: s.supplierName || '',
      contactPerson: s.contactPerson || '',
      phone: s.phone || '',
      email: s.email || '',
      address: s.address || ''
    });
  };

  const deleteSupplier = async (id) => {
    if (!window.confirm('Delete this supplier?')) return;

    try {
      await axios.delete(`${SUPPLIER_API}/${id}`);
      setSuccess('Supplier deleted successfully.');
      fetchSuppliers();
    } catch {
      setError('Unable to delete supplier.');
    }
  };

  // PURCHASE OPERATIONS

  const selectedPurchaseProduct = products.find(
    p => String(p.id) === String(purchaseForm.productId)
  );

  const purchaseTotal =
    Number(purchaseForm.quantity || 0) *
    Number(purchaseForm.purchasePrice || 0);

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(PURCHASE_API, {
        productId: Number(purchaseForm.productId),
        supplierId: Number(purchaseForm.supplierId),
        quantity: Number(purchaseForm.quantity),
        purchasePrice: Number(purchaseForm.purchasePrice),
        purchaseDate: purchaseForm.purchaseDate
      });

      setPurchaseForm({
        productId: '',
        supplierId: '',
        quantity: '',
        purchasePrice: '',
        purchaseDate: new Date().toISOString().slice(0, 10)
      });

      setSuccess('Purchase recorded. Product stock increased.');
      setError('');

      fetchPurchases();
      fetchProducts();

    } catch (err) {
      setError(err.response?.data?.message || 'Unable to record purchase.');
    }
  };

  // SALES OPERATIONS

  const selectedSaleProduct = products.find(
    p => String(p.id) === String(saleForm.productId)
  );

  const saleTotal =
    Number(saleForm.quantity || 0) *
    Number(saleForm.sellingPrice || 0);

  const handleSaleSubmit = async (e) => {
    e.preventDefault();

    if (!saleForm.productId || !saleForm.customerId) {
      setError('Please select a product and customer.');
      return;
    }

    if (
      Number(saleForm.quantity) <= 0 ||
      !Number.isInteger(Number(saleForm.quantity)) ||
      Number(saleForm.sellingPrice) <= 0
    ) {
      setError('Enter a valid quantity and selling price.');
      return;
    }

    if (
      !selectedSaleProduct ||
      Number(saleForm.quantity) > Number(selectedSaleProduct.stock || 0)
    ) {
      setError(
        `Insufficient stock. Available stock: ${selectedSaleProduct?.stock ?? 0}`
      );
      return;
    }

    try {
      await axios.post(SALE_API, {
        productId: Number(saleForm.productId),
        customerId: Number(saleForm.customerId),
        quantity: Number(saleForm.quantity),
        sellingPrice: Number(saleForm.sellingPrice),
        saleDate: saleForm.saleDate
      });

      setSaleForm({
        productId: '',
        customerId: '',
        quantity: '',
        sellingPrice: '',
        saleDate: new Date().toISOString().slice(0, 10)
      });

      setSuccess('Sale recorded successfully. Product stock decreased.');
      setError('');

      fetchSales();
      fetchProducts();

    } catch (err) {
      setError(err.response?.data?.message || 'Unable to record sale.');
    }
  };

  // FILTER DATA

  const filteredProducts = products.filter(p =>
    `${p.name} ${p.category}`.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCustomers = customers.filter(c =>
    `${c.name} ${c.phone} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSuppliers = suppliers.filter(s =>
    `${s.supplierName} ${s.contactPerson} ${s.phone} ${s.email}`
      .toLowerCase().includes(search.toLowerCase())
  );

  const filteredPurchases = purchases.filter(p => {
    const product = products.find(x => Number(x.id) === Number(p.productId));
    const supplier = suppliers.find(x => Number(x.id) === Number(p.supplierId));

    return `${product?.name || ''} ${supplier?.supplierName || ''}`
      .toLowerCase().includes(search.toLowerCase());
  });

  const filteredSales = sales.filter(s => {
    const product = products.find(x => Number(x.id) === Number(s.productId));
    const customer = customers.find(x => Number(x.id) === Number(s.customerId));

    return `${product?.name || ''} ${customer?.name || ''}`
      .toLowerCase().includes(search.toLowerCase());
  });

  // DASHBOARD CALCULATIONS

  const totalStock = products.reduce(
    (sum, p) => sum + Number(p.stock || 0), 0
  );

  const inventoryValue = products.reduce(
    (sum, p) => sum + Number(p.price || 0) * Number(p.stock || 0), 0
  );

  const totalPurchaseAmount = purchases.reduce(
    (sum, p) => sum + Number(p.totalAmount || 0), 0
  );

  const totalSalesAmount = sales.reduce(
    (sum, s) => sum + Number(s.totalAmount || 0), 0
  );

  // CANCEL EDIT

  const cancelProductEdit = () => {
    setEditingProduct(null);
    setProductForm({
      name: '', category: '', description: '', price: '', stock: ''
    });
  };

  const cancelCustomerEdit = () => {
    setEditingCustomer(null);
    setCustomerForm({
      name: '', phone: '', email: '', address: ''
    });
  };

  const cancelSupplierEdit = () => {
    setEditingSupplier(null);
    setSupplierForm({
      supplierName: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: ''
    });
  };

  // REUSABLE TABLE ACTIONS

  const actions = (onEdit, onDelete) => (
    <div className="action-buttons">
      <button className="edit-btn" onClick={onEdit}>
        <Pencil size={15} />
      </button>

      <button className="delete-btn" onClick={onDelete}>
        <Trash2 size={15} />
      </button>
    </div>
  );

  return (
    <div className="app-container">

      {/* SIDEBAR */}

      <aside className="sidebar">
        <h2>DhanDhristi</h2>
        <p className="sidebar-subtitle">Business Management</p>

        <nav>
          <button
            className={page === 'dashboard' ? 'active' : ''}
            onClick={() => changePage('dashboard')}
          >
            <LayoutDashboard size={18} /> Dashboard
         
          </button>
           {/* INVOICE OCR */}
         <button
         className={page === 'invoice-ocr' ? 'active' : ''}
         onClick={() => changePage('invoice-ocr')}
         >
        <FileText size={18} /> Invoice OCR
         </button>

          <button
            className={page === 'products' ? 'active' : ''}
            onClick={() => changePage('products')}
          >
            <Package size={18} /> Products
          </button>

          <button
            className={page === 'customers' ? 'active' : ''}
            onClick={() => changePage('customers')}
          >
            <Users size={18} /> Customers
          </button>

          <button
            className={page === 'suppliers' ? 'active' : ''}
            onClick={() => changePage('suppliers')}
          >
            <Truck size={18} /> Suppliers
          </button>

          <button
            className={page === 'purchases' ? 'active' : ''}
            onClick={() => changePage('purchases')}
          >
            <ShoppingCart size={18} /> Purchases
          </button>

          <button
            className={page === 'sales' ? 'active' : ''}
            onClick={() => changePage('sales')}
          >
            <Receipt size={18} /> Sales
          </button>

          <button
            className={page === 'expenses' ? 'active' : ''}
            onClick={() => changePage('expenses')}
          >
            <Wallet size={18} /> Expenses
          </button>

          <button
            className={page === 'reports' ? 'active' : ''}
            onClick={() => changePage('reports')}
          >
            Reports & Analytics
          </button>

          {/* BUSINESS INSIGHTS */}
          <button
            className={page === 'insights' ? 'active' : ''}
            onClick={() => changePage('insights')}
          >
            <Lightbulb size={18} /> Business Insights
          </button>
        </nav>
      </aside>

   

      {/* MAIN CONTENT */}

      <main className="main-content">

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        {/* DASHBOARD */}

        {page === 'dashboard' && (
          <>
            <div className="page-header">
              <h1>Dashboard</h1>
              <p>Welcome to your business overview.</p>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <Package size={25} />
                <h3>Total Products</h3>
                <h2>{products.length}</h2>
              </div>

              <div className="stat-card">
                <Package size={25} />
                <h3>Total Stock Units</h3>
                <h2>{totalStock}</h2>
              </div>

              <div className="stat-card">
                <LayoutDashboard size={25} />
                <h3>Inventory Value</h3>
                <h2>₹{inventoryValue.toLocaleString('en-IN')}</h2>
              </div>

              <div className="stat-card">
                <Users size={25} />
                <h3>Total Customers</h3>
                <h2>{customers.length}</h2>
              </div>

              <div className="stat-card">
                <Truck size={25} />
                <h3>Total Suppliers</h3>
                <h2>{suppliers.length}</h2>
              </div>

              <div className="stat-card">
                <ShoppingCart size={25} />
                <h3>Total Purchases</h3>
                <h2>₹{totalPurchaseAmount.toLocaleString('en-IN')}</h2>
              </div>

              <div className="stat-card">
                <Receipt size={25} />
                <h3>Total Sales</h3>
                <h2>₹{totalSalesAmount.toLocaleString('en-IN')}</h2>
              </div>
            </div>
          </>
        )}

        {/* PRODUCTS */}

        {page === 'products' && (
          <>
            <div className="page-header">
              <h1>Product Management</h1>
              <p>Manage your business products and inventory.</p>
            </div>

            <div className="search-box">
              <Search size={18} />
              <input
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="content-grid">
              <div className="panel">
                <h2>Product List</h2>

                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredProducts.map(p => (
                        <tr key={p.id}>
                          <td>{p.name}</td>
                          <td>{p.category}</td>
                          <td>₹{p.price}</td>
                          <td>{p.stock}</td>
                          <td>
                            {actions(
                              () => editProduct(p),
                              () => deleteProduct(p.id)
                            )}
                          </td>
                        </tr>
                      ))}

                      {filteredProducts.length === 0 && (
                        <tr>
                          <td colSpan="5">No products found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="panel add-panel">
                <h2>{editingProduct ? 'Edit Product' : 'Add Product'}</h2>

                <form onSubmit={handleProductSubmit}>
                  <label>Product Name</label>
                  <input
                    required
                    value={productForm.name}
                    onChange={e => setProductForm({...productForm, name: e.target.value})}
                    placeholder="Enter product name"
                  />

                  <label>Category</label>
                  <input
                    required
                    value={productForm.category}
                    onChange={e => setProductForm({...productForm, category: e.target.value})}
                    placeholder="Enter category"
                  />

                  <label>Description</label>
                  <textarea
                    value={productForm.description}
                    onChange={e => setProductForm({...productForm, description: e.target.value})}
                    placeholder="Enter description"
                  />

                  <label>Price</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={productForm.price}
                    onChange={e => setProductForm({...productForm, price: e.target.value})}
                    placeholder="Enter price"
                  />

                  <label>Stock</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={productForm.stock}
                    onChange={e => setProductForm({...productForm, stock: e.target.value})}
                    placeholder="Enter stock"
                  />

                  <button className="submit-btn" type="submit">
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>

                  {editingProduct && (
                    <button
                      className="cancel-btn"
                      type="button"
                      onClick={cancelProductEdit}
                    >
                      Cancel
                    </button>
                  )}
                </form>
              </div>
            </div>
          </>
        )}

        {/* CUSTOMERS */}

        {page === 'customers' && (
          <>
            <div className="page-header">
              <h1>Customer Management</h1>
              <p>Manage your business customers.</p>
            </div>

            <div className="search-box">
              <Search size={18} />
              <input
                placeholder="Search customers..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="content-grid">
              <div className="panel">
                <h2>Customer Directory</h2>

                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Address</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredCustomers.map(c => (
                        <tr key={c.id}>
                          <td>{c.name}</td>
                          <td>{c.phone}</td>
                          <td>{c.email}</td>
                          <td>{c.address}</td>
                          <td>
                            {actions(
                              () => editCustomer(c),
                              () => deleteCustomer(c.id)
                            )}
                          </td>
                        </tr>
                      ))}

                      {filteredCustomers.length === 0 && (
                        <tr>
                          <td colSpan="5">No customers found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="panel add-panel">
                <h2>{editingCustomer ? 'Edit Customer' : 'Add Customer'}</h2>

                <form onSubmit={handleCustomerSubmit}>
                  <label>Customer Name</label>
                  <input
                    required
                    value={customerForm.name}
                    onChange={e => setCustomerForm({...customerForm, name: e.target.value})}
                    placeholder="Enter customer name"
                  />

                  <label>Phone</label>
                  <input
                    required
                    value={customerForm.phone}
                    onChange={e => setCustomerForm({...customerForm, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />

                  <label>Email</label>
                  <input
                    type="email"
                    value={customerForm.email}
                    onChange={e => setCustomerForm({...customerForm, email: e.target.value})}
                    placeholder="Enter email"
                  />

                  <label>Address</label>
                  <textarea
                    value={customerForm.address}
                    onChange={e => setCustomerForm({...customerForm, address: e.target.value})}
                    placeholder="Enter address"
                  />

                  <button className="submit-btn" type="submit">
                    {editingCustomer ? 'Update Customer' : 'Add Customer'}
                  </button>

                  {editingCustomer && (
                    <button
                      className="cancel-btn"
                      type="button"
                      onClick={cancelCustomerEdit}
                    >
                      Cancel
                    </button>
                  )}
                </form>
              </div>
            </div>
          </>
        )}

        {/* SUPPLIERS */}

        {page === 'suppliers' && (
          <>
            <div className="page-header">
              <h1>Supplier Management</h1>
              <p>Manage your business suppliers and contact details.</p>
            </div>

            <div className="search-box">
              <Search size={18} />
              <input
                placeholder="Search suppliers..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="content-grid">
              <div className="panel">
                <h2>Supplier Directory</h2>

                <div className="table-wrapper">
                  <table className="supplier-table">
                    <thead>
                      <tr>
                        <th>Supplier</th>
                        <th>Contact Person</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Address</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredSuppliers.map(s => (
                        <tr key={s.id}>
                          <td>{s.supplierName}</td>
                          <td>{s.contactPerson}</td>
                          <td>{s.phone}</td>
                          <td>{s.email}</td>
                          <td>{s.address}</td>
                          <td>
                            {actions(
                              () => editSupplier(s),
                              () => deleteSupplier(s.id)
                            )}
                          </td>
                        </tr>
                      ))}

                      {filteredSuppliers.length === 0 && (
                        <tr>
                          <td colSpan="6">No suppliers found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="panel add-panel supplier-form-panel">
                <h2>{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</h2>

                <form onSubmit={handleSupplierSubmit}>
                  <label>Supplier Name</label>
                  <input
                    required
                    value={supplierForm.supplierName}
                    onChange={e => setSupplierForm({...supplierForm, supplierName: e.target.value})}
                    placeholder="Enter supplier name"
                  />

                  <label>Contact Person</label>
                  <input
                    required
                    value={supplierForm.contactPerson}
                    onChange={e => setSupplierForm({...supplierForm, contactPerson: e.target.value})}
                    placeholder="Enter contact person"
                  />

                  <label>Phone</label>
                  <input
                    required
                    value={supplierForm.phone}
                    onChange={e => setSupplierForm({...supplierForm, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />

                  <label>Email</label>
                  <input
                    type="email"
                    value={supplierForm.email}
                    onChange={e => setSupplierForm({...supplierForm, email: e.target.value})}
                    placeholder="Enter email"
                  />

                  <label>Address</label>
                  <textarea
                    value={supplierForm.address}
                    onChange={e => setSupplierForm({...supplierForm, address: e.target.value})}
                    placeholder="Enter supplier address"
                  />

                  <button className="submit-btn" type="submit">
                    {editingSupplier ? 'Update Supplier' : 'Add Supplier'}
                  </button>

                  {editingSupplier && (
                    <button
                      className="cancel-btn"
                      type="button"
                      onClick={cancelSupplierEdit}
                    >
                      <X size={15} /> Cancel
                    </button>
                  )}
                </form>
              </div>
            </div>
          </>
        )}

        {/* PURCHASES */}

        {page === 'purchases' && (
          <>
            <div className="page-header">
              <h1>Purchase Management</h1>
              <p>Record purchases and manage incoming inventory.</p>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <ShoppingCart size={25}/>
                <h3>Total Purchase Records</h3>
                <h2>{purchases.length}</h2>
              </div>

              <div className="stat-card">
                <Package size={25}/>
                <h3>Units Purchased</h3>
                <h2>{purchases.reduce((sum,p) => sum + Number(p.quantity || 0),0)}</h2>
              </div>

              <div className="stat-card">
                <LayoutDashboard size={25}/>
                <h3>Total Purchase Amount</h3>
                <h2>₹{totalPurchaseAmount.toLocaleString('en-IN')}</h2>
              </div>
            </div>

            <div className="content-grid purchase-grid">
              <div className="panel add-panel purchase-form-panel">
                <h2>Record New Purchase</h2>

                <form onSubmit={handlePurchaseSubmit}>
                  <label>Select Supplier</label>
                  <select
                    required
                    value={purchaseForm.supplierId}
                    onChange={e => setPurchaseForm({...purchaseForm, supplierId: e.target.value})}
                  >
                    <option value="">Choose supplier</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.supplierName}
                      </option>
                    ))}
                  </select>

                  <label>Select Product</label>
                  <select
                    required
                    value={purchaseForm.productId}
                    onChange={e => setPurchaseForm({...purchaseForm, productId: e.target.value})}
                  >
                    <option value="">Choose product</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Stock: {p.stock})
                      </option>
                    ))}
                  </select>

                  {selectedPurchaseProduct && (
                    <p className="purchase-stock-info">
                      Current stock: <strong>{selectedPurchaseProduct.stock}</strong> units
                    </p>
                  )}

                  <label>Purchase Quantity</label>
                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    value={purchaseForm.quantity}
                    onChange={e => setPurchaseForm({...purchaseForm, quantity: e.target.value})}
                    placeholder="Enter quantity"
                  />

                  <label>Purchase Price Per Unit (₹)</label>
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={purchaseForm.purchasePrice}
                    onChange={e => setPurchaseForm({...purchaseForm, purchasePrice: e.target.value})}
                    placeholder="Enter purchase price"
                  />

                  <label>Purchase Date</label>
                  <input
                    required
                    type="date"
                    value={purchaseForm.purchaseDate}
                    onChange={e => setPurchaseForm({...purchaseForm, purchaseDate: e.target.value})}
                  />

                  <div className="purchase-total">
                    <span>Total Purchase Amount</span>
                    <strong>
                      ₹{purchaseTotal.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </strong>
                  </div>

                  <button
                    className="submit-btn"
                    type="submit"
                    disabled={!suppliers.length || !products.length}
                  >
                    <Plus size={17}/> Record Purchase
                  </button>

                  {(!suppliers.length || !products.length) && (
                    <p className="purchase-hint">
                      Add at least one supplier and one product first.
                    </p>
                  )}
                </form>
              </div>

              <div className="panel purchase-history-panel">
                <h2>Purchase History</h2>

                <div className="search-box">
                  <Search size={18}/>
                  <input
                    placeholder="Search product or supplier..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>

                <div className="table-wrapper">
                  <table className="purchase-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Product</th>
                        <th>Supplier</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredPurchases.map(p => {
                        const product = products.find(
                          x => Number(x.id) === Number(p.productId)
                        );

                        const supplier = suppliers.find(
                          x => Number(x.id) === Number(p.supplierId)
                        );

                        return (
                          <tr key={p.id}>
                            <td>#{p.id}</td>
                            <td>{p.purchaseDate}</td>
                            <td>{product?.name || `Product #${p.productId}`}</td>
                            <td>{supplier?.supplierName || `Supplier #${p.supplierId}`}</td>
                            <td>{p.quantity}</td>
                            <td>₹{p.purchasePrice}</td>
                            <td>₹{Number(p.totalAmount || 0).toLocaleString('en-IN')}</td>
                          </tr>
                        );
                      })}

                      {filteredPurchases.length === 0 && (
                        <tr>
                          <td colSpan="7">No purchase records found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* SALES */}

        {page === 'sales' && (
          <>
            <div className="page-header">
              <h1>Sales Management</h1>
              <p>Record sales, manage customers and track outgoing inventory.</p>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <Receipt size={25}/>
                <h3>Total Sales Records</h3>
                <h2>{sales.length}</h2>
              </div>

              <div className="stat-card">
                <Package size={25}/>
                <h3>Units Sold</h3>
                <h2>{sales.reduce((sum,s) => sum + Number(s.quantity || 0),0)}</h2>
              </div>

              <div className="stat-card">
                <LayoutDashboard size={25}/>
                <h3>Total Sales Amount</h3>
                <h2>₹{totalSalesAmount.toLocaleString('en-IN')}</h2>
              </div>
            </div>

            <div className="content-grid purchase-grid">

              {/* SALE FORM */}

              <div className="panel add-panel sale-form-panel">
                <h2>Record New Sale</h2>

                <form onSubmit={handleSaleSubmit}>
                  <label>Select Customer</label>
                  <select
                    required
                    value={saleForm.customerId}
                    onChange={e => setSaleForm({...saleForm, customerId: e.target.value})}
                  >
                    <option value="">Choose customer</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>

                  <label>Select Product</label>
                  <select
                    required
                    value={saleForm.productId}
                    onChange={e => setSaleForm({...saleForm, productId: e.target.value})}
                  >
                    <option value="">Choose product</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Stock: {p.stock})
                      </option>
                    ))}
                  </select>

                  {selectedSaleProduct && (
                    <div className="sale-stock-info">
                      Available stock: <strong>{selectedSaleProduct.stock}</strong> units
                    </div>
                  )}

                  <label>Sale Quantity</label>
                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    max={selectedSaleProduct?.stock ?? undefined}
                    value={saleForm.quantity}
                    onChange={e => setSaleForm({...saleForm, quantity: e.target.value})}
                    placeholder="Enter quantity"
                  />

                  <label>Selling Price Per Unit (₹)</label>
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={saleForm.sellingPrice}
                    onChange={e => setSaleForm({...saleForm, sellingPrice: e.target.value})}
                    placeholder="Enter selling price"
                  />

                  <label>Sale Date</label>
                  <input
                    required
                    type="date"
                    value={saleForm.saleDate}
                    onChange={e => setSaleForm({...saleForm, saleDate: e.target.value})}
                  />

                  <div className="sale-total">
                    <span>Total Sale Amount</span>
                    <strong>
                      ₹{saleTotal.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </strong>
                  </div>

                  <button
                    className="submit-btn"
                    type="submit"
                    disabled={!customers.length || !products.length}
                  >
                    <Plus size={17}/> Record Sale
                  </button>

                  {(!customers.length || !products.length) && (
                    <p className="purchase-hint">
                      Add at least one customer and one product first.
                    </p>
                  )}
                </form>
              </div>

              {/* SALES HISTORY */}

              <div className="panel purchase-history-panel">
                <h2>Sales History</h2>

                <div className="search-box">
                  <Search size={18}/>
                  <input
                    placeholder="Search product or customer..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>

                <div className="table-wrapper">
                  <table className="purchase-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Product</th>
                        <th>Customer</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredSales.map(s => {
                        const product = products.find(
                          x => Number(x.id) === Number(s.productId)
                        );

                        const customer = customers.find(
                          x => Number(x.id) === Number(s.customerId)
                        );

                        return (
                          <tr key={s.id}>
                            <td>#{s.id}</td>
                            <td>{s.saleDate}</td>
                            <td>{product?.name || `Product #${s.productId}`}</td>
                            <td>{customer?.name || `Customer #${s.customerId}`}</td>
                            <td>{s.quantity}</td>
                            <td>₹{s.sellingPrice}</td>
                            <td>
                              <strong>
                                ₹{Number(s.totalAmount || 0).toLocaleString('en-IN')}
                              </strong>
                            </td>
                          </tr>
                        );
                      })}

                      {filteredSales.length === 0 && (
                        <tr>
                          <td colSpan="7">No sales records found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </>
        )}

        {/* REPORTS */}

        {page === 'reports' && <Reports />}

        {/* EXPENSES */}

        {page === 'expenses' && <Expenses />}

        {/* BUSINESS INSIGHTS */}

        {page === 'insights' && <BusinessInsights />}

        {/* INVOICE OCR */}

        {page === 'invoice-ocr' && <InvoiceOCR />}

      </main>
    </div>
  );
}

export default App;
