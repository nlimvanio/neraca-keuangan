import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
    { href: "/", label: "Home" },
    { href: "/pembelian", label: "Pembelian" },
    { href: "/biaya", label: "Biaya" },
    { href: "/penjualan", label: "Penjualan" },
    { href: "/penerimaan", label: "Penerimaan" },
    { href: "/summary", label: "Summary" },
    { href: "/test", label: "Test" }
]

export default function Sidebar() {
    const pathName = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navPages = navItems.map(item => {
        const isActive = item.href === "/" ? pathName === "/" : pathName === item.href || pathName.startsWith(`${item.href}/`);
        return (
            <Link
                key={item.href}
                href={item.href}
                className={"block py-3 px-2.5 rounded-[0.5rem] text-9xl" + (isActive ? "bg-[#292c31] text-white" : "hover:bg-[#292c31] transition-colors duration-150")}
            >
                {item.label}
            </Link>
        )
    })

    return (
        <div className={
            "flex flex-col sm:sticky" +
            " top-0 left-0 " +
            " sm:min-h-screen bg-[#17191c] text-white " +
            " w-[] sm:w-[17vw] " +
            " gap-[1em] py-[24px] px-[16px]" +
            " font-[Arial, Helvetica, sans-serif]" +
            " text-sm"
            + (mobileMenuOpen ? " fixed top-0 left-0 right-0 bottom-0 z-50 bg-[#17191c] bg-opacity-30 backdrop-blur-md" : "")
        }

        >
            <div className="flex items-center justify-between gap-3">
                {/* Brand */}
                <div className="grid grid-cols-[3.5fr_6.5fr] gap-3 px-2">
                    {/* Logo */}
                    <div className="flex items-center justify-center rounded-full bg-[#fff] font-bold text-xs text-[#17191c]">
                        IM
                    </div>
                    {/* Inventory Management */}
                    <div className="hidden sm:flex flex-col justify-center text-[0.8rem]">
                        <strong>Inventory</strong>
                        <p>Management</p>
                    </div>
                </div>
                {/* Mobile Button */}
                <div id='mobileMenu' onClick={() => setMobileMenuOpen((current) => !current)} className="flex sm:hidden items-center justify-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    >
                        <path d="M4 6h16" />
                        <path d="M4 12h16" />
                        <path d="M4 18h16" />
                    </svg>
                </div>
            </div>
            {/* Mobile Navigation */}
            <nav className={("fixed top-16 bottom-0 right-0 left-0 p-5 sm:hidden bg-transparent backdrop-blur-md") + (mobileMenuOpen ? " flex flex-col gap-1.5 text-[#a7abb1] tracking-wide" : " hidden")}>
                {navPages}
            </nav>
            {/* Desktop Navigation */}
            <nav className="hidden sm:flex flex-col gap-1.5 text-[#a7abb1] tracking-wide">
                {navPages}
            </nav>


        </div>

    )
}