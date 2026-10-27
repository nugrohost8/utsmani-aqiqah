import type { Metadata } from "next";
import { PageHead } from "@/components/site/Hero";
import { PackageCard } from "@/components/site/PackageCard";
import { Cta } from "@/components/site/Sections";
import { CATEGORY_INFO, CATEGORY_ORDER } from "@/lib/packages";
import { getPackages } from "@/lib/queries";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Daftar Harga Paket Aqiqah",
  description: "Harga paket aqiqah + masak, bundling nasi box, nasi box, dan domba hidup Utsmani Aqiqah Bandung.",
};

export default async function PaketPage() {
  const [settings, packages] = await Promise.all([getSettings(), getPackages()]);
  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    info: CATEGORY_INFO[category],
    items: packages.filter((p) => p.category === category),
  })).filter((g) => g.items.length);

  return (
    <>
      <PageHead tag="Paket & Harga" title="Daftar Harga Paket Aqiqah" description={settings.charity_note} />
      <section className="section bg-fade" style={{ paddingTop: 60 }}>
        <div className="container">
          <nav className="pkg-tabs" aria-label="Kategori paket">
            {groups.map((g) => (
              <a key={g.category} href={`#${g.info.anchor}`}>
                {g.info.label}
              </a>
            ))}
          </nav>
          {groups.map((g) => (
            <div className="pkg-group" id={g.info.anchor} key={g.category}>
              <h3>{g.info.label}</h3>
              <p>{g.info.description}</p>
              <div className="pkg-grid">
                {g.items.map((p) => (
                  <PackageCard key={p.id} pkg={p} whatsapp={settings.whatsapp_primary} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <Cta settings={settings} />
    </>
  );
}
