/* eslint-disable @next/next/no-img-element -- thumbnail upload */
import Link from "next/link";
import { Suspense } from "react";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { PageLoading } from "@/components/admin/PageLoading";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { SETTING_FIELDS } from "@/lib/settings";
import { deleteResource } from "../../actions";
import { PasswordForm, SettingsForm } from "./forms";

async function SettingsPageContent({ searchParams }: PageProps<"/admin/pengaturan">) {
  await requireAdmin();
  const sp = await searchParams;
  // Dibaca langsung (tanpa cache) agar admin selalu melihat nilai terbaru.
  const [rows, slides] = await Promise.all([
    prisma.setting.findMany(),
    prisma.heroSlide.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }),
  ]);
  const values = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>⚙️ Pengaturan</h1>
          <p>Logo, slider hero, informasi kontak, dan akun admin.</p>
        </div>
        <nav style={{ display: "flex", gap: 8 }}>
          <a className="a-btn sm ghost" href="#umum">Logo & Umum</a>
          <a className="a-btn sm ghost" href="#slider">Slider Hero</a>
          <a className="a-btn sm ghost" href="#password">Password</a>
        </nav>
      </div>

      <h2 id="umum" className="a-section-title">Logo & informasi umum</h2>
      <SettingsForm
        fields={SETTING_FIELDS.map((f) => ({
          key: f.key,
          label: f.label,
          textarea: "textarea" in f,
          image: "image" in f,
          help: "help" in f ? f.help : undefined,
        }))}
        values={values}
      />

      <div className="admin-head a-section-title" id="slider" style={{ marginBottom: 12 }}>
        <div>
          <h2>Slider Hero</h2>
          <p>Slide berganti otomatis tiap 6 detik di bagian paling atas beranda. Hanya slide yang ditampilkan yang ikut berputar.</p>
        </div>
        <Link className="a-btn" href="/admin/slider/baru">
          + Tambah Slide
        </Link>
      </div>
      {sp.saved && <div className="a-flash ok">Slide tersimpan.</div>}
      {sp.deleted && <div className="a-flash ok">Slide dihapus.</div>}
      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>Gambar</th>
              <th>Judul</th>
              <th>Tombol</th>
              <th>Tampil</th>
              <th>Urutan</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {slides.length === 0 && (
              <tr>
                <td colSpan={6} style={{ color: "var(--a-muted)" }}>
                  Belum ada slide — beranda menampilkan judul bawaan.
                </td>
              </tr>
            )}
            {slides.map((s) => (
              <tr key={s.id}>
                <td>{s.imageUrl ? <img className="thumb" src={s.imageUrl} alt="" /> : <span className="a-sky-thumb" title="Latar langit malam" />}</td>
                <td>
                  <Link className="link" href={`/admin/slider/${s.id}`}>
                    {s.title.replace(/\*/g, "")}
                  </Link>
                </td>
                <td style={{ color: "var(--a-muted)" }}>{[s.primaryLabel, s.secondaryLabel].filter(Boolean).join(" · ") || "—"}</td>
                <td>
                  <span className={`badge ${s.active ? "on" : "off"}`}>{s.active ? "Ya" : "Tidak"}</span>
                </td>
                <td>{s.sortOrder}</td>
                <td className="actions">
                  <Link className="a-btn sm ghost" href={`/admin/slider/${s.id}`}>
                    Edit
                  </Link>
                  <ConfirmButton action={deleteResource.bind(null, "slider", s.id)} message="Hapus slide ini?">
                    Hapus
                  </ConfirmButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 id="password" className="a-section-title">Ganti password</h2>
      <PasswordForm />
    </>
  );
}

// Suspense di dalam page (bukan loading.tsx) agar tetap berada di bawah layout bersama pada navigasi klien.
export default function SettingsPage(props: PageProps<"/admin/pengaturan">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <SettingsPageContent {...props} />
    </Suspense>
  );
}
