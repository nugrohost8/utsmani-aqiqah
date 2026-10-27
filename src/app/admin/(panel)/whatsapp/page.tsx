import Link from "next/link";
import { Suspense } from "react";
import { PageLoading } from "@/components/admin/PageLoading";
import { WaLogTable } from "@/components/admin/WaLog";
import type { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { gatewaySender, waConfigured } from "@/lib/whatsapp";
import { TestForm } from "./TestForm";

const PER_PAGE = 50;

async function WhatsAppLogPageContent({ searchParams }: PageProps<"/admin/whatsapp">) {
  await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const f = typeof sp.f === "string" ? sp.f : "";
  const page = Math.max(1, Number(sp.page) || 1);
  const where: Prisma.WaMessageWhereInput = {
    ...(q ? { OR: [{ number: { contains: q.replace(/\D/g, "").replace(/^0/, "62") || q } }, { name: { contains: q } }, { message: { contains: q } }] } : {}),
    ...(f === "masuk" ? { direction: "IN" } : f === "keluar" ? { direction: "OUT" } : f === "gagal" ? { ok: false } : {}),
  };

  const [total, messages, primary] = await Promise.all([
    prisma.waMessage.count({ where }),
    prisma.waMessage.findMany({
      where,
      include: { order: { select: { id: true, code: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.setting.findUnique({ where: { key: "whatsapp_primary" } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const query = { ...(q ? { q } : {}), ...(f ? { f } : {}) };
  const href = (p: number) => `/admin/whatsapp?${new URLSearchParams({ ...query, page: String(p) })}`;
  const returnTo = `/admin/whatsapp?${new URLSearchParams({ ...query, page: String(page) })}`;

  const site = (process.env.SITE_URL ?? "").replace(/\/+$/, "") || "https://domain-anda";
  const secret = process.env.WA_WEBHOOK_SECRET;

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>📱 Log WhatsApp</h1>
          <p>
            {total} pesan · gateway {waConfigured() ? <span className="badge on">aktif · {gatewaySender()}</span> : <span className="badge err">belum dikonfigurasi</span>}
          </p>
        </div>
        <form style={{ display: "flex", gap: 8 }}>
          <select className="a-input" name="f" defaultValue={f} style={{ width: 150 }}>
            <option value="">Semua</option>
            <option value="masuk">Pesan masuk</option>
            <option value="keluar">Pesan keluar</option>
            <option value="gagal">Gagal kirim</option>
          </select>
          <input className="a-input" name="q" defaultValue={q} placeholder="Cari nomor, nama, isi…" style={{ width: 240 }} />
          <button className="a-btn ghost">Cari</button>
        </form>
      </div>

      {sp.resent === "ok" && <div className="a-flash ok">Pesan WA berhasil dikirim ulang.</div>}
      {sp.resent === "fail" && <div className="a-flash err">Kirim ulang gagal — lihat keterangan di tabel.</div>}

      <TestForm defaultNumber={primary?.value ?? ""} />

      <div className="a-card" style={{ marginBottom: 18, fontSize: 14 }}>
        <b>URL webhook</b> (isi di dashboard gateway → device → Webhook):{" "}
        {secret ? <code style={{ wordBreak: "break-all" }}>{`${site}/api/wa/webhook/${secret}`}</code> : <span className="badge err">WA_WEBHOOK_SECRET belum diisi di .env</span>}
      </div>

      <WaLogTable messages={messages} returnTo={returnTo} showOrder />

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
export default function WhatsAppLogPage(props: PageProps<"/admin/whatsapp">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <WhatsAppLogPageContent {...props} />
    </Suspense>
  );
}
