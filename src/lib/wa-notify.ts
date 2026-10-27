import "server-only";
import type { Crm, Order } from "@/generated/prisma/client";
import { prisma } from "./db";
import { formatDate, normalizePhone, waLink } from "./format";
import { ANIMAL_LABEL, DEFAULT_WA_TEMPLATES, GENDER_LABEL, STATUS_LABEL, fillTemplate } from "./order";
import { gatewaySender, sendWhatsApp } from "./whatsapp";

/**
 * Alur notifikasi WhatsApp:
 * - pesanan baru  → pelanggan (konfirmasi) + admin (minta tentukan CRM)
 * - CRM dipilih   → CRM (detail pesanan) + pelanggan (kontak CRM) + admin (riwayat)
 * - pesan masuk   → log, cek status (kode UA-…), teruskan ke CRM/admin, auto-reply
 */

type OrderWithCrm = Order & { crm: Crm | null };

const SETTING_KEYS = ["site_name", "whatsapp_primary", "whatsapp_secondary", "wa_customer_new", "wa_customer_assigned"] as const;
type WaSettings = Record<(typeof SETTING_KEYS)[number], string>;

// Dibaca langsung (tanpa "use cache") karena dipanggil dari after()/route handler dan harus selalu terbaru.
async function waSettings(): Promise<WaSettings> {
  const rows = await prisma.setting.findMany({ where: { key: { in: [...SETTING_KEYS] } } });
  const map = Object.fromEntries(SETTING_KEYS.map((k) => [k, ""])) as WaSettings;
  for (const row of rows) map[row.key as keyof WaSettings] = row.value.trim();
  return map;
}

function adminNumbers(s: WaSettings) {
  return [...new Set([s.whatsapp_primary, s.whatsapp_secondary].map(normalizePhone).filter(Boolean))];
}

function siteUrl() {
  return (process.env.SITE_URL ?? "").replace(/\/+$/, "");
}

function brand(s: WaSettings) {
  return s.site_name || "Utsmani Aqiqah";
}

function packageText(o: Order) {
  return o.packageName + (o.animalSex ? ` — ${ANIMAL_LABEL[o.animalSex]}` : "");
}

function orderVars(o: OrderWithCrm): Record<string, string> {
  return {
    nama: o.customerName,
    kode: o.code,
    paket: packageText(o),
    jumlah: String(o.quantity),
    tanggal: formatDate(o.eventDate),
    nama_bayi: o.babyName,
    crm: o.crm?.name ?? "",
    crm_wa: o.crm ? waLink(o.crm.phone) : "",
  };
}

function orderDetails(o: Order) {
  return [
    `Kode: ${o.code}`,
    `Pemesan: ${o.customerName}`,
    `No. WA: ${o.phone} (${waLink(o.phone)})`,
    `Bayi: ${o.babyName} (${GENDER_LABEL[o.babyGender]})`,
    `Paket: ${packageText(o)}`,
    `Jumlah: ${o.quantity}`,
    `Tanggal acara: ${formatDate(o.eventDate)}`,
    `Alamat: ${o.address}`,
    ...(o.notes ? [`Catatan: ${o.notes}`] : []),
  ];
}

function adminLink(o: Order) {
  return siteUrl() ? `${siteUrl()}/admin/pesanan/${o.id}` : "";
}

async function loadOrder(id: number) {
  return prisma.order.findUnique({ where: { id }, include: { crm: true } });
}

async function sendToAdmins(s: WaSettings, message: string, purpose: string, orderId?: number) {
  for (const number of adminNumbers(s)) await sendWhatsApp({ number, message, purpose, orderId });
}

// ---------- Notifikasi pesanan ----------

export async function notifyNewOrder(orderId: number) {
  const [order, s] = await Promise.all([loadOrder(orderId), waSettings()]);
  if (!order) return;

  await sendWhatsApp({
    number: order.phone,
    message: fillTemplate(s.wa_customer_new || DEFAULT_WA_TEMPLATES.wa_customer_new, orderVars(order)),
    purpose: "order_new_customer",
    orderId: order.id,
  });

  const link = adminLink(order);
  await sendToAdmins(
    s,
    ["*[Pesanan baru]* — belum ada CRM", "", ...orderDetails(order), "", link ? `Tentukan CRM: ${link}` : "Tentukan CRM di panel admin."].join("\n"),
    "order_new_admin",
    order.id,
  );
}

export async function notifyAssigned(orderId: number) {
  const [order, s] = await Promise.all([loadOrder(orderId), waSettings()]);
  if (!order?.crm) return;
  const crm = order.crm;

  await sendWhatsApp({
    number: crm.phone,
    message: [
      `Assalamu'alaikum ${crm.name}, ada pesanan untuk Anda layani:`,
      "",
      ...orderDetails(order),
      "",
      `Silakan hubungi pelanggan: ${waLink(order.phone, `Assalamu'alaikum ${order.customerName}, saya ${crm.name} dari ${brand(s)} ingin mengonfirmasi pesanan ${order.code}.`)}`,
    ].join("\n"),
    purpose: "assign_crm",
    orderId: order.id,
  });

  await sendWhatsApp({
    number: order.phone,
    message: fillTemplate(s.wa_customer_assigned || DEFAULT_WA_TEMPLATES.wa_customer_assigned, orderVars(order)),
    purpose: "assign_customer",
    orderId: order.id,
  });

  await sendToAdmins(
    s,
    [`*[Riwayat CRM]* ${order.code} → ${crm.name} (${crm.phone})`, `Pemesan: ${order.customerName} · ${packageText(order)} × ${order.quantity}`].join("\n"),
    "assign_admin",
    order.id,
  );
}

// ---------- Pesan masuk (webhook) ----------

export type IncomingPayload = {
  device?: unknown;
  message?: unknown;
  from?: unknown;
  name?: unknown;
  participant?: unknown;
  fromMe?: unknown;
  media?: { fileName?: unknown; mimetype?: unknown } | null;
};

const ORDER_CODE = /UA-\d{6}-[A-Z0-9]{8}/;

/** True bila nomor ini sudah menerima `limit` pesan dengan purpose tsb dalam `minutes` terakhir. */
async function throttled(number: string, purpose: string, minutes: number, limit: number) {
  const count = await prisma.waMessage.count({
    where: { number, direction: "OUT", purpose, createdAt: { gte: new Date(Date.now() - minutes * 60_000) } },
  });
  return count >= limit;
}

function statusReply(o: OrderWithCrm, s: WaSettings) {
  return [
    `Status pesanan *${o.code}*: *${STATUS_LABEL[o.status]}*`,
    "",
    `Paket: ${packageText(o)} × ${o.quantity}`,
    `Tanggal acara: ${formatDate(o.eventDate)}`,
    o.crm ? `CRM: ${o.crm.name} — ${waLink(o.crm.phone)}` : "CRM: sedang kami tentukan, mohon ditunggu.",
    "",
    `_${brand(s)} — nomor notifikasi otomatis_`,
  ].join("\n");
}

function autoReply(order: OrderWithCrm | null, s: WaSettings) {
  const footer = "Untuk cek status, kirim kode pesanan Anda (mis. UA-…).";
  if (order?.crm) {
    return [
      "Assalamu'alaikum, nomor ini khusus notifikasi otomatis.",
      `Pesan Anda sudah kami teruskan ke CRM yang melayani pesanan ${order.code}, *${order.crm.name}*.`,
      `Agar lebih cepat, hubungi langsung: ${waLink(order.crm.phone)}`,
      "",
      footer,
    ].join("\n");
  }
  if (order) {
    return [
      "Assalamu'alaikum, nomor ini khusus notifikasi otomatis.",
      `Pesanan ${order.code} sedang kami proses dan CRM kami akan segera menghubungi Anda. Pesan Anda sudah kami teruskan ke admin.`,
      "",
      footer,
    ].join("\n");
  }
  const admin = adminNumbers(s)[0];
  return [
    `Assalamu'alaikum, terima kasih telah menghubungi ${brand(s)}.`,
    "Nomor ini khusus notifikasi otomatis dan tidak dipantau.",
    admin ? `Untuk informasi & pemesanan silakan hubungi admin kami: ${waLink(admin)}` : "",
    siteUrl() ? `Atau pesan online: ${siteUrl()}/pesan` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function handleIncoming(p: IncomingPayload) {
  const fromRaw = String(p.from ?? "");
  // Abaikan grup, status/broadcast, dan pesan dari nomor gateway sendiri.
  if (!fromRaw || /@(g\.us|broadcast|newsletter)$/.test(fromRaw) || p.fromMe === true || p.fromMe === "true") return;
  if (typeof p.participant === "string" && p.participant) return;
  const from = normalizePhone(fromRaw);
  if (!from || from === gatewaySender()) return;

  const text = typeof p.message === "string" ? p.message.trim() : "";
  const media = p.media ? `[media: ${String(p.media.fileName || p.media.mimetype || "file")}]` : "";
  const body = [text, media].filter(Boolean).join("\n") || "[pesan kosong]";
  const name = typeof p.name === "string" && p.name.trim() ? p.name.trim().slice(0, 190) : null;

  const [s, crms] = await Promise.all([waSettings(), prisma.crm.findMany({ select: { phone: true } })]);
  const staff = new Set([...adminNumbers(s), ...crms.map((c) => normalizePhone(c.phone))]);
  const order = await prisma.order.findFirst({
    where: { phone: from, status: { in: ["BARU", "DIPROSES"] } },
    orderBy: { createdAt: "desc" },
    include: { crm: true },
  });

  await prisma.waMessage.create({
    data: { direction: "IN", number: from, name, message: body, purpose: staff.has(from) ? "incoming_staff" : "incoming", orderId: order?.id ?? null },
  });
  // Staf (admin/CRM) tidak dibalas otomatis — mencegah balas-membalas tanpa henti.
  if (staff.has(from)) return;

  // 1. Cek status pesanan lewat kode. Hanya dijawab bila nomor pengirim = nomor pemesan.
  const code = text.toUpperCase().match(ORDER_CODE)?.[0];
  if (code) {
    if (await throttled(from, "status_reply", 10, 3)) return;
    const target = await prisma.order.findUnique({ where: { code }, include: { crm: true } });
    const owned = target && target.phone === from ? target : null;
    await sendWhatsApp({
      number: from,
      message: owned ? statusReply(owned, s) : `Kode pesanan ${code} tidak ditemukan untuk nomor ini. Pastikan Anda mengirim dari nomor WhatsApp yang dipakai saat memesan.`,
      purpose: "status_reply",
      orderId: owned?.id,
    });
    return;
  }

  // 2. Teruskan ke CRM yang melayani (salinan ke admin sebagai riwayat), atau ke admin bila CRM belum ditentukan.
  if (order) {
    const header = order.crm ? "*[Balasan pelanggan]*" : "*[Balasan pelanggan — belum ada CRM]*";
    const forward = [header, `${name ?? order.customerName} (${waLink(from)}) · pesanan ${order.code}`, "", body].join("\n");
    if (order.crm) await sendWhatsApp({ number: order.crm.phone, message: forward, purpose: "forward_crm", orderId: order.id });
    await sendToAdmins(s, order.crm ? `${forward}\n\n_→ diteruskan ke CRM ${order.crm.name}_` : forward, "forward_admin", order.id);
  }

  // 3. Auto-reply, maksimal sekali per 30 menit per nomor.
  if (await throttled(from, "auto_reply", 30, 1)) return;
  await sendWhatsApp({ number: from, message: autoReply(order, s), purpose: "auto_reply", orderId: order?.id });
}
