import { useState, useMemo, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationEllipsis,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";



interface Produk {
    id: number;
    name: string;
    price: string;
    barcode: string;
    stock: number;
};

type ProductTableProps = {
    refreshKey: number;
}

export default function ProductTable({
    refreshKey,
}:ProductTableProps) {
    const [products, setProducts] = useState<Produk[]>([]);

    //Table variables
    const [loading, setLoading] = useState(true);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const pageNumbers = getPageNumbers(page, totalPages);

    const [search, setSearch] = useState("");

    const offset = (page - 1) * pageSize;
    // setLoading(true);
    useEffect(() => {
        console.log("useEffect running");
        async function loadProducts() {
            console.log("Calling getProducts()");
            // const data = await getProducts();
            const result = await getProducts(
                page,
                pageSize,
                search
            );
            if (result) {
                setProducts(result.data);
                setTotal(result.total);
                setTotalPages(result.totalPages);
            }
            setLoading(false);
        }

        loadProducts();
    }, [page, search, refreshKey]);

    const filteredProducts = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return products;

        return products.filter((product) =>
            [product.name, product.barcode].some((value) =>
                value.toLowerCase().includes(query)
            )
        );
    }, [products, search]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Produk</CardTitle>
            </CardHeader>
            <div className="panel-header">
                <Input
                    placeholder="Cari produk ... (Cth nama, barcode)"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                />
            </div>

            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Nama Produk</TableHead><TableHead>Harga</TableHead><TableHead>Barcode</TableHead><TableHead>Stok</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {loading ? (
                            (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Skeleton className="h-4 w-40" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-4 w-32" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-4 w-20" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-4 w-20" />
                                        </TableCell>
                                    </TableRow>
                                )))
                        ) : filteredProducts.length > 0 ? filteredProducts.map((product) => {
                            return (
                                <TableRow key={product.id}>
                                    <TableCell><strong>{product.name}</strong></TableCell>
                                    <TableCell>Rp. {product.price}</TableCell>
                                    <TableCell>{product.barcode}</TableCell>
                                    <TableCell>{product.stock}</TableCell>
                                </TableRow>
                            );
                        }) : (
                            <TableRow><TableCell className="empty-state" colSpan={3}>No products found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
                <Pagination className="mt-4">

                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (page > 1) {
                                        setPage(page - 1);
                                    }
                                }}
                            />
                        </PaginationItem>
                        {pageNumbers.map((item, index) => (
                            <PaginationItem key={index}>
                                {item === "..." ? (
                                    <PaginationEllipsis />
                                ) : (
                                    <PaginationLink
                                        href="#"
                                        isActive={page === item}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setPage(item);
                                        }}
                                    >
                                        {item}
                                    </PaginationLink>
                                )}
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => {
                                    // loading(true)
                                    e.preventDefault();
                                    if (page < totalPages) {
                                        setPage(page + 1);
                                    }
                                }}
                            />
                        </PaginationItem>
                        Total Produk {total}
                    </PaginationContent>
                </Pagination>
            </CardContent>
        </Card>
    )

}

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
