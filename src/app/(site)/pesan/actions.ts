"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { normalizePhone } from "@/lib/format";
import { packageLabel } from "@/lib/packages";
import { todayJakarta } from "@/lib/order";
import { notifyNewOrder } from "@/lib/wa-notify";

export type OrderFormState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
  values?: Record<string, string>;
};

const schema = z.object({
  customerName: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s.-]/g, ""))
    .pipe(z.string().regex(/^(\+62|62|0)8\d{7,12}$/, "Nomor WhatsApp tidak valid, contoh: 081234567890"))
    // Disimpan dalam format 62… agar cocok dengan nomor pengirim pesan WA masuk.
    .transform(normalizePhone),
  address: z.string().trim().min(10, "Alamat terlalu pendek").max(500),
  babyName: z.string().trim().min(1, "Nama bayi wajib diisi").max(100),
  babyGender: z.enum(["LAKI_LAKI", "PEREMPUAN"], "Pilih jenis kelamin bayi"),
  babyBirthDate: z.union([z.literal(""), z.iso.date("Tanggal tidak valid")]),
  eventDate: z.iso.date("Tanggal acara wajib diisi"),
  packageId: z.coerce.number("Pilih paket").int().positive("Pilih paket"),
  animalSex: z.union([z.literal(""), z.enum(["BETINA", "JANTAN"])]),
  quantity: z.coerce.number().int().min(1, "Minimal 1").max(1000, "Maksimal 1000"),
  notes: z.string().trim().max(1000),
});

function orderCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(8);
  const rand = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  return `UA-${todayJakarta().slice(2).replace(/-/g, "")}-${rand}`;
}

export async function createOrder(_prev: OrderFormState, formData: FormData): Promise<OrderFormState> {
  const raw = Object.fromEntries(
    ["customerName", "phone", "address", "babyName", "babyGender", "babyBirthDate", "eventDate", "packageId", "animalSex", "quantity", "notes"].map(
      (k) => [k, String(formData.get(k) ?? "")],
    ),
  );

  // Honeypot anti-spam: field tersembunyi ini harus kosong.
  if (formData.get("website")) return { error: "Pesanan tidak dapat diproses.", values: raw };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Periksa kembali isian formulir.", fieldErrors: z.flattenError(parsed.error).fieldErrors, values: raw };
  }
  const data = parsed.data;

  const fieldErrors: Record<string, string[]> = {};
  if (data.eventDate < todayJakarta()) fieldErrors.eventDate = ["Tanggal acara tidak boleh di masa lalu"];

  const pkg = await prisma.package.findFirst({ where: { id: data.packageId, active: true } });
  if (!pkg) fieldErrors.packageId = ["Paket tidak ditemukan"];
  const needsAnimal = pkg && (pkg.priceBetina != null || pkg.priceJantan != null);
  if (needsAnimal && !data.animalSex) fieldErrors.animalSex = ["Pilih domba betina atau jantan"];

  if (Object.keys(fieldErrors).length || !pkg) {
    return { error: "Periksa kembali isian formulir.", fieldErrors, values: raw };
  }

  const order = await prisma.order.create({
    data: {
      code: orderCode(),
      customerName: data.customerName,
      phone: data.phone,
      address: data.address,
      babyName: data.babyName,
      babyGender: data.babyGender,
      babyBirthDate: data.babyBirthDate ? new Date(data.babyBirthDate) : null,
      eventDate: new Date(data.eventDate),
      packageId: pkg.id,
      packageName: packageLabel(pkg),
      animalSex: needsAnimal && data.animalSex ? data.animalSex : null,
      quantity: data.quantity,
      notes: data.notes || null,
    },
  });

  // Dikirim setelah respons selesai agar pelanggan tidak menunggu gateway.
  after(() => notifyNewOrder(order.id));
  redirect(`/pesan/sukses/${order.code}`);
}
