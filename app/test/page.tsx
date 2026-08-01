"use client";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@base-ui/react";
import { FormEvent } from "react";
import z from "zod";

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
};

type ProductFormErrors = Partial<Record<keyof ProductForm, string>>;

const addProductSchema = z.object({
    name: z.string().min(1, { message: "Name cannot be empty" }),
    price: z.string().min(1, { message: "Price cannot be empty" }),
    barcode: z.string().min(1, { message: "Barcode cannot be empty" })
})

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


export default function Test() {
    const pathName = usePathname();
    const [showModal, setShowModal] = useState(false);
    const [products, setProducts] = useState<Produk[]>([]);

    //Table variables
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageNumbers = getPageNumbers(page, totalPages);
    const [search, setSearch] = useState("");

    //Form
    const [form, setForm] = useState<ProductForm>(emptyForm);
    const [formErrors, setErrors] = useState<ProductFormErrors>({});

    function updateForm(field: keyof ProductForm, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
    }


    //Submit Form Function
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const validation = addProductSchema.safeParse(form);

        if (!validation.success) {
            const errors = validation.error.flatten().fieldErrors;
            setErrors({
                name: errors.name?.[0],
                price: errors.price?.[0],
                barcode: errors.barcode?.[0],
            });

            return;
        }

        setErrors({});

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
        <main className="flex-1 min-h-screen flex flex-col sm:flex-row">
            {/* Sidebar */}
            <Sidebar />
            {/* Main Content */}
            <div className="flex-1 flex-col p-8 gap-4 text-[#17191C]">
                {/* Header */}
                <div className="flex flex-row justify-between items-center mb-7">
                    <div>
                        <h1 className="text-3xl ">Test</h1>
                        <p className="text-sm font-[#777d85]">Keep track of your products and stock levels</p>
                    </div>
                    <button className="button primary" onClick={() => setShowModal(true)}>
                        + Add Product
                    </button>
                </div>
                {/* Anything */}
            </div>

            {/* Modal */}
            {showModal &&
                /* Modal Background */
                <div
                    className="fixed flex items-center justify-center p-[20px] bg-transparent bg-opacity-45 inset-0 z-100 backdrop-blur-[2px]"
                    onClick={() => setShowModal(false)}
                >
                    {/* Modal Card */}
                    <div id="Modal"
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="rounded-2xl bg-[#ffffff] shadow-[0_20px_60px_rgba(0,0,0,0.2)] w-full max-w-[560px] my-auto"
                    >
                        {/* Modal Header */}
                        <div className="flex justify-between items-center gap- p-[22px] border-b-[1px] border-[#e5e7eb]">
                            <div>
                                <h3 className="text-xl ">Add Product</h3>
                                <p className="text-sm font-[#777d85]">Add a new product to your inventory</p>
                            </div>
                            {/* Close Button */}
                            <div
                                className="flex items-center justify-center w-8 h-8 bg-[#f2f3f4] text-[#555] cursor-pointer rounded-md text-[22px]"
                                onClick={() => setShowModal(false)}
                            >
                                x
                            </div>
                        </div>
                        {/* Form */}
                        {/* Form Wrapper */}
                        <form
                            className="p-[22px]"
                            onSubmit={handleSubmit}
                        >
                            {/* Form Grid */}
                            <div className="grid grid-cols-auto sm:grid-cols-2 gap-4">
                                {/* Input */}
                                <div className="col-span-2 flex flex-col gap-2 text-[#555] text-sm">
                                    {/* Label */}
                                    <p className="font-bold">Product Name</p>
                                    {/* Input Field */}
                                    <Input
                                        id="productName"
                                        value={form.name}
                                        onChange={(e) => updateForm("name", e.target.value)}
                                        placeholder="Enter product name"
                                        className={`h-12 ${
                                            formErrors.name
                                            ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20"
                                            : ""
                                        }`}
                                    />
                                    {/* Error text */}
                                    {formErrors.name && (<p className="text-xs text-red-500">{formErrors.name}</p>)}
                                </div>
                                {/* Input */}
                                <div className="flex flex-col gap-2 text-[#555] text-sm ">
                                    {/* Label */}
                                    <p className="font-bold">Harga</p>
                                    {/* Input Field */}
                                    <Input
                                        id="harga"
                                        value={form.price}
                                        onChange={(e) => updateForm("price", e.target.value)}
                                        placeholder="Enter price"
                                        className={`h-12 ${
                                            formErrors.price
                                            ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20"
                                            : ""
                                        }`}
                                    />
                                    {/* Error text */}
                                    {formErrors.price && (<p className="text-xs text-red-500">{formErrors.price}</p>)}
                                </div>
                                {/* Input */}
                                <div className="flex flex-col gap-2 text-[#555] text-sm">
                                    {/* Label */}
                                    <p className="font-bold">Barcode</p>
                                    {/* Input Field */}
                                    <Input
                                        id="barcode"
                                        value={form.barcode}
                                        onChange={(e) => updateForm("barcode", e.target.value)}
                                        placeholder="Enter barcode"
                                        className={`h-12 ${
                                            formErrors.barcode
                                            ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20"
                                            : ""
                                        }`}
                                    />
                                    {/* Error text */}
                                    {formErrors.barcode && (<p className="text-xs text-red-500">{formErrors.barcode}</p>)}
                                </div>
                            </div>
                            {/* Buttons */}
                            <div className="flex flex-row mt-6 justify-end gap-2">
                                <Button
                                    className="bg-white text-[#17191c] border border[#dfe2e5] rounded-lg cursor-pointer font-extrabold py-[11px] px-[16px]"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-[#17191c] text-white rounded-lg cursor-pointer font-extrabold py-[11px] px-[16px]"
                                >
                                    Add Product
                                </Button>
                            </div>
                        </form >
                    </div>
                </div>
            }
        </main>
    );

}