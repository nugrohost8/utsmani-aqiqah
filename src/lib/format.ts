const rupiahFormatter = new Intl.NumberFormat("id-ID");

export function rupiah(value: number | null | undefined) {
  if (value == null) return "";
  return `Rp ${rupiahFormatter.format(value)}`;
}

/** Nomor WA ke format 62…; menerima 08…, +62…, 62… maupun JID "62…@s.whatsapp.net". */
export function normalizePhone(phone: string) {
  return phone.split("@")[0].split(":")[0].replace(/\D/g, "").replace(/^0/, "62");
}

export function waLink(phone: string, text?: string) {
  return `https://wa.me/${normalizePhone(phone)}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function formatDate(date: Date | null | undefined) {
  if (!date) return "";
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

export function lines(text: string | null | undefined) {
  return (text ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
}

export function daysAgo(days: number) {
  return new Date(Date.now() - days * 86400000);
}
