import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-head" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div className="layer starfield" />
      <div className="container">
        <span className="tag">404</span>
        <h1>Halaman Tidak Ditemukan</h1>
        <p>Halaman yang Anda cari mungkin sudah dipindahkan atau tidak tersedia.</p>
        <p style={{ marginTop: 28 }}>
          <Link className="btn btn-gold" href="/">
            Kembali ke Beranda
          </Link>
        </p>
      </div>
    </div>
  );
}
