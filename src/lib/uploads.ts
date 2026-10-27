import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const UPLOAD_ROOT = path.join(process.cwd(), "storage", "uploads");
const MAX_BYTES = 5 * 1024 * 1024;
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/** Menyimpan file gambar dan mengembalikan URL publiknya (/uploads/...). */
export async function saveImage(file: File): Promise<string> {
  const ext = EXT_BY_TYPE[file.type];
  if (!ext) throw new Error("Format gambar harus JPG, PNG, WEBP, atau GIF");
  if (file.size > MAX_BYTES) throw new Error("Ukuran gambar maksimal 5 MB");

  const now = new Date();
  const dir = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
  const name = `${Date.now().toString(36)}-${randomBytes(4).toString("hex")}.${ext}`;
  await mkdir(path.join(UPLOAD_ROOT, dir), { recursive: true });
  await writeFile(path.join(UPLOAD_ROOT, dir, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${dir}/${name}`;
}
