"use client";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useState, useMemo, Dispatch, SetStateAction } from "react";

import { FormEvent } from "react";
import z from "zod";

import AddProductForm from "./form";
import ProductTable from "./table";


export default function Test() {
    const [showModal, setShowModal] = useState<boolean>(false);
    const [reloadTableKey, setRefreshKey] = useState(0);

    function handleProductCreated(){
        setRefreshKey((c)=>c+1)
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
                        <p className="text-xs text-[#777d85] font-bold mb-[8px] tracking-[.08em]">OVERVIEW</p>
                        <h1 className="text-3xl">Test</h1>
                        <p className="text-sm text-[#777d85]">Keep track of your products and stock levels</p>
                    </div>
                    <button className="button primary" onClick={() => setShowModal(true)}>
                        + Add Product
                    </button>
                </div>
                {/* Anything */}

                {/* Table */}
                <ProductTable refreshKey={reloadTableKey}/>
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
                        <AddProductForm setShowModal={setShowModal} onProductCreated={handleProductCreated}/>
                    </div>
                </div>
            }
        </main>
    );

}

