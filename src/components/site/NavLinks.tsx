"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

const LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/#tentang", label: "Tentang" },
  { href: "/paket", label: "Paket" },
  { href: "/#menu", label: "Menu" },
  { href: "/blog", label: "Blog" },
  { href: "/#kontak", label: "Kontak" },
];

function Links({ pathname }: { pathname?: string }) {
  return (
    <div className="nav-menu">
      {LINKS.map((link) => {
        const active =
          pathname != null && (link.href === pathname || (link.href !== "/" && !link.href.includes("#") && pathname.startsWith(link.href)));
        return (
          <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined}>
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}

function ActiveLinks() {
  return <Links pathname={usePathname()} />;
}

/** Penanda menu aktif butuh URL saat runtime; fallback berisi link yang sama tanpa penanda. */
export function NavLinks() {
  return (
    <Suspense fallback={<Links />}>
      <ActiveLinks />
    </Suspense>
  );
}
