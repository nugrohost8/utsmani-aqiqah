import Link from "next/link";
import { Hero } from "@/components/site/Hero";
import { PackageCard } from "@/components/site/PackageCard";
import { About, Cta, FaqSection, Gallery, MenuSection, Offices, PostGrid, SectionHead, Stats, Steps, Testimonials } from "@/components/site/Sections";
import {
  getFaqs,
  getGallery,
  getHeroSlides,
  getMenuItems,
  getOffices,
  getPackages,
  getPublishedPosts,
  getTestimonials,
} from "@/lib/queries";
import { getSettings } from "@/lib/settings";

export default async function HomePage() {
  const [settings, slides, packages, menu, testimonials, gallery, posts, faqs, offices] = await Promise.all([
    getSettings(),
    getHeroSlides(),
    getPackages("AQIQAH_MASAK"),
    getMenuItems(),
    getTestimonials(),
    getGallery(),
    getPublishedPosts(3),
    getFaqs(),
    getOffices(),
  ]);

  return (
    <>
      <Hero slides={slides.map((s) => ({ ...s, eyebrow: s.eyebrow ?? "" }))} tagline={settings.tagline} />
      <Stats
        items={[
          { value: String(packages.length), label: "Tipe Paket Aqiqah" },
          { value: String(offices.length), label: "Kantor Layanan" },
          { value: "100%", label: "Keuntungan untuk Sedekah" },
          { value: "Gratis", label: "Ongkir Bandung" },
        ]}
      />
      <About settings={settings} />

      <section className="section bg-fade" id="paket">
        <div className="layer starfield" style={{ opacity: 0.35 }} />
        <div className="container">
          <SectionHead tag="Paket Aqiqah + Masak" title="Pilih Paket Sesuai Kebutuhan Keluarga">
            Harga sudah termasuk domba, penyembelihan, pengolahan, dan pengantaran.
          </SectionHead>
          <div className="pkg-grid">
            {packages.map((p) => (
              <PackageCard key={p.id} pkg={p} whatsapp={settings.whatsapp_primary} />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 44 }}>
            <Link className="btn btn-line" href="/paket">
              Lihat Paket Bundling, Nasi Box & Domba Hidup →
            </Link>
          </div>
        </div>
      </section>

      <Steps />
      <MenuSection items={menu} />
      <Testimonials items={testimonials} />
      <Gallery items={gallery} />

      {posts.length > 0 && (
        <section className="section bg-fade">
          <div className="container">
            <SectionHead tag="Blog" title="Artikel Seputar Aqiqah" />
            <PostGrid posts={posts} />
          </div>
        </section>
      )}

      <FaqSection items={faqs} />
      <Offices items={offices} />
      <Cta settings={settings} />
    </>
  );
}
