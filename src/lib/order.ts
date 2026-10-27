import type { AnimalSex, Gender, OrderStatus } from "@/generated/prisma/client";

export const GENDER_LABEL: Record<Gender, string> = { LAKI_LAKI: "Laki-laki", PEREMPUAN: "Perempuan" };
export const ANIMAL_LABEL: Record<AnimalSex, string> = { BETINA: "Domba betina", JANTAN: "Domba jantan" };
export const STATUS_LABEL: Record<OrderStatus, string> = { BARU: "Baru", DIPROSES: "Diproses", SELESAI: "Selesai", BATAL: "Dibatalkan" };

/** Template WA ke pelanggan bila pengaturan dikosongkan. Placeholder: lihat WA_TEMPLATE_HELP. */
export const DEFAULT_WA_TEMPLATES = {
  wa_customer_new: [
    "Assalamu'alaikum {nama},",
    "",
    "Jazakumullahu khairan, pesanan aqiqah Anda sudah kami terima.",
    "",
    "Kode pesanan: {kode}",
    "Paket: {paket}",
    "Tanggal acara: {tanggal}",
    "",
    "CRM kami akan segera menghubungi Anda untuk konfirmasi.",
    "",
    "_Nomor ini khusus notifikasi otomatis._",
  ].join("\n"),
  wa_customer_assigned: [
    "Assalamu'alaikum {nama},",
    "",
    "Pesanan {kode} Anda akan dilayani oleh CRM kami, *{crm}*.",
    "Silakan hubungi beliau untuk konfirmasi & pembayaran: {crm_wa}",
    "",
    "_Nomor ini khusus notifikasi otomatis._",
  ].join("\n"),
};

export const WA_TEMPLATE_HELP =
  "Kosongkan untuk memakai teks bawaan. Placeholder: {nama} {kode} {paket} {jumlah} {tanggal} {nama_bayi} {crm} {crm_wa}. *tebal*, _miring_.";

export function fillTemplate(template: string, vars: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (Object.hasOwn(vars, key) ? vars[key] : match));
}

/** Tanggal hari ini (YYYY-MM-DD) menurut WIB. */
export function todayJakarta() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());
}

export function dateOnly(date: Date | null | undefined) {
  return date ? date.toISOString().slice(0, 10) : "";
}

type OrderForMessage = {
  code: string;
  customerName: string;
  phone: string;
  address: string;
  babyName: string;
  babyGender: Gender;
  eventDate: Date;
  packageName: string;
  animalSex: AnimalSex | null;
  quantity: number;
  notes: string | null;
};

export function orderWhatsAppMessage(o: OrderForMessage) {
  return [
    "Assalamu'alaikum Utsmani Aqiqah, saya sudah mengisi formulir pemesanan di website.",
    "",
    `Kode pesanan: ${o.code}`,
    `Nama pemesan: ${o.customerName}`,
    `No. HP: ${o.phone}`,
    `Nama bayi: ${o.babyName} (${GENDER_LABEL[o.babyGender]})`,
    `Paket: ${o.packageName}${o.animalSex ? ` — ${ANIMAL_LABEL[o.animalSex]}` : ""}`,
    `Jumlah: ${o.quantity}`,
    `Tanggal acara: ${dateOnly(o.eventDate)}`,
    `Alamat: ${o.address}`,
    o.notes ? `Catatan: ${o.notes}` : "",
    "",
    "Mohon konfirmasinya. Terima kasih.",
  ]
    .filter((line, i, arr) => line !== "" || arr[i - 1] !== "")
    .join("\n");
}
