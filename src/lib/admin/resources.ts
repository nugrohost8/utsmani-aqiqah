/** Konfigurasi CRUD admin. Murni data (bisa dikirim ke client component). */

export type FieldType = "text" | "textarea" | "markdown" | "number" | "money" | "boolean" | "select" | "image" | "url";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  help?: string;
  placeholder?: string;
};

export type Resource = {
  label: string;
  singular: string;
  /** Nama delegate Prisma, mis. "package" → prisma.package */
  model: "package" | "menuItem" | "testimonial" | "office" | "faq" | "galleryImage" | "post" | "heroSlide" | "crm";
  /** Tag cache publik yang di-update setelah perubahan */
  tag: string;
  icon: string;
  columns: string[];
  /** Tidak ditampilkan di menu Konten (dikelola dari halaman lain) */
  hidden?: boolean;
  /** Halaman tujuan setelah simpan/hapus; default /admin/<key> */
  returnTo?: string;
  orderBy: Record<string, "asc" | "desc">[];
  fields: Field[];
};

const sortOrder: Field = { name: "sortOrder", label: "Urutan", type: "number", required: true, help: "Angka kecil tampil lebih dulu" };
const active: Field = { name: "active", label: "Tampilkan di website", type: "boolean" };
const image = (label = "Gambar"): Field => ({ name: "imageUrl", label, type: "image" });

export const RESOURCES: Record<string, Resource> = {
  paket: {
    label: "Paket & Harga",
    singular: "Paket",
    model: "package",
    tag: "packages",
    icon: "🐑",
    columns: ["name", "category", "priceBetina", "priceJantan", "price", "active"],
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { id: "asc" }],
    fields: [
      {
        name: "category",
        label: "Kategori",
        type: "select",
        required: true,
        options: [
          { value: "AQIQAH_MASAK", label: "Aqiqah + Masak" },
          { value: "BUNDLING", label: "Bundling Nasi Box" },
          { value: "NASI_BOX", label: "Nasi Box" },
          { value: "DOMBA_HIDUP", label: "Domba Hidup / Mentah" },
        ],
      },
      { name: "name", label: "Nama paket", type: "text", required: true },
      { name: "subtitle", label: "Subjudul", type: "text", placeholder: "mis. 1 ekor domba" },
      { name: "priceBetina", label: "Harga domba betina", type: "money" },
      { name: "originalBetina", label: "Harga coret betina", type: "money", help: "Kosongkan bila tidak ada diskon" },
      { name: "priceJantan", label: "Harga domba jantan", type: "money" },
      { name: "originalJantan", label: "Harga coret jantan", type: "money" },
      { name: "price", label: "Harga per box", type: "money", help: "Khusus kategori Nasi Box" },
      { name: "sate", label: "Jumlah tusuk sate", type: "number" },
      { name: "gule", label: "Porsi gule", type: "number" },
      { name: "boxCount", label: "Jumlah box", type: "number" },
      { name: "features", label: "Isi / keterangan paket", type: "textarea", help: "Satu item per baris" },
      image("Brosur paket"),
      { name: "featured", label: "Tandai sebagai rekomendasi", type: "boolean" },
      active,
      sortOrder,
    ],
  },
  menu: {
    label: "Menu Olahan",
    singular: "Menu",
    model: "menuItem",
    tag: "menu",
    icon: "🍢",
    columns: ["icon", "name", "active", "sortOrder"],
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    fields: [
      { name: "name", label: "Nama menu", type: "text", required: true },
      { name: "description", label: "Deskripsi", type: "textarea" },
      { name: "icon", label: "Ikon emoji", type: "text", help: "Dipakai bila tidak ada foto", placeholder: "🍢" },
      image("Foto menu"),
      active,
      sortOrder,
    ],
  },
  testimoni: {
    label: "Testimoni",
    singular: "Testimoni",
    model: "testimonial",
    tag: "testimonials",
    icon: "💬",
    columns: ["name", "subtitle", "rating", "active"],
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    fields: [
      { name: "name", label: "Nama", type: "text", required: true },
      { name: "subtitle", label: "Keterangan", type: "text", placeholder: "mis. Aqiqah putri pertama" },
      { name: "content", label: "Isi testimoni", type: "textarea", required: true },
      { name: "rating", label: "Rating (1–5)", type: "number", required: true },
      image("Bukti / screenshot"),
      active,
      sortOrder,
    ],
  },
  galeri: {
    label: "Galeri",
    singular: "Gambar",
    model: "galleryImage",
    tag: "gallery",
    icon: "🖼️",
    columns: ["imageUrl", "title", "active", "sortOrder"],
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    fields: [{ name: "title", label: "Judul", type: "text", required: true }, { ...image(), required: true }, active, sortOrder],
  },
  kantor: {
    label: "Kantor Cabang",
    singular: "Kantor",
    model: "office",
    tag: "offices",
    icon: "📍",
    columns: ["name", "address", "phone", "active"],
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    fields: [
      { name: "name", label: "Nama kantor", type: "text", required: true },
      { name: "address", label: "Alamat", type: "textarea", required: true },
      { name: "phone", label: "Telepon", type: "text" },
      { name: "mapUrl", label: "URL embed Google Maps", type: "text", help: "Google Maps → Bagikan → Sematkan peta → salin isi src=\"…\"" },
      active,
      sortOrder,
    ],
  },
  faq: {
    label: "FAQ",
    singular: "FAQ",
    model: "faq",
    tag: "faqs",
    icon: "❓",
    columns: ["question", "active", "sortOrder"],
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    fields: [
      { name: "question", label: "Pertanyaan", type: "textarea", required: true },
      { name: "answer", label: "Jawaban", type: "textarea", required: true },
      active,
      sortOrder,
    ],
  },
  blog: {
    label: "Blog",
    singular: "Artikel",
    model: "post",
    tag: "posts",
    icon: "📰",
    columns: ["title", "published", "publishedAt"],
    orderBy: [{ createdAt: "desc" }],
    fields: [
      { name: "title", label: "Judul", type: "text", required: true },
      { name: "slug", label: "Slug URL", type: "text", help: "Kosongkan untuk dibuat otomatis dari judul" },
      { name: "excerpt", label: "Ringkasan", type: "textarea" },
      {
        name: "content",
        label: "Isi artikel",
        type: "markdown",
        required: true,
        help: "Pisahkan paragraf dengan baris kosong. ## Judul, ### Subjudul, - daftar, 1. daftar bernomor, **tebal**",
      },
      { name: "coverUrl", label: "Gambar sampul", type: "image" },
      { name: "published", label: "Terbitkan", type: "boolean" },
    ],
  },
};

RESOURCES.slider = {
  label: "Slider Hero",
  singular: "Slide",
  model: "heroSlide",
  tag: "slides",
  icon: "🌙",
  hidden: true,
  returnTo: "/admin/pengaturan#slider",
  columns: ["imageUrl", "title", "active", "sortOrder"],
  orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  fields: [
    { name: "eyebrow", label: "Label kecil", type: "text", help: "Kosongkan untuk memakai tagline dari Pengaturan" },
    {
      name: "title",
      label: "Judul",
      type: "textarea",
      required: true,
      help: "Apit kata dengan *bintang* agar tampil emas miring, mis. Rayakan dengan *Aqiqah Penuh Berkah*",
    },
    { name: "subtitle", label: "Subjudul", type: "textarea" },
    { name: "imageUrl", label: "Gambar latar", type: "image", help: "Opsional. Landscape, min. 1600×900 px. Tanpa gambar, latar langit malam yang dipakai." },
    { name: "primaryLabel", label: "Teks tombol utama", type: "text", placeholder: "Lihat Paket Aqiqah" },
    { name: "primaryUrl", label: "Link tombol utama", type: "url", placeholder: "/paket" },
    { name: "secondaryLabel", label: "Teks tombol kedua", type: "text", placeholder: "Isi Formulir Pemesanan" },
    { name: "secondaryUrl", label: "Link tombol kedua", type: "url", placeholder: "/pesan" },
    active,
    sortOrder,
  ],
};

RESOURCES.crm = {
  label: "CRM",
  singular: "CRM",
  model: "crm",
  tag: "crm",
  icon: "🎧",
  // Ditampilkan di grup menu Utama, bukan Konten.
  hidden: true,
  columns: ["name", "phone", "active", "sortOrder"],
  orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  fields: [
    { name: "name", label: "Nama CRM", type: "text", required: true },
    { name: "phone", label: "Nomor WhatsApp", type: "text", required: true, placeholder: "6281234567890", help: "Menerima detail pesanan & balasan pelanggan dari WA gateway" },
    { name: "active", label: "Aktif (bisa dipilih untuk pesanan baru)", type: "boolean" },
    sortOrder,
  ],
};

export const COLUMN_LABELS: Record<string, string> = {
  name: "Nama",
  category: "Kategori",
  priceBetina: "Betina",
  priceJantan: "Jantan",
  price: "Per box",
  active: "Tampil",
  icon: "Ikon",
  sortOrder: "Urutan",
  subtitle: "Keterangan",
  rating: "Rating",
  imageUrl: "Gambar",
  title: "Judul",
  address: "Alamat",
  phone: "Telepon",
  question: "Pertanyaan",
  published: "Terbit",
  publishedAt: "Tanggal terbit",
};
