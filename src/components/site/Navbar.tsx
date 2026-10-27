import Link from "next/link";
import { Logo } from "../Logo";
import { NavLinks } from "./NavLinks";

export function Navbar({ logoUrl, siteName }: { logoUrl: string; siteName: string }) {
  return (
    <nav className="nav">
      <div className="container">
        <Link className="logo" href="/" aria-label={`${siteName} — Beranda`}>
          <Logo src={logoUrl} alt={siteName} height={44} priority />
        </Link>
        <input type="checkbox" id="nav-toggle" className="nav-toggle" aria-label="Buka menu" />
        <label htmlFor="nav-toggle" className="nav-burger" aria-hidden="true">
          ☰
        </label>
        <NavLinks />
        <Link className="btn btn-gold nav-cta" href="/pesan">
          Pesan Sekarang
        </Link>
      </div>
    </nav>
  );
}
