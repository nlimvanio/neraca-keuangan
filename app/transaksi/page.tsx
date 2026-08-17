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
  PaginationEllipsis,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type TransactionForm = {
  id_product: string;
  transaction_type: string;
  quantity: string;
  created_by: string;
};

const emptyForm: TransactionForm = {
  id_product: "",
  transaction_type: "",
  quantity: "",
  created_by: ""
};

interface Transaction {
  id: number;
  transaction_date: string;
  name: string;
  barcode: string;
  transaction_type: string;
  quantity: string;
  amount: string;
  created_by: string;
}

interface Product {
  id: number;
  name: string;
  barcode: string;
}



async function getTransactions(
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
      const res = await fetch(`/api/transaction?${params}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error(err);
    }
}

function getPageNumbers(currentPage: number, totalPages: number) {
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
  pages.push(1);
  if (currentPage > 4) {
    pages.push("...");
  }
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  if (currentPage < totalPages - 3) {
    pages.push("...");
  }
  pages.push(totalPages);
  return pages;
}

export default function Home() {
  console.log("Home rendered");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageNumbers = getPageNumbers(page, totalPages);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<TransactionForm>(emptyForm);

  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [productLoading, setProductLoading] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exporting, setExporting] = useState(false);

  const offset = (page - 1) * pageSize;
  // setLoading(true);
  useEffect(() => {
    console.log("useEffect running");
    async function loadTransactions() {
      console.log("Calling getTransaction()");
      const result = await getTransactions(
        page,
        pageSize,
        search
      );
      if (result) {
        setTransactions(result.data);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      }
      setLoading(false);
    }

    loadTransactions();
  }, [page, search]);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return transactions;

    return transactions.filter((transaction) =>
      [transaction.name, transaction.barcode].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [transactions, search]);

  function updateForm(field: keyof TransactionForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  useEffect(() => {
    if (selectedProduct) {
      return;
    }

    const timer = setTimeout(() => {
      searchProducts(productSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [productSearch, selectedProduct]);
  
  async function searchProducts(search: string) {
    if (!search.trim()) {
      setProductResults([]);
      setShowProductDropdown(false);
      return;
    }

    try {
      setProductLoading(true);

      const res = await fetch(
        `/api/product?search=${encodeURIComponent(search)}`
      );

      if (!res.ok) {
        throw new Error("Failed to search products");
      }
      const data = await res.json();

      console.log("Search result:", data);

      setProductResults(data.data);
      setShowProductDropdown(true);
    } catch (error) {
      console.error(error);
      setProductResults([]);
    } finally {
      setProductLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {    
    event.preventDefault();

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_product: form.id_product,
          transaction_type: form.transaction_type,
          quantity: form.quantity,
          created_by: form.created_by,
        }),
      });

      const response = await res.json();
      if (!res.ok) {
        throw new Error(response.message || "Failed to save transaction.");
      }

      console.log("Transaction created:", response);

      // Reload table
      const data = await getTransactions(
        page,
        pageSize,
        search);
      if (data) {
        setTransactions(data.data);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }

      // Clear form

      setProductSearch("");
      setSelectedProduct(null);
      setProductResults([]);
      setShowProductDropdown(false);
      setForm(emptyForm);
      setShowModal(false);


    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error
          ? err.message
          : "Failed to save transaction."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleExport() {

    const start = new Date(startDate);
    const end = new Date(endDate);

    const diffTime = end.getTime() - start.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24) + 1;
    if (diffDays > 31) {
      alert("The maximum export date range is 30 days.");
      return;
    }

    if (!startDate || !endDate) {
      alert("Please select the transaction date range.");
      return;
    }

    if (startDate > endDate) {
      alert("Start date cannot be after end date.");
      return;
    }

    try {
      setExporting(true);

      const url =
        `/api/transaction/export` +
        `?startDate=${encodeURIComponent(startDate)}` +
        `&endDate=${encodeURIComponent(endDate)}`;

      window.location.href = url;

    } catch (error) {
      console.error(error);
      alert("Failed to generate Excel.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <Card>
          <CardHeader>
            <CardTitle>Transaksi</CardTitle>
          </CardHeader>
          <div className="panel-header">
            <Input
              placeholder="Cari transaksi ... (Cth nama, barcode)"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <Button onClick={() => setShowModal(true)}>
              + Transaksi
            </Button>
          </div>

          <div className="panel-header">
            <label>From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <label>To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <button
              type="button"
              className="button primary"
              disabled={exporting}
              onClick={handleExport}
            >
              {exporting ? "Generating..." : "Export Excel"}
            </button>
          </div>

          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Tanggal Transaksi</TableHead><TableHead>Nama Barang</TableHead><TableHead>Tipe Transaksi</TableHead><TableHead>Jumlah Barang</TableHead><TableHead>Nilai Transaksi</TableHead><TableHead>Diinput</TableHead></TableRow></TableHeader>
              <TableBody>
                {loading ? (
                  (
                    Array.from({ length: 6 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton className="h-4 w-40" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                      </TableRow>
                    )))
                ) : filteredTransactions.length > 0 ? filteredTransactions.map((transaction) => {
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {new Date(transaction.transaction_date).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        }).replace(",", "")}
                      </TableCell>
                      <TableCell><strong>{transaction.name}</strong> ({transaction.barcode})</TableCell>
                      {/* <TableCell>{transaction.transaction_type}</TableCell> */}
                      <TableCell>
                        {transaction.transaction_type === "I" ? (
                          <span>Beli</span>
                        ) : transaction.transaction_type === "O" ? (
                          <span>Jual</span>
                        ) : (
                          <span>-</span>
                        )}
                      </TableCell>
                      <TableCell>{transaction.quantity}</TableCell>
                      <TableCell>Rp. {transaction.amount}</TableCell>
                      <TableCell>{transaction.created_by}</TableCell>
                    </TableRow>
                  );
                }) : (
                  <TableRow><TableCell className="empty-state" colSpan={6}>No transaction found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
            <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        setLoading(true);
                        e.preventDefault();
                        if (page > 1) {
                          setPage(page - 1);
                        }
                      }}
                    />
                  </PaginationItem>
                  {pageNumbers.map((item, index) => (
                    <PaginationItem key={index}>
                      {item === "..." ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          href="#"
                          isActive={page === item}
                          onClick={(e) => {
                            setLoading(true);
                            e.preventDefault();
                            setPage(item);
                          }}
                        >
                          {item}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        setLoading(true);
                        e.preventDefault();
                        if (page < totalPages) {
                          setPage(page + 1);
                        }
                      }}
                    />
                  </PaginationItem>
                  Total Transaksi {total}
                </PaginationContent>
              </Pagination>
          </CardContent>
        </Card>
      </main>

      {showModal && (
        <div className="modal-backdrop" onMouseDown={() => setShowModal(false)}>
          <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div><h2>Buat Transaksi</h2><p className="muted">Masukkan transaksi atas pembelian atau penjualan barang.</p></div>
              <button className="close-button" onClick={() => setShowModal(false)} aria-label="Close">×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="product-select">
                  <label>Produk</label>
                  <input
                    required
                    type="text"
                    value={productSearch}
                    placeholder="Cari produk (nama, barcode)..."
                    onFocus={() => {
                      if (productResults.length > 0) {
                        setShowProductDropdown(true);
                      }
                    }}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setShowProductDropdown(true);
                      setSelectedProduct(null);
                    }}
                  />

                  {showProductDropdown && (
                    <div className="product-dropdown">
                      {productLoading ? (
                        <div className="product-option">
                          Mencari...
                        </div>
                      ) : productResults.length > 0 ? (
                        productResults.map((product) => (
                          <div
                            key={product.id}
                            className="product-option"
                            onMouseDown={() => {
                              console.log("Selected product:", product);

                              setSelectedProduct(product);
                              setProductSearch(product.name);
                              setShowProductDropdown(false);

                              updateForm("id_product", product.id.toString());
                            }}
                          >
                            <strong>{product.name}</strong> | <small>{product.barcode}</small>
                          </div>
                        ))
                      ) : (
                        <div className="product-option">
                          No product found
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="form-field">
                  <label>Jenis Transaksi</label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="transaction_type"
                        value="I"
                        checked={form.transaction_type === "I"}
                        onChange={(e) =>
                          updateForm("transaction_type", e.target.value)
                        }
                      />
                      <span>Beli</span>
                    </label>

                    <label className="radio-option">
                      <input
                        type="radio"
                        name="transaction_type"
                        value="O"
                        checked={form.transaction_type === "O"}
                        onChange={(e) =>
                          updateForm("transaction_type", e.target.value)
                        }
                      />
                      <span>Jual</span>
                    </label>
                  </div>
                </div>
                <label>Jumlah Barang<input required value={form.quantity} onChange={(e) => updateForm("quantity", e.target.value)}/></label>
                <label>Diinput<input required value={form.created_by} onChange={(e) => updateForm("created_by", e.target.value)} placeholder="e.g. BDE-0817" /></label>
              </div>
              <div className="modal-actions">
                <button type="button" className="button secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="button primary" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
