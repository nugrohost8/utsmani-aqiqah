import { Suspense } from "react";
import { SideNav } from "@/components/admin/SideNav";
import { Logo } from "@/components/Logo";
import { RESOURCES } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/dal";
import { getSettings } from "@/lib/settings";
import { logout } from "../actions";

const NAV = [
  {
    label: "Utama",
    items: [
      { href: "/admin", label: "Dashboard", icon: "🏠" },
      { href: "/admin/pesanan", label: "Pesanan Masuk", icon: "📥" },
      { href: "/admin/crm", label: "CRM", icon: "🎧" },
      { href: "/admin/whatsapp", label: "Log WhatsApp", icon: "📱" },
    ],
  },
  { label: "Konten", items: Object.entries(RESOURCES)
      .filter(([, r]) => !r.hidden)
      .map(([key, r]) => ({ href: `/admin/${key}`, label: r.label, icon: r.icon })),
  },
  { label: "Sistem", items: [{ href: "/admin/pengaturan", label: "Pengaturan", icon: "⚙️", also: ["/admin/slider"] }] },
];

// Layout ini tidak membaca sesi di level atas: sidebar ikut static shell, sedangkan info admin dan isi
// halaman (yang memanggil requireAdmin sendiri) di-stream di balik <Suspense> agar navigasi tetap instan.

async function Brand() {
  const settings = await getSettings();
  return <Logo src={settings.logo_url} alt={settings.site_name} height={38} />;
}

async function AdminInfo() {
  const admin = await requireAdmin();
  return (
    <>
      <div>{admin.name}</div>
      <div style={{ color: "#6b75a3" }}>{admin.email}</div>
    </>
  );
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <div className="brand">
          <Suspense fallback={<div style={{ height: 38 }} />}>
            <Brand />
          </Suspense>
        </div>
        <SideNav groups={NAV} />
        <div className="side-foot">
          <Suspense fallback={<div style={{ color: "#6b75a3" }}>…</div>}>
            <AdminInfo />
          </Suspense>
          <form action={logout}>
            <button>Keluar →</button>
          </form>
          <a href="/" target="_blank" style={{ display: "block", marginTop: 8, color: "#c9d1e8" }}>
            Lihat website ↗
          </a>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
