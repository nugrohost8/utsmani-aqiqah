"use server";

import bcrypt from "bcryptjs";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { OrderStatus, Prisma } from "@/generated/prisma/client";
import { RESOURCES, type Field } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { normalizePhone, slugify } from "@/lib/format";
import { SETTING_FIELDS } from "@/lib/settings";
import { createSession, deleteSession } from "@/lib/session";
import { saveImage } from "@/lib/uploads";
import { notifyAssigned } from "@/lib/wa-notify";
import { sendWhatsApp } from "@/lib/whatsapp";

export type FormState = { error?: string; ok?: string; fieldErrors?: Record<string, string>; values?: Record<string, string> };

// ---------- Auth ----------

const failedLogins = new Map<string, { count: number; until: number }>();
const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email dan password wajib diisi.", values: { email } };

  const now = Date.now();
  const record = failedLogins.get(email);
  if (record && record.count >= MAX_FAILS && record.until > now) {
    return { error: "Terlalu banyak percobaan gagal. Coba lagi 15 menit lagi.", values: { email } };
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  const valid = admin ? await bcrypt.compare(password, admin.passwordHash) : false;
  if (!admin || !valid) {
    const count = record && record.until > now ? record.count + 1 : 1;
    failedLogins.set(email, { count, until: now + LOCK_MS });
    return { error: "Email atau password salah.", values: { email } };
  }

  failedLogins.delete(email);
  await createSession(admin.id);
  redirect("/admin");
}

export async function logout() {
  await deleteSession();
  redirect("/admin/login");
}

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (next.length < 10) return { error: "Password baru minimal 10 karakter." };
  if (next !== confirm) return { error: "Konfirmasi password tidak sama." };
  const user = await prisma.adminUser.findUniqueOrThrow({ where: { id: admin.id } });
  if (!(await bcrypt.compare(current, user.passwordHash))) return { error: "Password lama salah." };

  await prisma.adminUser.update({ where: { id: admin.id }, data: { passwordHash: await bcrypt.hash(next, 12) } });
  return { ok: "Password berhasil diganti." };
}

// ---------- Settings ----------

export async function saveSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const values: Record<string, string> = Object.fromEntries(
    SETTING_FIELDS.map((f) => [f.key, String(formData.get(f.key) ?? "").trim()]),
  );

  // Proses upload dulu agar tidak ada pengaturan tersimpan sebagian bila gambar ditolak.
  for (const field of SETTING_FIELDS) {
    if (!("image" in field)) continue;
    const result = await readField({ name: field.key, label: field.label, type: "image" }, formData);
    if (result.error) return { error: `${field.label}: ${result.error}`, values };
    values[field.key] = String(result.value ?? "");
  }

  for (const [key, value] of Object.entries(values)) {
    await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  updateTag("settings");
  return { ok: "Pengaturan tersimpan.", values };
}

// ---------- Generic CRUD ----------

type Delegate = {
  findUnique(args: object): Promise<Record<string, unknown> | null>;
  create(args: object): Promise<unknown>;
  update(args: object): Promise<unknown>;
  delete(args: object): Promise<unknown>;
};

/** Tambahkan ?saved=1 / ?deleted=1 sebelum #hash. */
function withFlash(path: string, flag: "saved" | "deleted") {
  const [base, hash] = path.split("#");
  return `${base}?${flag}=1${hash ? `#${hash}` : ""}`;
}

function delegateFor(model: string) {
  return (prisma as unknown as Record<string, Delegate>)[model];
}

async function readField(field: Field, formData: FormData): Promise<{ value?: unknown; error?: string }> {
  const raw = formData.get(field.name);
  switch (field.type) {
    case "boolean":
      return { value: raw === "on" };
    case "number":
    case "money": {
      const s = String(raw ?? "").replace(/[.\s]/g, "").trim();
      if (!s) return field.required ? { error: "Wajib diisi" } : { value: null };
      const n = Number(s);
      if (!Number.isInteger(n) || n < 0) return { error: "Harus bilangan bulat ≥ 0" };
      return { value: n };
    }
    case "select": {
      const s = String(raw ?? "");
      if (!field.options?.some((o) => o.value === s)) return { error: "Pilihan tidak valid" };
      return { value: s };
    }
    case "url": {
      const s = String(raw ?? "").trim();
      if (!s) return field.required ? { error: "Wajib diisi" } : { value: null };
      if (!/^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/.test(s)) return { error: "Gunakan link /halaman, #bagian, https://…, mailto: atau tel:" };
      return { value: s };
    }
    case "image": {
      const file = formData.get(`${field.name}__file`);
      if (file instanceof File && file.size > 0) {
        try {
          return { value: await saveImage(file) };
        } catch (e) {
          return { error: (e as Error).message };
        }
      }
      const url = formData.get(`${field.name}__remove`) ? "" : String(raw ?? "").trim();
      if (url && !url.startsWith("/uploads/") && !/^https:\/\//.test(url)) return { error: "URL gambar tidak valid" };
      if (!url) return field.required ? { error: "Gambar wajib diunggah" } : { value: null };
      return { value: url };
    }
    default: {
      const s = String(raw ?? "").replace(/\r\n/g, "\n").trim();
      if (!s) return field.required ? { error: "Wajib diisi" } : { value: null };
      return { value: s };
    }
  }
}

export async function saveResource(key: string, id: number | null, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const resource = RESOURCES[key];
  if (!resource) return { error: "Resource tidak dikenal." };
  const delegate = delegateFor(resource.model);

  const data: Record<string, unknown> = {};
  const fieldErrors: Record<string, string> = {};
  // Dikembalikan saat gagal agar isian tidak hilang ketika form di-reset React.
  const submitted = Object.fromEntries(resource.fields.map((f) => [f.name, String(formData.get(f.name) ?? "")]));
  for (const field of resource.fields) {
    const { value, error } = await readField(field, formData);
    if (error) fieldErrors[field.name] = error;
    else data[field.name] = value;
  }

  if (resource.model === "testimonial" && typeof data.rating === "number" && (data.rating < 1 || data.rating > 5)) {
    fieldErrors.rating = "Rating 1 sampai 5";
  }
  if (resource.model === "crm" && typeof data.phone === "string") {
    const phone = normalizePhone(data.phone);
    data.phone = phone;
    if (!/^628\d{7,12}$/.test(phone)) fieldErrors.phone = "Nomor WhatsApp tidak valid, contoh: 6281234567890";
  }
  if (resource.model === "post" && !fieldErrors.title) {
    data.slug = slugify(String(data.slug || data.title));
    if (!data.slug) fieldErrors.slug = "Slug tidak valid";
    const existing = id ? await delegate.findUnique({ where: { id } }) : null;
    data.publishedAt = data.published ? (existing?.publishedAt ?? new Date()) : (existing?.publishedAt ?? null);
  }
  if (Object.keys(fieldErrors).length) return { error: "Periksa kembali isian yang ditandai.", fieldErrors, values: submitted };

  try {
    if (id) await delegate.update({ where: { id }, data });
    else await delegate.create({ data });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "Data dengan nilai yang sama sudah ada.", fieldErrors: { slug: "Slug sudah dipakai artikel lain" }, values: submitted };
    }
    throw e;
  }

  updateTag(resource.tag);
  redirect(withFlash(resource.returnTo ?? `/admin/${key}`, "saved"));
}

export async function deleteResource(key: string, id: number) {
  await requireAdmin();
  const resource = RESOURCES[key];
  if (!resource) throw new Error("Resource tidak dikenal");
  await delegateFor(resource.model).delete({ where: { id } });
  updateTag(resource.tag);
  redirect(withFlash(resource.returnTo ?? `/admin/${key}`, "deleted"));
}

export async function deleteOrder(id: number) {
  await requireAdmin();
  await prisma.order.delete({ where: { id } });
  redirect("/admin/pesanan?deleted=1");
}

// ---------- Pesanan & WhatsApp ----------

export async function assignCrm(orderId: number, formData: FormData) {
  await requireAdmin();
  const crmId = Number(formData.get("crmId"));
  const crm = Number.isInteger(crmId) ? await prisma.crm.findUnique({ where: { id: crmId } }) : null;
  if (!crm) redirect(`/admin/pesanan/${orderId}?error=crm`);

  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  await prisma.order.update({
    where: { id: orderId },
    data: { crmId: crm.id, assignedAt: new Date(), status: order.status === "BARU" ? "DIPROSES" : order.status },
  });
  // Kirim ke CRM, pelanggan & admin setelah respons agar panel tidak menunggu gateway.
  after(() => notifyAssigned(orderId));
  redirect(`/admin/pesanan/${orderId}?assigned=1`);
}

export async function updateOrderStatus(orderId: number, formData: FormData) {
  await requireAdmin();
  const status = String(formData.get("status"));
  if (!Object.hasOwn(OrderStatus, status)) redirect(`/admin/pesanan/${orderId}`);
  await prisma.order.update({ where: { id: orderId }, data: { status: status as OrderStatus } });
  redirect(`/admin/pesanan/${orderId}?status=1`);
}

/** Kirim ulang pesan WA keluar yang tercatat di log (mis. yang gagal). */
export async function resendWaMessage(messageId: number, returnTo: string) {
  await requireAdmin();
  const msg = await prisma.waMessage.findUnique({ where: { id: messageId } });
  const back = returnTo.startsWith("/admin") ? returnTo : "/admin/whatsapp";
  if (!msg || msg.direction !== "OUT") redirect(back);
  const result = await sendWhatsApp({ number: msg.number, message: msg.message, purpose: msg.purpose, orderId: msg.orderId });
  redirect(`${back}${back.includes("?") ? "&" : "?"}resent=${result.ok ? "ok" : "fail"}`);
}

export async function testWhatsApp(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const number = String(formData.get("number") ?? "").trim();
  const values = { number };
  if (!normalizePhone(number)) return { error: "Isi nomor tujuan.", values };
  const result = await sendWhatsApp({
    number,
    message: "Tes WA gateway dari panel admin Utsmani Aqiqah berhasil ✅",
    purpose: "test",
  });
  return result.ok ? { ok: `Pesan tes terkirim ke ${normalizePhone(number)}.`, values } : { error: result.error, values };
}
