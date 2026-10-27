import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { PageLoading } from "@/components/admin/PageLoading";
import { StatusBadge, WaLogTable } from "@/components/admin/WaLog";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { formatDate, waLink } from "@/lib/format";
import { ANIMAL_LABEL, GENDER_LABEL, STATUS_LABEL } from "@/lib/order";
import { waConfigured } from "@/lib/whatsapp";
import { assignCrm, deleteOrder, updateOrderStatus } from "../../../actions";

async function OrderDetailPageContent({ params, searchParams }: PageProps<"/admin/pesanan/[id]">) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const sp = await searchParams;
  const [o, crms, messages] = await Promise.all([
    prisma.order.findUnique({ where: { id }, include: { crm: true } }),
    prisma.crm.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }),
    prisma.waMessage.findMany({ where: { orderId: id }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  if (!o) notFound();
  // CRM nonaktif tetap muncul bila sedang menangani pesanan ini.
  const crmOptions = crms.filter((c) => c.active || c.id === o.crmId);

  const rows: [string, string][] = [
    ["Kode pesanan", o.code],
    ["Masuk", o.createdAt.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })],
    ["Nama pemesan", o.customerName],
    ["No. WhatsApp", o.phone],
    ["Alamat", o.address],
    ["Nama bayi", o.babyName],
    ["Jenis kelamin", GENDER_LABEL[o.babyGender]],
    ["Tanggal lahir bayi", formatDate(o.babyBirthDate) || "—"],
    ["Tanggal acara", formatDate(o.eventDate)],
    ["Paket", o.packageName],
    ["Jenis domba", o.animalSex ? ANIMAL_LABEL[o.animalSex] : "—"],
    ["Jumlah", String(o.quantity)],
    ["Catatan", o.notes || "—"],
  ];

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Pesanan {o.code}</h1>
          <p>
            <Link href="/admin/pesanan">← Kembali ke daftar pesanan</Link>
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a
            className="a-btn"
            href={waLink(o.phone, `Assalamu'alaikum ${o.customerName}, kami dari Utsmani Aqiqah ingin mengonfirmasi pesanan ${o.code}.`)}
            target="_blank"
            rel="noopener"
          >
            💬 Hubungi via WA
          </a>
          <ConfirmButton action={deleteOrder.bind(null, o.id)} message="Hapus pesanan ini? Tindakan ini tidak bisa dibatalkan.">
            Hapus
          </ConfirmButton>
        </div>
      </div>
      {sp.assigned && <div className="a-flash ok">CRM disimpan. Notifikasi WA sedang dikirim ke CRM, pelanggan & admin — cek riwayat di bawah.</div>}
      {sp.status && <div className="a-flash ok">Status pesanan diperbarui.</div>}
      {sp.error === "crm" && <div className="a-flash err">Pilih CRM terlebih dahulu.</div>}
      {sp.resent === "ok" && <div className="a-flash ok">Pesan WA berhasil dikirim ulang.</div>}
      {sp.resent === "fail" && <div className="a-flash err">Kirim ulang gagal — lihat keterangan di riwayat WA.</div>}
      {!waConfigured() && <div className="a-flash err">WA gateway belum dikonfigurasi (WA_GATEWAY_URL, WA_API_KEY, WA_SENDER di .env).</div>}

      <div className="a-card" style={{ marginBottom: 18 }}>
        <div className="a-inline-form" style={{ justifyContent: "space-between" }}>
          <form action={assignCrm.bind(null, o.id)} className="a-inline-form">
            <b>CRM:</b>
            {crmOptions.length ? (
              <>
                <select className="a-input" name="crmId" defaultValue={o.crmId ?? ""} required>
                  <option value="" disabled>
                    — Pilih CRM —
                  </option>
                  {crmOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
                <button className="a-btn">{o.crmId ? "Ganti & kirim ulang WA" : "Tetapkan & kirim WA"}</button>
              </>
            ) : (
              <Link className="link" href="/admin/crm/baru">
                Belum ada CRM — tambah dulu
              </Link>
            )}
          </form>
          <form action={updateOrderStatus.bind(null, o.id)} className="a-inline-form">
            <b>Status:</b> <StatusBadge status={o.status} />
            <select className="a-input" name="status" defaultValue={o.status} style={{ minWidth: 140 }}>
              {Object.entries(STATUS_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button className="a-btn ghost">Ubah</button>
          </form>
        </div>
        {o.crm && o.assignedAt && (
          <p style={{ marginTop: 10, color: "var(--a-muted)", fontSize: 14 }}>
            Dilayani {o.crm.name} sejak {o.assignedAt.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}
          </p>
        )}
      </div>

      <div className="a-card">
        <dl className="a-dl">
          {rows.map(([k, v]) => (
            <div key={k} style={{ display: "contents" }}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <h2 className="a-section-title">Riwayat WhatsApp</h2>
      <WaLogTable messages={messages} returnTo={`/admin/pesanan/${o.id}`} />
    </>
  );
}

// Suspense di dalam page (bukan loading.tsx) agar tetap berada di bawah layout bersama pada navigasi klien.
export default function OrderDetailPage(props: PageProps<"/admin/pesanan/[id]">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <OrderDetailPageContent {...props} />
    </Suspense>
  );
}
