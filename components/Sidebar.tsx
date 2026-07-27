import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/pembelian", label: "Pembelian" },
  { href: "/biaya", label: "Biaya" },
  { href: "/penjualan", label: "Penjualan" },
  { href: "/penerimaan", label: "Penerimaan" },
  { href: "/summary", label: "Summary" }
]

export default function Sidebar() {
  const pathName = usePathname();
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">IM</div>
        <div><strong>Inventory</strong><span>Management</span></div>
      </div>
      <nav className="nav">
        {
          navItems.map((item) => {
            const isActive = 
            item.href === "/"
              ? pathName === "/"
              : pathName === item.href ||
                pathName.startsWith(`${item.href}/`);
            
            return (
              <Link
                href={item.href}
                className={`nav-item ${isActive ? "active" : ""}`}
              >
                {item.label}
              </Link>
            )
          })
        }
      </nav>
    </aside>
  )
}