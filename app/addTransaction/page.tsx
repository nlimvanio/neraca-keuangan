"use client";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { Dispatch, FormEvent, SetStateAction, useEffect, useState } from "react";
import z, { number } from "zod";
import { tr } from "zod/v4/locales";

interface Product {
    id: number;
    name: string;
    barcode: string;
}

export type Penjualan = {
    productName: string,
    productId: number | null,
    transactionDate: string,
    quantity: number,
    type: string,
    paid: boolean
}

const initialPenjualan: Penjualan = {
    productName: "",
    productId: null,
    transactionDate: "",
    quantity: 0,
    type: "I",
    paid: true
}

const penjualanValidation = z.object({
    productName: z
        .string()
        .trim()
        .min(1, "Nama produk wajib diisi"),

    productId: z
        .number({
            error: "Produk wajib dipilih"
        })
        .int()
        .positive("Produk wajib dipilih"),

    transactionDate: z
        .string()
        .date("Tanggal transaksi tidak valid"),

    quantity: z
        .number()
        .int("Jumlah barang harus berupa bilangan bulat")
        .positive("Jumlah barang harus lebih dari 0"),

    type: z.literal("I"),

    paid: z.boolean()
})

export type Pembelian = {
    productName: string,
    productId: number | null,
    transactionDate: string,
    quantity: number,
    invoiceNo: string
    type: string,
    paid: boolean
}
const initialPembelian: Pembelian = {
    productName: "",
    productId: null,
    transactionDate: "",
    quantity: 0,
    invoiceNo: "",
    type: "O",
    paid: true
}

const pembelianValidation = z.object({
    productName: z
        .string()
        .trim()
        .min(1, "Nama produk wajib diisi"),

    productId: z
        .number({
            error: "Produk wajib dipilih"
        })
        .int()
        .positive("Produk wajib dipilih"),

    transactionDate: z
        .string()
        .date("Tanggal transaksi tidak valid"),

    quantity: z
        .number()
        .int("Jumlah barang harus berupa bilangan bulat")
        .positive("Jumlah barang harus lebih dari 0"),

    invoiceNo: z
        .string()
        .trim()
        .min(1, "Nomor invoice wajib diisi"),

    type: z.literal("O"),

    paid: z.boolean()
})

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
                    <CardHeader className="py-2 px-4">
                        <div className="font-bold text-2xl ">
                            Add Transaksi
                        </div>
                    </CardHeader>
                    <div className="panel-header">
                        <div className="flex flex-row w-ful justify-between">
                            <div className="flex flex-col gap-4 m-2 justify-center">
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
                        <div>
                            <Button type="submit" form={transactionType === "pembelian" ? "form-pembelian" : "form-penjualan"}
                                className="button primary h-10"
                            >
                                {isLoading ? "Menyimpan..." : "Simpan"}
                            </Button>
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

async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
    transactionlist: Pembelian[] | Penjualan[],
    setLoading: Dispatch<SetStateAction<boolean>>,
    transactionType: string,
    setError: Dispatch<SetStateAction<Record<number, Record<string, string>>>>,
    resetList: () => void
) {
    event.preventDefault();

    try {
        setLoading(true);

        if (transactionlist.length < 1) {
            alert("Minimal 1 transaksi untuk disimpan");
            return;
        }

        const listValidation = transactionType === "pembelian" ? z.array(pembelianValidation) : z.array(penjualanValidation);
        const result = listValidation.safeParse(transactionlist);

        if (!result.success) {
            const newErrors: Record<number, Record<string, string>> = {}
            for (const issue of result.error.issues) {
                const rowIndex = issue.path[0] as number;
                const field = issue.path[1] as string;

                if (!newErrors[rowIndex]) {
                    newErrors[rowIndex] = {}
                }
                newErrors[rowIndex][field] = issue.message
            }
            setError(newErrors)
            console.log(result.error.issues);
            return;
        }
        setError({});
        const res = await fetch("/api/transaction", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                transactions: transactionlist,
                transactionType: transactionType
            }
            ),
        });

        const response = await res.json();
        if (!res.ok) {
            throw new Error(response.message || "Failed to save transaction.");
        }

        console.log("Transaction created:", response);
        resetList();

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
    const [pembelianErrors, setPembelianErrors] = useState<
        Record<number, Record<string, string>>
    >({})
    const resetListPembelian = () => updateListPembelian([initialPembelian])
    return (
        <form onSubmit={e => handleSubmit(e, listPembelian, setLoading, "pembelian", setPembelianErrors, resetListPembelian)} id="form-pembelian">
            <div className="flex flex-col justify-between w-full gap-4 p-3 ">
                {listPembelian.map((pembelian, index) =>
                    <PembelianRow
                        key={index}
                        pembelian={pembelian}
                        index={index}
                        updateListPembelian={updateListPembelian}
                        errors={pembelianErrors[index]}
                    />
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
    { pembelian, index, updateListPembelian, errors }:
        {
            pembelian: Pembelian;
            index: number;
            updateListPembelian: Dispatch<SetStateAction<Pembelian[]>>,
            errors: Record<string, string>
        }
) {
    const [searchProductResults, setProduct] = useState<Product[]>([]);
    const [productLoading, setProductLoading] = useState(false);
    const [searchText, setSearch] = useState("");
    useEffect(() => {
        setSearch(pembelian.productName);
    }, [pembelian.productName]);
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
                {errors?.invoiceNo && (
                    <p className="text-sm text-red-500 mt-1">
                        {errors.invoiceNo}
                    </p>
                )}
            </div>
            <div className="flex flex-col justify-between min-w-[150px]">
                <label className="block text-gray-700 text-sm font-bold mb-2">Nama produk</label>
                {/* Nama produk */}
                <Combobox
                    items={searchProductResults}
                    value={pembelian.productName}
                    onValueChange={e => {
                        const selectedValue = e ?? "";
                        const selectedProduct = searchProductResults.find(product => product.name === selectedValue)
                        setSearch(selectedValue)
                        updateListPembelian(prev =>
                            prev.map((item, i) => i === index ? { ...item, productName: selectedValue, productId: selectedProduct?.id ?? null } : item)
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
                    {errors?.productName && (
                        <p className="text-sm text-red-500 mt-1">
                            {errors.productName}
                        </p>
                    )}
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
                {errors?.transactionDate && (
                    <p className="text-sm text-red-500 mt-1">
                        {errors.transactionDate}
                    </p>
                )}
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
                {errors?.quantity && (
                    <p className="text-sm text-red-500 mt-1">
                        {errors.quantity}
                    </p>
                )}
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
    const [penjualanErrors, setPenjualanErrors] = useState<
        Record<number, Record<string, string>>
    >({});
    const resetListPenjualan = () => updateListPenjualan([initialPenjualan])

    return (
        <form onSubmit={e => handleSubmit(e, listPenjualan, setLoading, "penjualan", setPenjualanErrors, resetListPenjualan)} id="form-penjualan">
            <div className="flex flex-col justify-between w-full gap-4 p-3">
                {listPenjualan.map((penjualan, index) =>
                    <PenjualanRow key={index} penjualan={penjualan} index={index} updateListPenjualan={updateListPenjualan} errors={penjualanErrors[index]} />
                )}
                <div className="flex items-center justify-center w-full">
                    <button type="button" onClick={() => updateListPenjualan(prev => [...prev, initialPenjualan])} className="button primary">
                        Tambah Baris
                    </button>
                </div>
            </div>
        </form>
    )
}

function PenjualanRow(
    { penjualan, index, updateListPenjualan, errors }:
        {
            penjualan: Penjualan;
            index: number;
            updateListPenjualan: Dispatch<SetStateAction<Penjualan[]>>,
            errors?: Record<string, string>
        }
) {
    const [searchProductResults, setProduct] = useState<Product[]>([]);
    const [productLoading, setProductLoading] = useState(false);
    const [searchText, setSearch] = useState("");
    useEffect(() => {
        setSearch(penjualan.productName);
    }, [penjualan.productName]);

    const search = searchProducts(setProduct, setProductLoading);
    return (
        <div className="flex flex-row justify-between w-full gap-4 pt-3 pb-5 overflow-x-auto border-b border-gray-300" key={index}>
            <div className="flex flex-col justify-between min-w-[150px]">
                <label className="block text-gray-700 text-sm font-bold mb-2">Nama produk</label>
                {/* Nama produk */}
                <Combobox
                    items={searchProductResults}
                    value={penjualan.productName}
                    onValueChange={e => {
                        const selectedValue = e ?? "";
                        setSearch(selectedValue)
                        const selectedProduct = searchProductResults.find(product => product.name === selectedValue)
                        updateListPenjualan(prev =>
                            prev.map((item, i) => i === index
                                ? { ...item, productName: selectedValue, productId: selectedProduct?.id ?? null }
                                : item
                            )
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
                    {errors?.productName && (
                        <p className="text-sm text-red-500 mt-1">
                            {errors.productName}
                        </p>
                    )}
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
                <input type="date" placeholder="Tanggal Transaksi" value={penjualan.transactionDate}
                    onChange={e => {
                        updateListPenjualan(prev =>
                            prev.map((item, i) => i === index ? { ...item, transactionDate: e.target.value } : item)
                        )
                    }}
                    className="text-sm custom-input w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm 
                                focus:outline-blue-300 "
                />
                {errors?.transactionDate && (
                    <p className="text-sm text-red-500 mt-1">
                        {errors.transactionDate}
                    </p>
                )}
            </div>
            <div className="flex flex-col justify-between min-w-[100px]">
                <label className="block text-gray-700 text-sm font-bold mb-2">Jumlah Barang</label>
                <input type="number" placeholder="Jumlah Barang" value={penjualan.quantity}
                    onChange={e => {
                        updateListPenjualan((prev) =>
                            prev.map((item, i) => i === index ? { ...item, quantity: Number(e.target.value) } : item)
                        )
                    }}
                    min="0"
                    className="text-sm custom-input w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm 
                                focus:outline-blue-300 "
                />
                <p className="text-sm text-red-500 mt-1">
                    {errors?.quantity}
                </p>
            </div>
            <div className="flex flex-col justify-around items-center min-w-[100px]">
                <label className="block text-gray-700 text-sm font-bold mb-2">Lunas</label>
                <input type="checkbox" checked={penjualan.paid}
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