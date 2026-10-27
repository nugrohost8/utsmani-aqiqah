import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "./db";
import { WA_TEMPLATE_HELP } from "./order";

type SettingField = { key: string; label: string; textarea?: boolean; image?: boolean; help?: string };

export const SETTING_FIELDS = [
  {
    key: "logo_url",
    label: "Logo",
    image: true,
    help: "PNG transparan berwarna terang (latar website gelap), tinggi minimal 120 px. Kosongkan untuk memakai logo bawaan.",
  },
  { key: "site_name", label: "Nama situs" },
  { key: "tagline", label: "Tagline", help: "Tampil sebagai label kecil di slider hero bila label slide kosong" },
  { key: "whatsapp_primary", label: "WhatsApp admin 1 (format 62…)", help: "Juga menerima notifikasi pesanan baru & riwayat CRM dari WA gateway" },
  { key: "whatsapp_secondary", label: "WhatsApp admin 2 (format 62…)", help: "Opsional, ikut menerima notifikasi gateway" },
  { key: "whatsapp_message", label: "Pesan default tombol WhatsApp", textarea: true },
  { key: "email", label: "Email" },
  { key: "instagram", label: "Username Instagram" },
  { key: "facebook", label: "Username Facebook" },
  { key: "charity_note", label: "Catatan wakaf & sedekah", textarea: true },
  { key: "service_area", label: "Area layanan / ongkir" },
  { key: "wa_customer_new", label: "WA otomatis ke pelanggan: pesanan diterima", textarea: true, help: WA_TEMPLATE_HELP },
  { key: "wa_customer_assigned", label: "WA otomatis ke pelanggan: CRM ditentukan", textarea: true, help: WA_TEMPLATE_HELP },
] as const satisfies readonly SettingField[];

export type SettingKey = (typeof SETTING_FIELDS)[number]["key"];
export type Settings = Record<SettingKey, string>;

export async function getSettings(): Promise<Settings> {
  "use cache";
  cacheLife("days");
  cacheTag("settings");
  const rows = await prisma.setting.findMany();
  const map = Object.fromEntries(SETTING_FIELDS.map((f) => [f.key, ""])) as Settings;
  for (const row of rows) if (row.key in map) map[row.key as SettingKey] = row.value;
  return map;
}
