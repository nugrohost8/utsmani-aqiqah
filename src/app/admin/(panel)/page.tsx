import Link from "next/link";
import { Suspense } from "react";
import { PageLoading } from "@/components/admin/PageLoading";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { daysAgo, formatDate } from "@/lib/format";

async function DashboardPageContent() {
  const admin = await requireAdmin();
  const weekAgo = daysAgo(7);
  const [orders, ordersWeek, packages, posts, testimonials, latest] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.package.count({ where: { active: true } }),
    prisma.post.count({ where: { published: true } }),
    prisma.testimonial.count({ where: { active: true } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  const stats = [
    { label: "Total pesanan", value: orders, href: "/admin/pesanan" },
    { label: "Pesanan 7 hari terakhir", value: ordersWeek, href: "/admin/pesanan" },
    { label: "Paket aktif", value: packages, href: "/admin/paket" },
    { label: "Artikel terbit", value: posts, href: "/admin/blog" },
    { label: "Testimoni tampil", value: testimonials, href: "/admin/testimoni" },
  ];

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Assalamu&apos;alaikum, {admin.name}</h1>
          <p>Ringkasan website Utsmani Aqiqah.</p>
        </div>
      </div>
      <div className="a-cards">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="a-card a-stat">
            <b>{s.value}</b>
            <span>{s.label}</span>
          </Link>
        ))}
      </div>
      <h2 style={{ fontSize: 18, marginBottom: 12 }}>Pesanan terbaru</h2>
      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>Kode</th>
              <th>Pemesan</th>
              <th>Paket</th>
              <th>Tanggal acara</th>
              <th>Masuk</th>
            </tr>
          </thead>
          <tbody>
            {latest.length === 0 && (
              <tr>
                <td colSpan={5} style={{ color: "var(--a-muted)" }}>
                  Belum ada pesanan.
                </td>
              </tr>
            )}
            {latest.map((o) => (
              <tr key={o.id}>
                <td>
                  <Link className="link" href={`/admin/pesanan/${o.id}`}>
                    {o.code}
                  </Link>
                </td>
                <td>{o.customerName}</td>
                <td>{o.packageName}</td>
                <td>{formatDate(o.eventDate)}</td>
                <td>{formatDate(o.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// Suspense di dalam page (bukan loading.tsx) agar tetap berada di bawah layout bersama pada navigasi klien.
export default function DashboardPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <DashboardPageContent />
    </Suspense>
  );
}
