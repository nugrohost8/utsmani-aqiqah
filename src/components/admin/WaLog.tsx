import Link from "next/link";
import type { OrderStatus, WaMessage } from "@/generated/prisma/client";
import { STATUS_LABEL } from "@/lib/order";
import { resendWaMessage } from "@/app/admin/actions";

const STATUS_CLASS: Record<OrderStatus, string> = { BARU: "warn", DIPROSES: "info", SELESAI: "on", BATAL: "off" };

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`badge ${STATUS_CLASS[status]}`}>{STATUS_LABEL[status]}</span>;
}

export const PURPOSE_LABEL: Record<string, string> = {
  order_new_customer: "Pelanggan · pesanan diterima",
  order_new_admin: "Admin · pesanan baru",
  assign_crm: "CRM · detail pesanan",
  assign_customer: "Pelanggan · info CRM",
  assign_admin: "Admin · riwayat CRM",
  forward_crm: "CRM · balasan pelanggan",
  forward_admin: "Admin · balasan pelanggan",
  auto_reply: "Pelanggan · auto-reply",
  status_reply: "Pelanggan · cek status",
  incoming: "Pesan masuk",
  incoming_staff: "Pesan masuk (staf)",
  test: "Tes kirim",
};

type Row = WaMessage & { order?: { id: number; code: string } | null };

export function WaLogTable({ messages, returnTo, showOrder }: { messages: Row[]; returnTo: string; showOrder?: boolean }) {
  return (
    <div className="a-table-wrap">
      <table className="a-table">
        <thead>
          <tr>
            <th>Waktu</th>
            <th>Arah</th>
            <th>Nomor</th>
            <th>Jenis</th>
            {showOrder && <th>Pesanan</th>}
            <th>Isi</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {messages.length === 0 && (
            <tr>
              <td colSpan={showOrder ? 8 : 7} style={{ color: "var(--a-muted)" }}>
                Belum ada pesan WhatsApp.
              </td>
            </tr>
          )}
          {messages.map((m) => (
            <tr key={m.id}>
              <td style={{ whiteSpace: "nowrap" }}>{m.createdAt.toLocaleString("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "short", timeStyle: "short" })}</td>
              <td>{m.direction === "IN" ? "⬅️ Masuk" : "➡️ Keluar"}</td>
              <td>
                {m.number}
                {m.name && (
                  <>
                    <br />
                    <small style={{ color: "var(--a-muted)" }}>{m.name}</small>
                  </>
                )}
              </td>
              <td>{PURPOSE_LABEL[m.purpose] ?? m.purpose}</td>
              {showOrder && (
                <td>
                  {m.order ? (
                    <Link className="link" href={`/admin/pesanan/${m.order.id}`}>
                      {m.order.code}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
              )}
              <td className="a-wa-text">{m.message}</td>
              <td>
                {m.direction === "IN" ? (
                  <span className="badge off">Diterima</span>
                ) : m.ok ? (
                  <span className="badge on">Terkirim</span>
                ) : (
                  <span className="badge err" title={m.error ?? ""}>
                    Gagal
                  </span>
                )}
                {!m.ok && m.error && (
                  <>
                    <br />
                    <small style={{ color: "#b03a2e" }}>{m.error}</small>
                  </>
                )}
              </td>
              <td className="actions">
                {m.direction === "OUT" && (
                  <form action={resendWaMessage.bind(null, m.id, returnTo)}>
                    <button className="a-btn sm ghost">Kirim ulang</button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
