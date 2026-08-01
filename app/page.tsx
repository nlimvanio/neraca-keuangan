 "use client";

import { FormEvent, useMemo, useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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

async function getProducts(
  page: number,
  pageSize: number,
  search: string) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (search.trim()) {
        params.append("search", search);
      }

      const res = await fetch(`/api/product?${params}`);

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
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const offset = (page - 1) * pageSize;
  // setLoading(true);
  useEffect(() => {
    console.log("useEffect running");
    async function loadProducts() {
      console.log("Calling getProducts()");
      // const data = await getProducts();
      const result = await getProducts(
        page,
        pageSize,
        search
      );
      if (result) {
        setProducts(result.data);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      }
      setLoading(false);
    }

    loadProducts();
  }, [page, search]);

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
      const data = await getProducts(
        page,
        pageSize,
        search);
      if (data) {
        setProducts(data.data);
        setTotal(data.total);
        setTotalPages(data.totalPages);
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
          {/* <button className="button primary" onClick={() => setShowModal(true)}>+ Add Product</button> */}
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <div className="panel-header">
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <Button onClick={() => setShowModal(true)}>
              Add Product
            </Button>
            {/* <input
              className="search"
              placeholder="Search products..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            /> */}
          </div>

          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Nama Produk</TableHead><TableHead>Harga</TableHead><TableHead>Barcode</TableHead></TableRow></TableHeader>
              <TableBody>
                {loading ? (
                  (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton className="h-4 w-40" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                      </TableRow>
                    )))
                ) : filteredProducts.length > 0 ? filteredProducts.map((product) => {
                  return (
                    <TableRow key={product.id}>
                      <TableCell><strong>{product.name}</strong></TableCell>
                      <TableCell>Rp. {product.price}</TableCell>
                      <TableCell>{product.barcode}</TableCell>
                    </TableRow>
                  );
                }) : (
                  <TableRow><TableCell className="empty-state" colSpan={3}>No products found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
            

            <Pagination className="mt-4">
                <PaginationContent>

                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) {
                          setPage(page - 1);
                        }
                      }}
                    />
                  </PaginationItem>

                  <PaginationItem>
                    <PaginationLink href="#" isActive>
                      {page}
                    </PaginationLink>
                  </PaginationItem>

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < totalPages) {
                          setPage(page + 1);
                        }
                      }}
                    />
                  </PaginationItem>

                </PaginationContent>
              </Pagination>





          </CardContent>
        </Card>
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
