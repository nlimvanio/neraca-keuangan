"use client";

import { useState } from "react";

export default function ProductsPage() {
    const [barcode, setBarcode] = useState("");
    const [name, setName] = useState("");
    const [products, setProducts] = useState([]);

    const searchProducts = async () => {
        const params = new URLSearchParams();

        if (barcode) params.append("barcode", barcode);
        if (name) params.append("name", name);

        const response = await fetch(`/api/product?${params.toString()}`);

        const data = await response.json();

        console.log(data);

        setProducts(data);

    };

    return (
        <>
            <input
                placeholder="Barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
            />

            <input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <button onClick={searchProducts}>Search</button>

            {products.map((product: any) => (
                <div key={product.barcode}>
                    <h3>{product.name}</h3>
                    <p>{product.barcode}</p>
                    <p>{product.price}</p>
                    <p>{product.id}</p>
                </div>
            ))}


        </>
    );
}


