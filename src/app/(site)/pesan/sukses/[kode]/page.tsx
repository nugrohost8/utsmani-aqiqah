import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHead } from "@/components/site/Hero";
import { prisma } from "@/lib/db";
import { formatDate, waLink } from "@/lib/format";
import { ANIMAL_LABEL, GENDER_LABEL, orderWhatsAppMessage } from "@/lib/order";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Pesanan Terkirim", robots: { index: false } };

async function OrderSummary({ params }: { params: PageProps<"/pesan/sukses/[kode]">["params"] }) {
  const { kode } = await params;
  const [order, settings] = await Promise.all([prisma.order.findUnique({ where: { code: kode } }), getSettings()]);
  if (!order) notFound();

  const rows: [string, string][] = [
    ["Kode pesanan", order.code],
    ["Nama pemesan", order.customerName],
    ["No. WhatsApp", order.phone],
    ["Nama bayi", `${order.babyName} (${GENDER_LABEL[order.babyGender]})`],
    ["Paket", order.packageName + (order.animalSex ? ` — ${ANIMAL_LABEL[order.animalSex]}` : "")],
    ["Jumlah", String(order.quantity)],
    ["Tanggal acara", formatDate(order.eventDate)],
    ["Alamat", order.address],
  ];
  if (order.notes) rows.push(["Catatan", order.notes]);

  return (
    <div className="form-card">
      <div className="alert alert-ok">
        Jazakumullahu khairan! Pesanan Anda sudah kami terima dan konfirmasinya dikirim ke WhatsApp Anda. CRM kami akan segera
        menghubungi Anda.
      </div>
      <table className="summary-table">
        <tbody>
          {rows.map(([k, val]) => (
            <tr key={k}>
              <th>{k}</th>
              <td style={{ whiteSpace: "pre-line" }}>{val}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {settings.whatsapp_primary && (
        <a className="btn btn-gold btn-block" href={waLink(settings.whatsapp_primary, orderWhatsAppMessage(order))} target="_blank" rel="noopener">
          💬 Chat Admin Sekarang
        </a>
      )}
    </div>
  );
}

export default function SuksesPage(props: PageProps<"/pesan/sukses/[kode]">) {
  return (
    <>
      <PageHead tag="Terima Kasih" title="Pesanan Berhasil Dikirim" />
      <section className="section bg-fade" style={{ paddingTop: 60 }}>
        <div className="container">
          <Suspense fallback={<div className="form-card empty">Memuat ringkasan…</div>}>
            <OrderSummary params={props.params} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
