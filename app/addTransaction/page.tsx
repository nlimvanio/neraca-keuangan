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

type Penjualan = {
    productName: string,
    transactionDate: string,
    quantity: number,
    amount: number,
    type: string,
    paid: boolean
}

const initialPenjualan = {
    productName: "",
    transactionDate: "",
    quantity: 0,
    amount: 0,
    type: "I",
    paid: true
}

type Pembelian = {
    productName: string,
    transactionDate: string,
    quantity: number,
    invoiceNo: string,
    amount: number,
    type: string,
    paid: boolean
}
const initialPembelian = {
    productName: "",
    transactionDate: "",
    quantity: 0,
    invoiceNo: "",
    type: "O",
    amount: 0,
    paid: true
}

export default function Home() {
    const [transactionType, setTransactionType] = useState("penjualan");
    const listPembelian = [initialPembelian];
    const listPenjualan = [initialPenjualan];
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
                                        value="penjualan"
                                        checked={transactionType === "penjualan"}
                                        onChange={e => setTransactionType(e.target.value)}
                                    />
                                    Penjualan
                                </label>
                                <label className="ms-2">
                                    <input
                                        type="radio"
                                        name="transactionType"
                                        value="pembelian"
                                        checked={transactionType === "pembelian"}
                                        onChange={e => setTransactionType(e.target.value)}
                                    />
                                    Pembelian
                                </label>
                            </div>
                        </div>
                    </div>
                    <CardContent>
                        {transactionType === "pembelian"
                            ? <RenderPembelian initialList={listPembelian} setLoading={setLoading} />
                            : <RenderPenjualan initialList={listPenjualan} setLoading={setLoading} />
                        }
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}

async function handleSubmit(event: FormEvent<HTMLFormElement>, transactionlist: Pembelian[] | Penjualan[], setLoading: Dispatch<SetStateAction<boolean>>) {
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

function RenderPembelian(
    { initialList, setLoading }:
        { initialList: Pembelian[], setLoading: Dispatch<SetStateAction<boolean>> }
) {
    const [listPembelian, updateListPembelian] = useState<Pembelian[]>([...initialList]);
    return (
        <form onSubmit={e => handleSubmit(e, listPembelian, setLoading)}>
            <div className="flex flex-col justify-between w-full gap-4 p-3 ">
                {listPembelian.map((pembelian, index) =>
                    <PembelianRow key={index} pembelian={pembelian} index={index} updateListPembelian={updateListPembelian} />
                )}
                <div className="flex items-center justify-center w-full">
                    <button type="button" onClick={() => updateListPembelian(prev => [...prev, initialPembelian])} className="button primary">
                        Tambah Baris
                    </button>
                </div>
            </div>
        </form>
    )

}

function PembelianRow(
    { pembelian, index, updateListPembelian }:
        {
            pembelian: Pembelian;
            index: number;
            updateListPembelian: Dispatch<SetStateAction<Pembelian[]>>
        }
) {
    const [searchProductResults, setProduct] = useState<Product[]>([]);
    const [productLoading, setProductLoading] = useState(false);
    const [searchText, setSearch] = useState("");
    const search = searchProducts(setProduct, setProductLoading);
    return (
        <div className="flex flex-row justify-between w-full gap-4 pt-3 pb-5 overflow-x-auto border-b border-gray-300" key={index}>
            <div className="flex flex-col justify-between">
                <label className="block text-gray-700 text-sm font-bold mb-2">No. Invoice</label>
                <input type="text" placeholder="Nomor Invoice" value={pembelian.invoiceNo}
                    onChange={e => {
                        updateListPembelian(
                            prev => prev.map((item, i) => i === index ? { ...item, invoiceNo: e.target.value } : item)
                        )
                    }}
                    className="text-sm custom-input w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm 
                                focus:outline-blue-300"
                />
            </div>
            <div className="flex flex-col justify-between min-w-[150px]">
                <label className="block text-gray-700 text-sm font-bold mb-2">Nama produk</label>
                {/* Nama produk */}
                <Combobox
                    items={searchProductResults}
                    value={pembelian.productName}
                    onValueChange={e => {
                        const selectedValue = e ?? "";
                        setSearch(selectedValue)
                        updateListPembelian(prev =>
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
                        <ComboboxEmpty>
                            {productLoading ? "Mencari..." : "Produk tidak ditemukan"}
                        </ComboboxEmpty>
                        <ComboboxList>
                            {(product) => (
                                <ComboboxItem key={product.id} value={product.name}>
                                    <strong>{product.name}</strong> | <small>{product.barcode}</small>
                                </ComboboxItem>
                            )}
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
            </div>
            <div className="flex flex-col justify-between min-w-[150px]">
                <label className="block text-gray-700 text-sm font-bold mb-2">Tanggal Transaksi</label>
                <input type="date" placeholder="Tanggal Transaksi" value={pembelian.transactionDate}
                    onChange={e => {
                        updateListPembelian(prev =>
                            prev.map((item, i) => i === index ? { ...item, transactionDate: e.target.value } : item)
                        )
                    }}
                    className="text-sm custom-input w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm 
                                focus:outline-blue-300 "
                />
            </div>
            <div className="flex flex-col justify-between min-w-[100px]">
                <label className="block text-gray-700 text-sm font-bold mb-2">Jumlah Barang</label>
                <input type="number" placeholder="Jumlah Barang" value={pembelian.quantity}
                    onChange={e => {
                        updateListPembelian((prev) =>
                            prev.map((item, i) => i === index ? { ...item, quantity: Number(e.target.value) } : item)
                        )
                    }}
                    min="0"
                    className="text-sm custom-input w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm 
                                focus:outline-blue-300 "
                />
            </div>
            <div className="flex flex-col justify-between min-w-[100px]">
                <label className="block text-gray-700 text-sm font-bold mb-2">Total Harga</label>
                <input type="text" placeholder="Harga Barang"
                    value={
                        pembelian.amount ? new Intl.NumberFormat("id-ID").format(pembelian.amount) : ""
                    }
                    onChange={e => {
                        const rawValue = e.target.value.replace(/\./g, "");
                        updateListPembelian(prev =>
                            prev.map((item, i) => i === index ? { ...item, amount: Number(rawValue) } : item)
                        )
                    }}
                    className="text-sm custom-input w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm 
                                focus:outline-blue-300 "
                />
            </div>
            <div className="flex flex-col justify-around items-center min-w-[100px]">
                <label className="block text-gray-700 text-sm font-bold mb-2">Lunas</label>
                <input type="checkbox" checked={pembelian.paid}
                    onChange={e => {
                        updateListPembelian(prev =>
                            prev.map((item, i) => i === index ? { ...item, paid: e.target.checked } : item)
                        )
                    }}
                    className="w-6 h-6"
                />
            </div>
            <div>
                <label className="invisible">Delete</label>
                <button type="button" className="close-button"
                    onClick={() => updateListPembelian(prev => prev.filter((_, i) => i !== index))}
                    aria-label="Close">×</button>
            </div>
        </div>
    )
}

function RenderPenjualan(
    { initialList, setLoading }:
        { initialList: Penjualan[], setLoading: Dispatch<SetStateAction<boolean>> }
) {
    const [listPenjualan, updateListPenjualan] = useState<Penjualan[]>([...initialList]);

    return (
        <form onSubmit={e => handleSubmit(e, listPenjualan, setLoading)}>
            <div className="flex flex-col justify-between w-full gap-4 p-3">
                {listPenjualan.map((Penjualan, index) =>
                    <PenjualanRow key={index} Penjualan={Penjualan} index={index} updateListPenjualan={updateListPenjualan} />
                )}
                <div className="flex items-center justify-center w-full">
                    <button type="button" onClick={() => updateListPenjualan(prev => [...prev, initialPembelian])} className="button primary">
                        Tambah Baris
                    </button>
                </div>
            </div>
        </form>
    )
}

function PenjualanRow(
    { Penjualan, index, updateListPenjualan }:
        {
            Penjualan: Penjualan;
            index: number;
            updateListPenjualan: Dispatch<SetStateAction<Penjualan[]>>
        }
) {
    const [searchProductResults, setProduct] = useState<Product[]>([]);
    const [productLoading, setProductLoading] = useState(false);
    const [searchText, setSearch] = useState("");
    const search = searchProducts(setProduct, setProductLoading);
    return (
        <div className="flex flex-row justify-between w-full gap-4 pt-3 pb-5 overflow-x-auto border-b border-gray-300" key={index}>
            <div className="flex flex-col justify-between min-w-[150px]">
                <label className="block text-gray-700 text-sm font-bold mb-2">Nama produk</label>
                {/* Nama produk */}
                <Combobox
                    items={searchProductResults}
                    value={Penjualan.productName}
                    onValueChange={e => {
                        const selectedValue = e ?? "";
                        setSearch(selectedValue)
                        updateListPenjualan(prev =>
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
                        <ComboboxEmpty>
                            {productLoading ? "Mencari..." : "Produk tidak ditemukan"}
                        </ComboboxEmpty>
                        <ComboboxList>
                            {(product) => (
                                <ComboboxItem key={product.id} value={product.name}>
                                    <strong>{product.name}</strong> | <small>{product.barcode}</small>
                                </ComboboxItem>
                            )}
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
            </div>
            <div className="flex flex-col justify-between min-w-[150px]">
                <label className="block text-gray-700 text-sm font-bold mb-2">Tanggal Transaksi</label>
                <input type="date" placeholder="Tanggal Transaksi" value={Penjualan.transactionDate}
                    onChange={e => {
                        updateListPenjualan(prev =>
                            prev.map((item, i) => i === index ? { ...item, transactionDate: e.target.value } : item)
                        )
                    }}
                    className="text-sm custom-input w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm 
                                focus:outline-blue-300 "
                />
            </div>
            <div className="flex flex-col justify-between min-w-[100px]">
                <label className="block text-gray-700 text-sm font-bold mb-2">Jumlah Barang</label>
                <input type="number" placeholder="Jumlah Barang" value={Penjualan.quantity}
                    onChange={e => {
                        updateListPenjualan((prev) =>
                            prev.map((item, i) => i === index ? { ...item, quantity: Number(e.target.value) } : item)
                        )
                    }}
                    min="0"
                    className="text-sm custom-input w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm 
                                focus:outline-blue-300 "
                />
            </div>
            <div className="flex flex-col justify-between min-w-[100px]">
                <label className="block text-gray-700 text-sm font-bold mb-2">Total Harga</label>
                <input type="text" placeholder="Harga Barang"
                    value={
                        Penjualan.amount ? new Intl.NumberFormat("id-ID").format(Penjualan.amount) : ""
                    }
                    onChange={e => {
                        const rawValue = e.target.value.replace(/\./g, "");
                        updateListPenjualan(prev =>
                            prev.map((item, i) => i === index ? { ...item, amount: Number(rawValue) } : item)
                        )
                    }}
                    className="text-sm custom-input w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm 
                                focus:outline-blue-300 "
                />
            </div>
            <div className="flex flex-col justify-around items-center min-w-[100px]">
                <label className="block text-gray-700 text-sm font-bold mb-2">Lunas</label>
                <input type="checkbox" checked={Penjualan.paid}
                    onChange={e => {
                        updateListPenjualan(prev =>
                            prev.map((item, i) => i === index ? { ...item, paid: e.target.checked } : item)
                        )
                    }}
                    className="w-6 h-6"
                />
            </div>
            <div>
                <label className="invisible">Delete</label>
                <button type="button" className="close-button"
                    onClick={() => updateListPenjualan(prev => prev.filter((_, i) => i !== index))}
                    aria-label="Close">×</button>
            </div>
        </div>
    )
}