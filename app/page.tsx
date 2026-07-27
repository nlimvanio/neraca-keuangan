 "use client";

import { FormEvent, useMemo, useState } from "react";
import { products as initialProducts, Product } from "@/lib/data";
import Sidebar from "@/components/Sidebar";

type ProductForm = {
  name: string;
  sku: string;
  category: string;
  stock: string;
  reorderLevel: string;
};

const emptyForm: ProductForm = {
  name: "",
  sku: "",
  category: "",
  stock: "",
  reorderLevel: "",
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;

    return products.filter((product) =>
      [product.name, product.sku, product.category].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [products, search]);

  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const lowStock = products.filter((product) => product.stock <= product.reorderLevel).length;
  const categories = new Set(products.map((product) => product.category)).size;

  function updateForm(field: keyof ProductForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newProduct: Product = {
      id: Date.now(),
      name: form.name.trim(),
      sku: form.sku.trim(),
      category: form.category.trim(),
      stock: Number(form.stock),
      reorderLevel: Number(form.reorderLevel),
    };

    if (
      !newProduct.name ||
      !newProduct.sku ||
      !newProduct.category ||
      Number.isNaN(newProduct.stock) ||
      Number.isNaN(newProduct.reorderLevel)
    ) {
      return;
    }

    setProducts((current) => [newProduct, ...current]);
    setForm(emptyForm);
    setShowModal(false);
  }

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main">
        <header className="header">
          <div>
            <p className="eyebrow">Overview</p>
            <h1>Inventory Dashboard</h1>
            <p className="muted">Keep track of your products and stock levels.</p>
          </div>
          <button className="button primary" onClick={() => setShowModal(true)}>+ Add Product</button>
        </header>

        <section className="stats">
          <div className="stat-card"><span>Total Products</span><strong>{products.length}</strong></div>
          <div className="stat-card"><span>Total Stock</span><strong>{totalStock}</strong></div>
          <div className="stat-card"><span>Low Stock</span><strong>{lowStock}</strong></div>
          <div className="stat-card"><span>Categories</span><strong>{categories}</strong></div>
        </section>

        <section className="panel" id="products">
          <div className="panel-header">
            <div><h2>Products</h2><p className="muted">Search and manage your current inventory.</p></div>
            <input
              className="search"
              placeholder="Search products..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="table-wrap">
            <table>
              <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Stock</th><th>Reorder Level</th><th>Status</th></tr></thead>
              <tbody>
                {filteredProducts.length > 0 ? filteredProducts.map((product) => {
                  const isLow = product.stock <= product.reorderLevel;
                  return (
                    <tr key={product.id}>
                      <td><strong>{product.name}</strong></td>
                      <td>{product.sku}</td>
                      <td>{product.category}</td>
                      <td>{product.stock}</td>
                      <td>{product.reorderLevel}</td>
                      <td><span className={`badge ${isLow ? "warning" : "success"}`}>{isLow ? "Low Stock" : "In Stock"}</span></td>
                    </tr>
                  );
                }) : (
                  <tr><td className="empty-state" colSpan={6}>No products found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel-grid">
          <div className="panel" id="movements">
            <div className="panel-header"><div><h2>Recent Movements</h2><p className="muted">Latest stock activity.</p></div></div>
            <div className="activity-list">
              <div className="activity"><span className="dot in" /><div><strong>Stock received</strong><p>Wireless Mouse · +50 units</p></div><time>Today</time></div>
              <div className="activity"><span className="dot out" /><div><strong>Stock issued</strong><p>Mechanical Keyboard · -8 units</p></div><time>Yesterday</time></div>
              <div className="activity"><span className="dot adjust" /><div><strong>Stock adjusted</strong><p>USB-C Hub · +2 units</p></div><time>2 days ago</time></div>
            </div>
          </div>

          <div className="panel" id="categories">
            <div className="panel-header"><div><h2>Categories</h2><p className="muted">Inventory by category.</p></div></div>
            <div className="category-list">
              {Array.from(new Set(products.map((p) => p.category))).map((category) => (
                <div className="category-row" key={category}><span>{category}</span><strong>{products.filter((p) => p.category === category).length}</strong></div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {showModal && (
        <div className="modal-backdrop" onMouseDown={() => setShowModal(false)}>
          <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div><h2>Add Product</h2><p className="muted">Add a new item to your inventory.</p></div>
              <button className="close-button" onClick={() => setShowModal(false)} aria-label="Close">×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>Product Name<input required value={form.name} onChange={(e) => updateForm("name", e.target.value)} placeholder="e.g. Wireless Mouse" /></label>
                <label>SKU<input required value={form.sku} onChange={(e) => updateForm("sku", e.target.value)} placeholder="e.g. WM-007" /></label>
                <label>Category<input required value={form.category} onChange={(e) => updateForm("category", e.target.value)} placeholder="e.g. Accessories" /></label>
                <label>Stock Quantity<input required min="0" type="number" value={form.stock} onChange={(e) => updateForm("stock", e.target.value)} placeholder="0" /></label>
                <label>Reorder Level<input required min="0" type="number" value={form.reorderLevel} onChange={(e) => updateForm("reorderLevel", e.target.value)} placeholder="10" /></label>
              </div>
              <div className="modal-actions">
                <button type="button" className="button secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="button primary">Add Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
