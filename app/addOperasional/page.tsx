"use client";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import z from "zod";

export type Pengeluaran = {
    transactionDate: string
    amount: number,
    type: string,
}
const initialPengeluaran = {
    transactionDate: "",
    type: "O",
    amount: 0
}

const pengeluaranValidation = z.object({
    transactionDate: z
        .string()
        .date("Tanggal transaksi tidak valid"),

    amount: z.number().min(1, "Jumlah pengeluaran wajib diisi"),
    type: z.literal("O"),
})

export default function Home() {
    const listPengeluaran = [initialPengeluaran];
    const [isLoading, setLoading] = useState(false);
    return (
        <div className="app-shell">
            <Sidebar />
            <main className="main">
                <Card className="px-2">
                    <CardHeader className="py-2 px-4">
                        <div className="font-bold text-2xl ">
                            Tambah Pengeluaran
                        </div>
                    </CardHeader>
                    <div className="flex flex-row justify-end p-5 border-b-1">
                        <Button type="submit" form="form-pengeluaran"
                            className="button primary h-10"
                        >
                            {isLoading ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </div>
                    <CardContent>
                        {<RenderPengeluaran initialList={listPengeluaran} setLoading={setLoading} />}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}

async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
    transactionlist: Pengeluaran[],
    setLoading: Dispatch<SetStateAction<boolean>>,
    setError: Dispatch<SetStateAction<
        Record<number, Record<string, string>
        >>>,
    resetList: () => void
) {
    event.preventDefault();

    try {
        setLoading(true);
        if (transactionlist.length < 1) {
            alert("Minimal 1 transaksi untuk disimpan");
            return;
        }

        const listValidation = z.array(pengeluaranValidation);
        const result = listValidation.safeParse(transactionlist);

        if (!result.success) {
            const newErrors: Record<number, Record<string, string>> = {};
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
        setError([])
        const res = await fetch("/api/transaction", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                transactions: transactionlist,
                transactionType: "pengeluaran"
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

function RenderPengeluaran(
    { initialList, setLoading }:
        { initialList: Pengeluaran[], setLoading: Dispatch<SetStateAction<boolean>> }
) {
    const [listPengeluaran, updateListPengeluaran] = useState<Pengeluaran[]>([...initialList]);
    const [pengeluaranErrors, setPengeluaranErrors] = useState<Record<number, Record<string, string>>>({});
    const resetListPengeluaran = () => updateListPengeluaran([initialPengeluaran])
    return (
        <form onSubmit={e => handleSubmit(e, listPengeluaran, setLoading, setPengeluaranErrors, resetListPengeluaran)} id="form-pengeluaran">
            <div className="flex flex-col justify-between w-full gap-4 p-3 ">
                {listPengeluaran.map((pengeluaran, index) =>
                    <PengeluaranRow
                        key={index}
                        pengeluaran={pengeluaran}
                        index={index}
                        updateListPengeluaran={updateListPengeluaran} errors={pengeluaranErrors[index]}
                    />
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
    { pengeluaran, index, updateListPengeluaran, errors }:
        {
            pengeluaran: Pengeluaran;
            index: number;
            updateListPengeluaran: Dispatch<SetStateAction<Pengeluaran[]>>,
            errors: Record<string, string>
        }
) {
    return (
        <div className="flex flex-row justify-between w-full gap-4 p-3 overflow-x-auto border-b border-gray-300" key={index}>
            <div className="flex justify-start gap-4">
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
                    {errors?.transactionDate &&
                        <p className="text-sm text-red-500 mt-1">
                            {errors.transactionDate}
                        </p>
                    }
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
                    {errors?.amount &&
                        <p className="text-sm text-red-500 mt-1">
                            {errors.amount}
                        </p>
                    }
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