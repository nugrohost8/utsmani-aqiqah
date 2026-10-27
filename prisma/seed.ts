import "dotenv/config";
import { copyFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient, PackageCategory } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(process.env.DATABASE_URL!),
});

const UPLOAD_DIR = path.join(process.cwd(), "storage", "uploads");
const img = (file: string) => `/uploads/seed/${file}`;

async function copySeedAssets() {
  const src = path.join(process.cwd(), "prisma", "seed-assets");
  const dest = path.join(UPLOAD_DIR, "seed");
  await mkdir(dest, { recursive: true });
  for (const file of await readdir(src)) {
    await copyFile(path.join(src, file), path.join(dest, file));
  }
}

const settings: Record<string, string> = {
  site_name: "Utsmani Aqiqah",
  tagline: "Aqiqah Mudah Penuh Berkah",
  logo_url: "",
  whatsapp_primary: "6282299000443",
  whatsapp_secondary: "6289656710490",
  whatsapp_message:
    "Assalamu'alaikum Utsmani Aqiqah, saya lihat informasi di website dan ingin minta brosur aqiqah beserta penjelasannya. Terima kasih.",
  email: "utsmani.aqiqah@gmail.com",
  instagram: "utsmani.aqiqah",
  facebook: "utsmaniaqiqah",
  charity_note:
    "100% keuntungan Utsmani Aqiqah disalurkan untuk wakaf dan sedekah melalui Indhifa Foundation.",
  service_area: "Gratis ongkir Bandung dan sekitarnya",
};

type Pkg = {
  category: PackageCategory;
  name: string;
  subtitle?: string;
  priceBetina?: number;
  priceJantan?: number;
  originalBetina?: number;
  originalJantan?: number;
  price?: number;
  sate?: number;
  gule?: number;
  boxCount?: number;
  features?: string[];
  imageUrl?: string;
  featured?: boolean;
};

const aqiqahMasakExtras = [
  "Olahan daging: sate, teriyaki, rendang, bistik atau bumbu kecap",
  "Olahan tulang: gule, tongseng atau sop domba",
  "Bonus sertifikat berfigura & goodie bag",
];

const packages: Pkg[] = [
  ...(
    [
      ["A", 1450000, 1950000, 200, 50],
      ["B", 1700000, 2250000, 240, 60],
      ["C", 1900000, 2400000, 280, 70],
      ["D", 2100000, 2650000, 320, 80],
      ["E", 2300000, 2900000, 360, 90],
      ["F", 2600000, 3200000, 400, 100],
    ] as const
  ).map(([tipe, betina, jantan, sate, gule]) => ({
    category: PackageCategory.AQIQAH_MASAK,
    name: `Paket ${tipe}`,
    subtitle: "Aqiqah + Masak",
    priceBetina: betina,
    priceJantan: jantan,
    sate,
    gule,
    features: aqiqahMasakExtras,
    imageUrl: img(`paket-${tipe.toLowerCase()}.jpeg`),
    featured: tipe === "B",
  })),
  ...(
    [
      ["A", 1250000, 1750000],
      ["B", 1500000, 2050000],
      ["C", 1700000, 2200000],
      ["D", 1900000, 2450000],
      ["E", 2100000, 2700000],
      ["F", 2400000, 3000000],
    ] as const
  ).map(([tipe, betina, jantan]) => ({
    category: PackageCategory.DOMBA_HIDUP,
    name: `Domba Tipe ${tipe}`,
    subtitle: "Domba hidup / daging mentah",
    priceBetina: betina,
    priceJantan: jantan,
    features: ["Gratis penyembelihan", "Gratis ongkir Bandung dan sekitarnya"],
    imageUrl: img("harga-domba-hidup.jpeg"),
  })),
  {
    category: PackageCategory.NASI_BOX,
    name: "Nasi Box Berkah",
    price: 11500,
    features: ["Nasi putih", "Tumis bihun", "Kerupuk udang", "Acar", "Alat makan", "Label nama & risalah aqiqah"],
    imageUrl: img("nasibox-berkah.jpeg"),
  },
  {
    category: PackageCategory.NASI_BOX,
    name: "Nasi Box Paket A",
    price: 12500,
    features: ["Nasi putih", "Tumis bihun", "Kerupuk udang", "Pisang / puding sedot", "Acar", "Alat makan", "Label nama & risalah aqiqah"],
    imageUrl: img("nasibox-a.jpeg"),
  },
  {
    category: PackageCategory.NASI_BOX,
    name: "Nasi Box Paket B",
    price: 16000,
    features: ["Nasi putih", "Tumis bihun", "Telur balado", "Kerupuk udang", "Pisang / puding sedot", "Acar", "Alat makan", "Label nama & risalah aqiqah"],
    imageUrl: img("nasibox-b.jpeg"),
  },
  {
    category: PackageCategory.NASI_BOX,
    name: "Nasi Box Paket C",
    price: 22000,
    features: ["Nasi putih", "Tumis bihun", "Ayam goreng / kecap", "Sambal goreng kentang", "Kerupuk udang", "Pisang / puding sedot", "Acar", "Alat makan", "Label nama & risalah aqiqah"],
    imageUrl: img("nasibox-c.jpeg"),
  },
  {
    category: PackageCategory.NASI_BOX,
    name: "Nasi Kebuli Basmati",
    price: 25000,
    features: ["Nasi kebuli basmati", "Sambal goreng kentang", "Emping", "Pisang / puding sedot", "Acar", "Alat makan", "Label nama & risalah aqiqah"],
    imageUrl: img("nasibox-kebuli.jpeg"),
  },
  ...(
    [
      ["Anak Perempuan", "1 ekor domba", 50, 200, 50, 1975000, 2075000, 2475000, 2575000],
      ["Anak Perempuan", "1 ekor domba", 80, 320, 80, 2975000, 3100000, 3525000, 3650000],
      ["Anak Perempuan", "1 ekor domba", 100, 400, 100, 3695000, 3850000, 4295000, 4450000],
      ["Anak Laki-laki", "2 ekor domba", 50, 400, 100, 3425000, 3525000, 4425000, 4525000],
      ["Anak Laki-laki", "2 ekor domba", 80, 400, 100, 3775000, 3900000, 4775000, 4900000],
      ["Anak Laki-laki", "2 ekor domba", 100, 400, 100, 3995000, 4150000, 4995000, 5150000],
    ] as const
  ).map(([anak, domba, box, sate, gule, betina, oBetina, jantan, oJantan]) => ({
    category: PackageCategory.BUNDLING,
    name: `Bundling ${anak} · ${box} Box`,
    subtitle: domba,
    boxCount: box,
    sate,
    gule,
    priceBetina: betina,
    originalBetina: oBetina,
    priceJantan: jantan,
    originalJantan: oJantan,
    features: [`${box} nasi box`, "Goodie bag & sertifikat berfigura", "Penyembelihan + masak", "Bonus"],
    imageUrl: img(anak === "Anak Perempuan" ? "bundling-perempuan.jpeg" : "bundling-laki.jpeg"),
    featured: anak === "Anak Perempuan" && box === 50,
  })),
];

const menuItems = [
  { name: "Sate Domba", icon: "🍢", description: "Empuk dengan bumbu kecap dan sambal kacang." },
  { name: "Gule Domba", icon: "🍛", description: "Kuah santan berempah yang gurih meresap." },
  { name: "Tongseng", icon: "🥘", description: "Manis pedas dengan kol dan tomat segar." },
  { name: "Rendang", icon: "🍖", description: "Dimasak lama hingga bumbu meresap sempurna." },
  { name: "Teriyaki", icon: "🥢", description: "Daging domba saus teriyaki, disukai anak-anak." },
  { name: "Sop Domba", icon: "🍲", description: "Kuah bening hangat dengan rempah pilihan." },
];

const testimonials = [
  {
    name: "Yan Agen",
    subtitle: "Pelanggan Utsmani Aqiqah",
    content:
      "Saya ga nyesel pesen disini, harganya murah, terus pesanan sesuai dan bisa request sesuai keinginan. Rasa masakannya enak, bumbu terasa ga asal-asalan masaknya. Makasih banyak udah bantuin moment aqiqah anak saya dengan sangat baik.",
    imageUrl: img("testimoni-yan.jpeg"),
  },
  {
    name: "Ibu Inayah",
    subtitle: "Pelanggan Utsmani Aqiqah",
    content: "Terima kasih banyak, masakan dan penghantarannya sudah oke, pelayanannya cepat. 👍👍👍",
    imageUrl: img("testimoni-inayah.jpeg"),
  },
  {
    name: "Pak Andri",
    subtitle: "Pelanggan Utsmani Aqiqah",
    content:
      "Saya puas dengan pelayanan yang diberikan team Utsmani Aqiqah, baik dari pelayanan terhadap customer, harga ditawarkan, juga rasa masakan yang diolah sangat baik, enak, dan memegang trust juga. Pertahankan dan semoga semakin maju berkembang dan amanah.",
    imageUrl: img("testimoni-andri.jpeg"),
  },
  {
    name: "Pak Usup",
    subtitle: "Pelanggan Utsmani Aqiqah",
    content: "Alhamdulillah teh kaanggo pisan. Pelayanan ti ngawitan dugi ka ingtunkeunna, Alhamdulillah islami.",
    imageUrl: img("testimoni-usup.jpeg"),
  },
  {
    name: "Pelanggan Margacinta",
    subtitle: "Kantor Cabang Margacinta",
    content:
      "Pelayanan Utsmani sangat memuaskan dan membantu untuk mempermudah masyarakat khususnya muslim yang ingin beraqiqah. Insya Allah saya akan merekomendasikan Utsmani kepada kerabat dan kolega.",
    imageUrl: img("testimoni-margacinta.jpeg"),
  },
];

const heroSlides = [
  {
    title: "Bintang Kecil Telah Lahir, Rayakan dengan *Aqiqah Penuh Berkah*",
    subtitle:
      "Aqiqah sudah masak plus sedekah. Hewan pilihan, penyembelihan sesuai syariat, dan hidangan lezat diantar ke rumah Anda.",
    primaryLabel: "Lihat Paket Aqiqah",
    primaryUrl: "/paket",
    secondaryLabel: "☾ Isi Formulir Pemesanan",
    secondaryUrl: "/pesan",
  },
  {
    eyebrow: "Aqiqah Plus Sedekah",
    title: "Aqiqah Sudah Masak plus Sedekah? *Bisa Banget!*",
    subtitle: "100% keuntungan Utsmani Aqiqah disalurkan untuk wakaf dan sedekah — aqiqah ananda terlaksana, pahala sedekah melimpah.",
    primaryLabel: "Pesan Sekarang",
    primaryUrl: "/pesan",
    secondaryLabel: "Tentang Kami",
    secondaryUrl: "/#tentang",
  },
  {
    eyebrow: "Paket Bundling Nasi Box",
    title: "Aqiqah Lengkap dengan *Nasi Box, Goodie Bag & Sertifikat*",
    subtitle: "Pilihan 50, 80, atau 100 box untuk anak laki-laki maupun perempuan. Gratis ongkir Bandung dan sekitarnya.",
    primaryLabel: "Lihat Paket Bundling",
    primaryUrl: "/paket#bundling",
    secondaryLabel: "Tanya Admin",
    secondaryUrl: "/#kontak",
  },
];

const mapEmbed = (q: string) => `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;

const offices = [
  {
    name: "Kantor Pusat",
    address: "Jl. Cikalang No. 36, Cileunyi, Bandung 40393",
    phone: "0822-9900-0443 / 0896-5671-0490",
    mapUrl: mapEmbed("Utsmani Aqiqah Cileunyi Bandung"),
  },
  {
    name: "Kantor Cabang Batujajar",
    address: "Kp. Sinar Mukti RT.02/02 Selacau, Batujajar, Bandung Barat",
    phone: "0813-1581-0477",
    mapUrl: null,
  },
  {
    name: "Kantor Cabang Margacinta",
    address: "Jl. Margacinta No. 76, Kota Bandung 40287",
    phone: "0812-2270-1745",
    mapUrl: null,
  },
];

const faqs = [
  {
    question: "Apakah boleh aqiqah dengan hewan betina?",
    answer:
      'Aqiqah dengan domba atau kambing betina diperbolehkan berdasarkan hadits mengenai aqiqah: "Aqiqah untuk anak laki-laki dua kambing dan anak perempuan satu kambing." Tidak ada keterangan penyebutan jenis kelamin hewannya.',
  },
  {
    question: "Apakah aqiqahnya bisa disalurkan ke anak yatim?",
    answer: "Bisa. Aqiqah di Utsmani Aqiqah bisa disalurkan kepada anak yatim binaan RAPIYA.",
  },
  {
    question: "Bagaimana alur pemesanan aqiqah di Utsmani Aqiqah?",
    answer: "1. Pengisian formulir\n2. Pemilihan hewan\n3. Penyembelihan\n4. Masak + antar",
  },
  {
    question: "Apakah ada gratis ongkir?",
    answer: "Ya, gratis ongkir untuk wilayah Bandung dan sekitarnya.",
  },
  {
    question: "Ke mana keuntungan Utsmani Aqiqah disalurkan?",
    answer:
      "100% keuntungan Utsmani Aqiqah disalurkan untuk wakaf dan sedekah melalui Indhifa Foundation, sehingga Ayah dan Bunda bisa beraqiqah sekaligus bersedekah.",
  },
];

const gallery = [
  { title: "Promo Berkah Melimpah", file: "promo-berkah-melimpah.jpeg" },
  { title: "Paling Hemat", file: "promo-paling-hemat.jpeg" },
  { title: "Bonus Aqiqah di Utsmani", file: "bonus-aqiqah.jpeg" },
  { title: "Kenapa Harus Utsmani Aqiqah?", file: "kenapa-utsmani.jpeg" },
  { title: "Banyak Free di Utsmani Aqiqah", file: "banyak-free.jpeg" },
  { title: "Daftar Harga Aqiqah + Masak", file: "harga-aqiqah-masak.jpeg" },
];

const posts = [
  {
    title: "Mengenal Aqiqah: Hukum, Waktu, dan Ketentuannya",
    slug: "mengenal-aqiqah-hukum-waktu-dan-ketentuannya",
    excerpt:
      "Aqiqah adalah wujud syukur atas kelahiran buah hati. Simak penjelasan singkat tentang hukum, waktu pelaksanaan, dan jumlah hewan aqiqah.",
    coverUrl: img("kenapa-utsmani.jpeg"),
    content: `Aqiqah adalah penyembelihan hewan sebagai wujud syukur kepada Allah atas kelahiran seorang anak. Ibadah ini dicontohkan langsung oleh Rasulullah ﷺ.

## Hukum Aqiqah

Mayoritas ulama berpendapat bahwa hukum aqiqah adalah **sunnah muakkadah** (sunnah yang sangat dianjurkan) bagi orang tua yang mampu.

## Waktu Pelaksanaan

Aqiqah dianjurkan dilaksanakan pada **hari ketujuh** setelah kelahiran, bersamaan dengan mencukur rambut dan memberi nama bayi. Bila belum mampu pada hari ketujuh, sebagian ulama membolehkan pelaksanaannya di hari lain.

## Jumlah Hewan

- Anak laki-laki: dua ekor kambing atau domba
- Anak perempuan: satu ekor kambing atau domba

## Pembagian Daging

Berbeda dengan qurban, daging aqiqah dianjurkan dibagikan dalam keadaan **sudah dimasak**, sehingga penerima bisa langsung menikmatinya.

Di Utsmani Aqiqah, seluruh proses — dari pemilihan hewan, penyembelihan, hingga memasak dan mengantar — kami tangani, sehingga Ayah dan Bunda bisa fokus menyambut buah hati.`,
  },
  {
    title: "Tips Memilih Paket Aqiqah Sesuai Jumlah Tamu",
    slug: "tips-memilih-paket-aqiqah-sesuai-jumlah-tamu",
    excerpt:
      "Bingung memilih antara paket aqiqah masak, domba hidup, atau bundling nasi box? Berikut panduan singkatnya.",
    coverUrl: img("promo-berkah-melimpah.jpeg"),
    content: `Setiap keluarga punya kebutuhan berbeda. Berikut panduan singkat memilih paket di Utsmani Aqiqah.

## 1. Hitung Perkiraan Tamu

Paket **Aqiqah + Masak** tipe A berisi 200 tusuk sate dan 50 porsi gule, sedangkan tipe F berisi 400 tusuk sate dan 100 porsi gule. Semakin besar tipe domba, semakin banyak porsi yang dihasilkan.

## 2. Butuh Nasi Box?

Jika ingin hidangan langsung dibagikan, pilih **Paket Bundling Box** yang sudah termasuk 50, 80, atau 100 nasi box beserta goodie bag dan sertifikat berfigura.

## 3. Ingin Masak Sendiri?

Pilih paket **Domba Hidup / Mentah** — gratis penyembelihan, daging bisa diolah sendiri bersama keluarga.

## 4. Konsultasikan dengan Admin

Masih ragu? Hubungi admin kami lewat WhatsApp untuk mendapatkan rekomendasi paket sesuai kebutuhan Anda.`,
  },
];

async function main() {
  await copySeedAssets();

  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    await prisma.adminUser.upsert({
      where: { email },
      update: {},
      create: { email, name: "Admin", passwordHash: await bcrypt.hash(password, 12) },
    });
  }

  // Konten hanya diisi bila tabel masih kosong, agar seed aman dijalankan ulang.
  if ((await prisma.package.count()) === 0) {
    await prisma.package.createMany({
      data: packages.map(({ features, ...p }, i) => ({
        ...p,
        features: features?.join("\n"),
        sortOrder: i,
      })),
    });
  }
  if ((await prisma.menuItem.count()) === 0) {
    await prisma.menuItem.createMany({ data: menuItems.map((m, i) => ({ ...m, sortOrder: i })) });
  }
  if ((await prisma.testimonial.count()) === 0) {
    await prisma.testimonial.createMany({ data: testimonials.map((t, i) => ({ ...t, sortOrder: i })) });
  }
  if ((await prisma.office.count()) === 0) {
    await prisma.office.createMany({ data: offices.map((o, i) => ({ ...o, sortOrder: i })) });
  }
  if ((await prisma.faq.count()) === 0) {
    await prisma.faq.createMany({ data: faqs.map((f, i) => ({ ...f, sortOrder: i })) });
  }
  if ((await prisma.galleryImage.count()) === 0) {
    await prisma.galleryImage.createMany({
      data: gallery.map((g, i) => ({ title: g.title, imageUrl: img(g.file), sortOrder: i })),
    });
  }
  if ((await prisma.heroSlide.count()) === 0) {
    await prisma.heroSlide.createMany({ data: heroSlides.map((h, i) => ({ ...h, sortOrder: i })) });
  }
  if ((await prisma.post.count()) === 0) {
    const now = new Date();
    await prisma.post.createMany({
      data: posts.map((p, i) => ({
        ...p,
        published: true,
        publishedAt: new Date(now.getTime() - i * 86400000),
      })),
    });
  }
}

main()
  .then(() => console.log("Seed selesai."))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
