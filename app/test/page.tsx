"use client";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@base-ui/react";

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



export default function Test() {
    const pathName = usePathname();
    const [showModal, setShowModal] = useState(false);

    //Form
    const [form, setForm] = useState<ProductForm>(emptyForm)
    function updateForm(field: keyof ProductForm, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
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
                        <div className="p-[22px]">
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
                                        className="h-12"
                                    />
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
                                        className="h-12"
                                    />
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
                                        className="h-12"
                                    />
                                </div>
                            </div>
                            {/* Buttons */}
                            <div className="flex flex-row mt-6 justify-end gap-2">
                                <Button
                                    className="bg-white text-[#17191c] border border[#dfe2e5] rounded-lg cursor-pointer font-extrabold py-[11px] px-[16px]"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="bg-[#17191c] text-white rounded-lg cursor-pointer font-extrabold py-[11px] px-[16px]"
                                >
                                    Add Product
                                </Button>
                            </div>
                        </div >
                    </div>
                </div>
            }
        </main>
    );

}