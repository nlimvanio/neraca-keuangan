"use client";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dispatch, FormEvent, SetStateAction, useState } from "react";

type Pengeluaran = {
    transactionDate: string,
    invoiceNo: string,
    amount: number,
    type: string,
}
const initialPengeluaran = {
    transactionDate: "",
    invoiceNo: "",
    type: "O",
    amount: 0
}

export default function Home() {
    const listPengeluaran = [initialPengeluaran];
    const [isLoading, setLoading] = useState(false);
    return (
        <div className="app-shell">
            <Sidebar />
            <main className="main">
                <Card className="px-2">
                    <CardHeader className="font-bold text-2xl px-2">
                        Tambah Operasional
                    </CardHeader>
                    <div className="panel-header">
                    </div>
                    <CardContent>
                        {<RenderPengeluaran initialList={listPengeluaran} setLoading={setLoading} />}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}

async function handleSubmit(event: FormEvent<HTMLFormElement>, transactionlist: Pengeluaran[], setLoading: Dispatch<SetStateAction<boolean>>) {
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

function RenderPengeluaran(
    { initialList, setLoading }:
        { initialList: Pengeluaran[], setLoading: Dispatch<SetStateAction<boolean>> }
) {
    const [listPengeluaran, updateListPengeluaran] = useState<Pengeluaran[]>([...initialList]);
    return (
        <form onSubmit={e => handleSubmit(e, listPengeluaran, setLoading)}>
            <div className="flex flex-col justify-between w-full gap-4 p-3 ">
                {listPengeluaran.map((pengeluaran, index) =>
                    <PengeluaranRow key={index} pengeluaran={pengeluaran} index={index} updateListPengeluaran={updateListPengeluaran} />
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

function PengeluaranRow(
    { pengeluaran, index, updateListPengeluaran }:
        {
            pengeluaran: Pengeluaran;
            index: number;
            updateListPengeluaran: Dispatch<SetStateAction<Pengeluaran[]>>
        }
) {
    return (
        <div className="flex flex-row justify-between w-full gap-4 p-3 overflow-x-auto border-b border-gray-300" key={index}>
            <div className="flex justify-start gap-4">
                <div className="flex flex-col justify-between">
                    <label className="block text-gray-700 text-sm font-bold mb-2">No. Invoice</label>
                    <input type="text" placeholder="Nomor Invoice" value={pengeluaran.invoiceNo}
                        onChange={e => {
                            updateListPengeluaran(
                                prev => prev.map((item, i) => i === index ? { ...item, invoiceNo: e.target.value } : item)
                            )
                        }}
                        className="text-sm custom-input w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm 
                                focus:outline-blue-300 bg-gray-100"
                    />
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
            </div>
            <div className="flex items-center justify-center pe-3">
                <label className="invisible">Delete</label>
                <button type="button" className="close-button"
                    onClick={() => updateListPengeluaran(prev => prev.filter((_, i) => i !== index))}
                    aria-label="Close">×</button>
            </div>
        </div>
    )
}