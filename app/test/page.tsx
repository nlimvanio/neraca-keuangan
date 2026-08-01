"use client";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/pembelian", label: "Pembelian" },
  { href: "/biaya", label: "Biaya" },
  { href: "/penjualan", label: "Penjualan" },
  { href: "/penerimaan", label: "Penerimaan" },
  { href: "/summary", label: "Summary" },
  { href: "/test", label: "Test" }
]

export default function Test(){
    const pathName = usePathname();
    return (
        <main className="flex min-h-screen">
           {/* Sidebar */}
           <Sidebar />
           {/* Main Content */}
        </main>
    );

}