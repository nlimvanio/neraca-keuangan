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
          Home
        </Link>
        <Link href="#products" className="nav-item">
          Pembelian
        </Link>
        <Link href="#movements" className="nav-item">
          Biaya
        </Link>
        <Link href="#categories" className="nav-item">
          Penjualan
        </Link>
        <Link href="#suppliers" className="nav-item">
          Penerimaan
        </Link>
        <Link href="#Summary" className="nav-item">
          Summary
        </Link>
      </nav>
    </aside>
  )
}