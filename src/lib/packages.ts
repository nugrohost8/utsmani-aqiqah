import type { Package, PackageCategory } from "@/generated/prisma/client";
import { lines } from "./format";

export const CATEGORY_INFO: Record<PackageCategory, { label: string; anchor: string; description: string }> = {
  AQIQAH_MASAK: {
    label: "Aqiqah + Masak",
    anchor: "aqiqah-masak",
    description: "Domba disembelih, dimasak, dan diantar siap saji ke rumah Anda.",
  },
  BUNDLING: {
    label: "Bundling Nasi Box",
    anchor: "bundling",
    description: "Paket lengkap aqiqah + nasi box, goodie bag, dan sertifikat berfigura.",
  },
  NASI_BOX: {
    label: "Nasi Box",
    anchor: "nasi-box",
    description: "Harga per box, bisa dipadukan dengan paket aqiqah apa pun.",
  },
  DOMBA_HIDUP: {
    label: "Domba Hidup / Mentah",
    anchor: "domba-hidup",
    description: "Gratis penyembelihan — daging bisa Anda olah sendiri bersama keluarga.",
  },
};

export const CATEGORY_ORDER: PackageCategory[] = ["AQIQAH_MASAK", "BUNDLING", "NASI_BOX", "DOMBA_HIDUP"];

export function packageFeatures(pkg: Package) {
  const items: string[] = [];
  if (pkg.boxCount && pkg.category !== "BUNDLING") items.push(`${pkg.boxCount} nasi box`);
  if (pkg.sate) items.push(`${pkg.sate} tusuk sate`);
  if (pkg.gule) items.push(`${pkg.gule} porsi gule`);
  return [...items, ...lines(pkg.features)];
}

export function packageLabel(pkg: Pick<Package, "name" | "category">) {
  return `${pkg.name} (${CATEGORY_INFO[pkg.category].label})`;
}
