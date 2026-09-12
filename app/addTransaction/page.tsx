"use client";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { number } from "zod";

interface Product {
    id: number;
    name: string;
    barcode: string;
}

type Pemasukan = {
    productName: string,
    transactionDate: string,
    quantity: number,
    amount: number,
    type: string,
    paid: boolean
}

const initialPemasukan = {
    productName: "",
    transactionDate: "",
    quantity: 0,
    amount: 0,
    type: "I",
    paid: true
}

type Pengeluaran = {
    productName: string,
    transactionDate: string,
    quantity: number,
    invoiceNo: string,
    amount: number,
    type: string,
    paid: boolean
}
const initialPengeluaran = {
    productName: "",
    transactionDate: "",
    quantity: 0,
    invoiceNo: "",
    type: "O",
    amount: 0,
    paid: true
}

export default function Home() {
    const [transactionType, setTransactionType] = useState("pemasukan");
    const listPengeluaran = [initialPengeluaran];
    const listPemasukan = [initialPemasukan];
    const [isLoading, setLoading] = useState(false);


    return (
        <div className="app-shell">
            <Sidebar />
            <main className="main">
                <Card className="px-2">
                    <CardHeader className="font-bold text-2xl px-2">
                        Add Transaksi
                    </CardHeader>
                    <div className="panel-header">
                        <div className="flex flex-col gap-4 m-2 justify-content-center">
                            <h3 className="font-semibold">Tipe transaksi</h3>
                            <div className="flex flex-row">
                                <label className="me-2">
                                    <input
                                        type="radio"
                                        name="transactionType"
                                        value="pemasukan"
                                        checked={transactionType === "pemasukan"}
                                        onChange={e => setTransactionType(e.target.value)}
                                    />
                                    Pemasukan
                                </label>
                                <label className="ms-2">
                                    <input
                                        type="radio"
                                        name="transactionType"
                                        value="pengeluaran"
                                        checked={transactionType === "pengeluaran"}
                                        onChange={e => setTransactionType(e.target.value)}
                                    />
                                    Pengeluaran
                                </label>
                            </div>
                        </div>
                    </div>
                    <CardContent>
                        {renderBeli(listPengeluaran, setLoading)}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}

async function handleSubmit(event: FormEvent<HTMLFormElement>, transactionlist: Pengeluaran[] | Pemasukan[], setLoading: Dispatch<SetStateAction<boolean>>) {
    event.preventDefault();

    try {
        setLoading(true);
        const res = await fetch("/api/transaction", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(transactionlist),
        });

        const response = await res.json();
        if (!res.ok) {
            throw new Error(response.message || "Failed to save transaction.");
        }

        console.log("Transaction created:", response);


    } catch (err) {
        console.error(err);
        alert(
            err instanceof Error
                ? err.message
                : "Failed to save transaction."
        );
    } finally {
        setLoading(false);
    }
}

const searchProducts = (
    setProductResults: Dispatch<SetStateAction<Product[]>>,
    setProductLoading: Dispatch<SetStateAction<boolean>>
) => async (search: string) => {
    if (!search.trim()) {
        setProductResults([]);
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
    } catch (error) {
        console.error(error);
        setProductResults([]);
    } finally {
        setProductLoading(false);
    }
}

function renderBeli(initialList: Pengeluaran[], setLoading: Dispatch<SetStateAction<boolean>>) {
    const [listPengeluaran, updateListPengeluaran] = useState<Pengeluaran[]>([...initialList]);
    const [searchResults, setProduct] = useState<Product[]>([]);
    const [productLoading, setProductLoading] = useState(false);
    const [searchText, setSearch] = useState("");
    const search = searchProducts(setProduct, setProductLoading);
    return (
        <form onSubmit={e => handleSubmit(e, listPengeluaran, setLoading)}>
            <div className="flex flex-col justify-between w-full gap-4 p-3 ">
                {listPengeluaran.map((pengeluaran, index) =>
                    <div className="flex flex-row justify-between w-full gap-4 p-5 overflow-x-auto border-b border-gray-300" key={index}>
                        <div className="flex flex-col justify-between min-w-[150px]">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Nama produk</label>
                            {/* Nama produk */}
                            <Combobox
                                items={searchResults}
                                value={pengeluaran.productName}
                                onValueChange={e => {
                                    updateListPengeluaran(prev =>
                                        prev.map((item, i) => i === index ? { ...item, productName: e ? e : "" } : item)
                                    )
                                }}
                            >
                                <ComboboxInput
                                    placeholder="Cari produk"
                                    value={searchText}
                                    onChange={async e => {
                                        setSearch(e.target.value)
                                        if (e.target.value.length >= 3) {
                                            await search(e.target.value);
                                        } else {
                                            setProduct([]);
                                        }
                                    }}
                                />
                                <ComboboxContent>
                                    <ComboboxEmpty>Produk tidak ditemukan</ComboboxEmpty>
                                    <ComboboxList>
                                        {(product) => (
                                            <ComboboxItem key={product.id} value={product}>
                                                {product.name} | {product.id}
                                            </ComboboxItem>
                                        )}
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>
                        </div>
                        <div className="flex flex-col justify-between min-w-[150px]">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Tanggal Transaksi</label>
                            <input type="date" placeholder="Tanggal Transaksi" value={pengeluaran.transactionDate}
                                onChange={e => {
                                    updateListPengeluaran(prev =>
                                        prev.map((item, i) => i === index ? { ...item, transactionDate: e.target.value } : item)
                                    )
                                }}
                                className="text-sm custom-input w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm 
                                focus:outline-blue-300 bg-gray-100"
                            />
                        </div>
                        <div className="flex flex-col justify-between min-w-[100px]">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Jumlah Barang</label>
                            <input type="number" placeholder="Jumlah Barang" value={pengeluaran.quantity}
                                onChange={e => {
                                    updateListPengeluaran((prev) =>
                                        prev.map((item, i) => i === index ? { ...item, quantity: Number(e.target.value) } : item)
                                    )
                                }}
                                min="0"
                                className="text-sm custom-input w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm 
                                focus:outline-blue-300 bg-gray-100"
                            />
                        </div>
                        <div className="flex flex-col justify-between min-w-[100px]">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Total Harga</label>
                            <input type="text" placeholder="Harga Barang"
                                value={
                                    pengeluaran.amount ? new Intl.NumberFormat("id-ID").format(pengeluaran.amount) : ""
                                }
                                onChange={e => {
                                    const rawValue = e.target.value.replace(/\./g, "");
                                    updateListPengeluaran(prev =>
                                        prev.map((item, i) => i === index ? { ...item, amount: Number(rawValue) } : item)
                                    )
                                }}
                                className="text-sm custom-input w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm 
                                focus:outline-blue-300 bg-gray-100"
                            />
                        </div>
                        <div className="flex flex-col justify-between items-center min-w-[100px]">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Lunas</label>
                            <input type="checkbox" checked={pengeluaran.paid}
                                onChange={e => {
                                    updateListPengeluaran(prev =>
                                        prev.map((item, i) => i === index ? { ...item, paid: e.target.checked } : item)
                                    )
                                }}
                                className="w-6 h-6"
                            />
                        </div>
                        <div>
                            <label className="invisible">Delete</label>
                            <button type="button" className="close-button" onClick={() => updateListPengeluaran(prev => prev.filter((_, i) => i !== index))} aria-label="Close">×</button>
                        </div>
                    </div>
                )}
                <div className="flex items-center justify-center w-full">
                    <button type="button" onClick={() => updateListPengeluaran(prev => [...prev, initialPengeluaran])} className="button primary">
                        Tambah Baris
                    </button>
                </div>
            </div>
        </form>
    )

}
