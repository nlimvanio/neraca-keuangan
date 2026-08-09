"use client"

import { useState, Dispatch, SetStateAction, FormEvent  } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@base-ui/react";
import z from "zod";


type ProductFormErrors = Partial<Record<keyof ProductForm, string>>;
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

const addProductSchema = z.object({
    name: z.string().min(1, { message: "Name cannot be empty" }),
    price: z.string().min(1, { message: "Price cannot be empty" }),
    barcode: z.string().min(1, { message: "Barcode cannot be empty" })
})

type FormProps = {
    setShowModal:Dispatch<SetStateAction<boolean>>,
    onProductCreated: ()=>void
}

export default function AddProductForm(
    {setShowModal, onProductCreated}: FormProps
) {
    //Form
    const [form, setForm] = useState<ProductForm>(emptyForm);
    const [formErrors, setErrors] = useState<ProductFormErrors>({});
    
    function updateForm(field: keyof ProductForm, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
    }
    return (
        /* Form Wrapper */
        <form
            className="p-[22px]"
            onSubmit={async (e) => {
                try {
                    handleSubmit(e, setErrors, form)


                    // Clear form
                    setForm(emptyForm);
                    onProductCreated();
                    setShowModal(false);
                } catch (err) { }
            }}
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
                        className={`h-12 ${formErrors.name
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
                        className={`h-12 ${formErrors.price
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
                        className={`h-12 ${formErrors.barcode
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
    )
}

//Submit Form Function
async function handleSubmit(
    event: FormEvent<HTMLFormElement>, setErrors: Dispatch<SetStateAction<ProductFormErrors>>,
    form: ProductForm
) {
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



    } catch (err) {
        console.error(err);
        alert("Failed to save product");
    }
}