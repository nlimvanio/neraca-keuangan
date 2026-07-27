import Link from "next/link";

export default function Sidebar() {
    return (
        <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">IM</div>
          <div><strong>Inventory</strong><span>Management</span></div>
        </div>
        <nav className="nav">
          <Link href="/" className="nav-item active">
            Dashboard
          </Link>
          <Link href="#products" className="nav-item">
            Products
          </Link>
          <Link href="#movements" className="nav-item">
            Stock Movements
          </Link>
          <Link href="#categories" className="nav-item">
            Categories
          </Link>
          <Link href="#suppliers" className="nav-item">
            Suppliers
          </Link>
        </nav>
      </aside>
    )
}