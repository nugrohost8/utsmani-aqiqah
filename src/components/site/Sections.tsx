/* eslint-disable @next/next/no-img-element -- gambar upload disajikan dari /uploads (route handler), bukan aset build */
import Image from "next/image";
import Link from "next/link";
import mascot from "../../../public/brand/mascot.png";
import type { Faq, GalleryImage, MenuItem, Office, Testimonial } from "@/generated/prisma/client";
import { formatDate, waLink } from "@/lib/format";
import type { Settings } from "@/lib/settings";

export function SectionHead({ tag, title, children }: { tag: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="sec-head">
      <span className="tag">{tag}</span>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}

export function Stats({ items }: { items: { value: string; label: string }[] }) {
  return (
    <div className="stats">
      <div className="container">
        {items.map((s) => (
          <div className="stat" key={s.label}>
            <b>{s.value}</b>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function About({ settings }: { settings: Settings }) {
  return (
    <section className="section about bg-night-2" id="tentang">
      <div className="container about-grid">
        <div className="arch-wrap">
          <div className="arch-outer" />
          <div className="arch">
            <div className="layer starfield" style={{ opacity: 0.7 }} />
            <Image src={mascot} alt="Maskot Utsmani Aqiqah" sizes="(max-width: 640px) 90vw, 400px" />
          </div>
          <div className="float-card">
            <div className="ic">🤲</div>
            <div>
              <b style={{ color: "#fff" }}>Aqiqah Plus Sedekah</b>
              <br />
              <small style={{ color: "var(--mist)" }}>100% keuntungan untuk wakaf & sedekah</small>
            </div>
          </div>
        </div>
        <div>
          <span className="tag">Tentang Kami</span>
          <h2>Setiap Kelahiran adalah Cahaya yang Patut Disyukuri</h2>
          <p>
            Ayah dan Bunda sedang merencanakan aqiqah ananda tercinta? Utsmani Aqiqah hadir sebagai layanan aqiqah terpercaya
            yang mudah dan penuh berkah — dari pemilihan hewan, penyembelihan sesuai syariat, hingga masakan siap saji diantar ke
            rumah.
          </p>
          <p>{settings.charity_note} Aqiqah ananda terlaksana, pahala sedekah melimpah.</p>
          <div className="ayat">
            <div className="ar" lang="ar">كُلُّ غُلَامٍ رَهِينَةٌ بِعَقِيقَتِهِ</div>
            <small>“Setiap anak tergadai dengan aqiqahnya.” — HR. Abu Dawud</small>
          </div>
          <div className="checks">
            <div><i>✦</i>{settings.service_area}</div>
            <div><i>✦</i>Aqiqah sudah termasuk masak</div>
            <div><i>✦</i>Sertifikat berfigura & merchandise</div>
            <div><i>✦</i>Penyembelihan sesuai syariat</div>
          </div>
          <Link className="btn btn-gold" href="/paket">
            Lihat Semua Paket →
          </Link>
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { icon: "📝", title: "Isi Formulir", text: "Isi formulir pemesanan atau hubungi admin kami via WhatsApp." },
  { icon: "🐑", title: "Pilih Hewan", text: "Pilih paket dan domba betina atau jantan sesuai kebutuhan." },
  { icon: "🤲", title: "Penyembelihan", text: "Disembelih sesuai syariat dengan doa atas nama buah hati." },
  { icon: "🚚", title: "Masak + Antar", text: "Hidangan dimasak dan diantar hangat ke lokasi acara Anda." },
];

export function Steps() {
  return (
    <section className="section bg-glow">
      <div className="container">
        <SectionHead tag="Alur Pemesanan" title="Empat Langkah Menuju Syukuran yang Tenang">
          Bagai rasi bintang — setiap langkah terhubung rapi dan terarah.
        </SectionHead>
        <div className="step-grid">
          <svg className="constellation" viewBox="0 0 1200 110" preserveAspectRatio="none" aria-hidden="true">
            <polyline points="150,48 450,30 750,62 1050,40" fill="none" stroke="rgba(232,200,114,.45)" strokeWidth="1.5" strokeDasharray="4 6" />
          </svg>
          {STEPS.map((s, i) => (
            <div className="step" key={s.title}>
              <div className="num">
                {s.icon}
                <span>{i + 1}</span>
              </div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MenuSection({ items }: { items: MenuItem[] }) {
  if (!items.length) return null;
  return (
    <section className="section bg-night-2" id="menu">
      <div className="container">
        <SectionHead tag="Menu Olahan" title="Hidangan Istimewa di Malam Syukuran">
          Olahan daging dan tulang domba yang bisa Anda pilih sesuai selera keluarga.
        </SectionHead>
        <div className="menu-grid">
          {items.map((m) => (
            <div className="dish" key={m.id}>
              <div className="plate">
                <div className="bowl">{m.imageUrl ? <img src={m.imageUrl} alt={m.name} loading="lazy" /> : m.icon || "🍽️"}</div>
              </div>
              <div className="txt">
                <h3>{m.name}</h3>
                {m.description && <p>{m.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function initials(name: string) {
  return name
    .replace(/^(pak|bu|ibu|bapak)\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export function Testimonials({ items }: { items: Testimonial[] }) {
  if (!items.length) return null;
  return (
    <section className="section bg-fade" id="testimoni">
      <div className="layer starfield" style={{ opacity: 0.4 }} />
      <div className="container">
        <SectionHead tag="Testimoni" title="Cerita Bahagia dari Para Orang Tua" />
        <div className="testi-grid">
          {items.map((t) => (
            <figure className="tcard" key={t.id}>
              <div className="stars" aria-label={`${t.rating} dari 5`}>{"✦".repeat(Math.max(0, Math.min(5, t.rating)))}</div>
              <blockquote>“{t.content}”</blockquote>
              <figcaption className="who">
                <div className="av">{initials(t.name)}</div>
                <div>
                  <b>{t.name}</b>
                  {t.subtitle && <small>{t.subtitle}</small>}
                </div>
                {t.imageUrl && (
                  <a href={t.imageUrl} target="_blank" rel="noopener">
                    Lihat bukti
                  </a>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Gallery({ items }: { items: GalleryImage[] }) {
  if (!items.length) return null;
  return (
    <section className="section bg-night-2" id="galeri">
      <div className="container">
        <SectionHead tag="Galeri" title="Promo & Informasi Terbaru" />
        <div className="gallery-grid">
          {items.map((g) => (
            <a href={g.imageUrl} target="_blank" rel="noopener" key={g.id}>
              <img src={g.imageUrl} alt={g.title} loading="lazy" />
              <span>{g.title}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export type PostSummary = { id: number; title: string; slug: string; excerpt: string | null; coverUrl: string | null; publishedAt: Date | null };

export function PostGrid({ posts }: { posts: PostSummary[] }) {
  if (!posts.length) return <p className="empty">Belum ada artikel.</p>;
  return (
    <div className="post-grid">
      {posts.map((p) => (
        <Link className="post-card" href={`/blog/${p.slug}`} key={p.id}>
          <div className="cover">{p.coverUrl && <img src={p.coverUrl} alt="" loading="lazy" />}</div>
          <div className="body">
            <time>{formatDate(p.publishedAt)}</time>
            <h3>{p.title}</h3>
            {p.excerpt && <p>{p.excerpt}</p>}
          </div>
        </Link>
      ))}
    </div>
  );
}

export function FaqSection({ items }: { items: Faq[] }) {
  if (!items.length) return null;
  return (
    <section className="section bg-glow" id="faq">
      <div className="container">
        <SectionHead tag="FAQ" title="Pertanyaan yang Sering Ditanyakan" />
        <div className="faq-list">
          {items.map((f, i) => (
            <details key={f.id} open={i === 0}>
              <summary>{f.question}</summary>
              <div className="answer">{f.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Offices({ items }: { items: Office[] }) {
  if (!items.length) return null;
  const map = items.find((o) => o.mapUrl)?.mapUrl;
  return (
    <section className="section bg-night-2" id="kontak">
      <div className="container">
        <SectionHead tag="Alamat Kami" title="Kunjungi Kantor Utsmani Aqiqah" />
        <div className="office-grid">
          {items.map((o) => (
            <div className="office" key={o.id}>
              <h3>{o.name}</h3>
              <p>📍 {o.address}</p>
              {o.phone && <p>📞 {o.phone}</p>}
            </div>
          ))}
        </div>
        {map && (
          <div className="map">
            <iframe src={map} title="Peta lokasi Utsmani Aqiqah" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        )}
      </div>
    </section>
  );
}

export function Cta({ settings }: { settings: Settings }) {
  return (
    <section className="section" style={{ paddingTop: 40 }}>
      <div className="container">
        <div className="cta-box">
          <div className="layer starfield" style={{ opacity: 0.6 }} />
          <div>
            <h2>Siap Menyambut Bintang Kecil Anda dengan Penuh Syukur?</h2>
            <p>Konsultasi gratis — admin kami siap membantu memilih paket terbaik.</p>
          </div>
          <div className="actions">
            {settings.whatsapp_primary && (
              <a className="btn btn-gold" href={waLink(settings.whatsapp_primary, settings.whatsapp_message)} target="_blank" rel="noopener">
                💬 Chat WhatsApp
              </a>
            )}
            <Link className="btn btn-line" href="/pesan">
              Isi Formulir
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
