 "use client";

import { FormEvent, useMemo, useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";

type ProductForm = {
  name: string;
  price: string;
  barcode: string;
};

const emptyForm: ProductForm = {
  name: "",
  price: "",
  barcode: ""
};

interface Produk {
  id: number;
  name: string;
  price: string;
  barcode: string;
}

async function getProducts() {
  try {
      const res = await fetch("/api/product");

      console.log("Status:", res.status);

      const data = await res.json();
      return data;
    } catch (err) {
      console.error(err);
    }
}

export default function Home() {
  console.log("Home rendered");
  const [products, setProducts] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);
  // setLoading(true);
  useEffect(() => {
    console.log("useEffect running");
    async function loadProducts() {
      console.log("Calling getProducts()");
      const data = await getProducts();
      if (data) {
        setProducts(data);
      }
      setLoading(false);
    }

    loadProducts();
  }, []);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;

    return products.filter((product) =>
      [product.name, product.barcode].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [products, search]);

  function updateForm(field: keyof ProductForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {    
    event.preventDefault();

    try {
      const res = await fetch("/api/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          barcode: form.barcode,
          price: Number(form.price),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save product");
      }

      const result = await res.json();

      console.log("Product created:", result);

      // Reload table
      const data = await getProducts();
      if (data) {
        setProducts(data);
      }

      // Clear form
      setForm(emptyForm);
      setShowModal(false);

    } catch (err) {
      console.error(err);
      alert("Failed to save product");
    }
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
              <thead><tr><th>Nama Produk</th><th>Harga</th><th>Barcode</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="text-center py-4">
                      Loading products...
                    </td>
                  </tr>
                ) : filteredProducts.length > 0 ? filteredProducts.map((product) => {
                  return (
                    <tr key={product.id}>
                      <td><strong>{product.name}</strong></td>
                      <td>Rp. {product.price}</td>
                      <td>{product.barcode}</td>
                    </tr>
                  );
                }) : (
                  <tr><td className="empty-state" colSpan={3}>No products found.</td></tr>
                )}
              </tbody>
            </table>
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
                <label>Nama Produk<input required value={form.name} onChange={(e) => updateForm("name", e.target.value)} placeholder="cth. Pulpen" /></label>
                <label>Harga<input required value={form.price} onChange={(e) => updateForm("price", e.target.value)} placeholder="cth. 10000" /></label>
                <label>Barcode<input required value={form.barcode} onChange={(e) => updateForm("barcode", e.target.value)} placeholder="e.g. BDE-0817" /></label>
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
