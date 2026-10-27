import Link from "next/link";
import type { Package } from "@/generated/prisma/client";
import { rupiah, waLink } from "@/lib/format";
import { packageFeatures } from "@/lib/packages";

function PriceBox({ label, price, original }: { label: string; price: number | null; original: number | null }) {
  if (price == null) return null;
  return (
    <div>
      <small>{label}</small>
      {original != null && original > price && <span className="price-old">{rupiah(original)}</span>}
      <span className="price">{rupiah(price)}</span>
    </div>
  );
}

export function PackageCard({ pkg, whatsapp }: { pkg: Package; whatsapp: string }) {
  const features = packageFeatures(pkg);
  const hasPair = pkg.priceBetina != null || pkg.priceJantan != null;
  return (
    <article className={`pkg${pkg.featured ? " featured" : ""}`}>
      {pkg.featured && <span className="ribbon">REKOMENDASI</span>}
      <h4>{pkg.name}</h4>
      {pkg.subtitle && <div className="sub">{pkg.subtitle}</div>}

      {hasPair ? (
        <div className="price-row">
          <PriceBox label="Domba Betina" price={pkg.priceBetina} original={pkg.originalBetina} />
          <PriceBox label="Domba Jantan" price={pkg.priceJantan} original={pkg.originalJantan} />
        </div>
      ) : (
        pkg.price != null && (
          <span className="price price-lg">
            {rupiah(pkg.price)} <small style={{ fontSize: 14, color: "var(--mist)" }}>/box</small>
          </span>
        )
      )}

      <ul>
        {features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>

      <div className="pkg-actions">
        <Link className={`btn btn-sm ${pkg.featured ? "btn-gold" : "btn-line"}`} href={`/pesan?paket=${pkg.id}`}>
          Pesan
        </Link>
        {whatsapp && (
          <a
            className="btn btn-sm btn-line"
            href={waLink(whatsapp, `Assalamu'alaikum Utsmani Aqiqah, saya ingin bertanya tentang ${pkg.name}.`)}
            target="_blank"
            rel="noopener"
          >
            Tanya via WA
          </a>
        )}
      </div>
    </article>
  );
}
