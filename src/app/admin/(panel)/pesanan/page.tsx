import Link from "next/link";
import { Suspense } from "react";
import { PageLoading } from "@/components/admin/PageLoading";
import { StatusBadge } from "@/components/admin/WaLog";
import type { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { formatDate, waLink } from "@/lib/format";
import { GENDER_LABEL, STATUS_LABEL } from "@/lib/order";

const PER_PAGE = 30;

async function OrdersPageContent({ searchParams }: PageProps<"/admin/pesanan">) {
  await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const page = Math.max(1, Number(sp.page) || 1);
  const f = typeof sp.f === "string" ? sp.f : "";
  const where: Prisma.OrderWhereInput = {
    ...(q ? { OR: [{ code: { contains: q } }, { customerName: { contains: q } }, { phone: { contains: q } }, { babyName: { contains: q } }] } : {}),
    ...(f === "tanpa-crm" ? { crmId: null, status: { in: ["BARU", "DIPROSES"] } } : Object.hasOwn(STATUS_LABEL, f) ? { status: f as keyof typeof STATUS_LABEL } : {}),
  };

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({ where, include: { crm: true }, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const href = (p: number) => `/admin/pesanan?${new URLSearchParams({ ...(q ? { q } : {}), ...(f ? { f } : {}), page: String(p) })}`;

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>📥 Pesanan Masuk</h1>
          <p>{total} pesanan dari formulir website</p>
        </div>
        <form style={{ display: "flex", gap: 8 }}>
          <select className="a-input" name="f" defaultValue={f} style={{ width: 170 }}>
            <option value="">Semua status</option>
            <option value="tanpa-crm">Belum ada CRM</option>
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <input className="a-input" name="q" defaultValue={q} placeholder="Cari kode, nama, no. HP…" style={{ width: 260 }} />
          <button className="a-btn ghost">Cari</button>
        </form>
      </div>
      {sp.deleted && <div className="a-flash ok">Pesanan dihapus.</div>}
      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>Kode</th>
              <th>Pemesan</th>
              <th>Bayi</th>
              <th>Paket</th>
              <th>Tanggal acara</th>
              <th>Status</th>
              <th>CRM</th>
              <th>Masuk</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={9} style={{ color: "var(--a-muted)" }}>
                  Tidak ada pesanan.
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id}>
                <td>
                  <Link className="link" href={`/admin/pesanan/${o.id}`}>
                    {o.code}
                  </Link>
                </td>
                <td>
                  {o.customerName}
                  <br />
                  <small style={{ color: "var(--a-muted)" }}>{o.phone}</small>
                </td>
                <td>
                  {o.babyName}
                  <br />
                  <small style={{ color: "var(--a-muted)" }}>{GENDER_LABEL[o.babyGender]}</small>
                </td>
                <td>
                  {o.packageName} × {o.quantity}
                </td>
                <td>{formatDate(o.eventDate)}</td>
                <td>
                  <StatusBadge status={o.status} />
                </td>
                <td>{o.crm?.name ?? <span className="badge warn">Belum</span>}</td>
                <td>{formatDate(o.createdAt)}</td>
                <td className="actions">
                  <a className="a-btn sm ghost" href={waLink(o.phone)} target="_blank" rel="noopener">
                    WA
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="a-pager">
          {page > 1 && (
            <Link className="a-btn sm ghost" href={href(page - 1)}>
              ← Sebelumnya
            </Link>
          )}
          <span style={{ alignSelf: "center", color: "var(--a-muted)" }}>
            Halaman {page} / {pages}
          </span>
          {page < pages && (
            <Link className="a-btn sm ghost" href={href(page + 1)}>
              Berikutnya →
            </Link>
          )}
        </div>
      )}
    </>
  );
}

// Suspense di dalam page (bukan loading.tsx) agar tetap berada di bawah layout bersama pada navigasi klien.
export default function OrdersPage(props: PageProps<"/admin/pesanan">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <OrdersPageContent {...props} />
    </Suspense>
  );
}
