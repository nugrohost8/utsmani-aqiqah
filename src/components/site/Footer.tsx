import Link from "next/link";
import { Logo } from "../Logo";
import type { Settings } from "@/lib/settings";
import { waLink } from "@/lib/format";
import { WhatsAppIcon } from "./icons";

export function Footer({ settings, offices }: { settings: Settings; offices: { id: number; name: string; address: string }[] }) {
  const head = offices[0];
  return (
    <footer className="footer">
      <div className="container">
        <div className="foot-grid">
          <div>
            <Logo src={settings.logo_url} alt={settings.site_name} height={46} />
            <p>{settings.charity_note}</p>
          </div>
          <div>
            <h4>Layanan</h4>
            <ul>
              <li><Link href="/paket#aqiqah-masak">Aqiqah + Masak</Link></li>
              <li><Link href="/paket#bundling">Bundling Nasi Box</Link></li>
              <li><Link href="/paket#nasi-box">Nasi Box</Link></li>
              <li><Link href="/paket#domba-hidup">Domba Hidup</Link></li>
            </ul>
          </div>
          <div>
            <h4>Informasi</h4>
            <ul>
              <li><Link href="/#tentang">Tentang Kami</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/#faq">FAQ</Link></li>
              <li><Link href="/pesan">Formulir Pemesanan</Link></li>
            </ul>
          </div>
          <div>
            <h4>Hubungi Kami</h4>
            <ul>
              {head && <li>📍 {head.address}</li>}
              {settings.whatsapp_primary && (
                <li><a href={waLink(settings.whatsapp_primary)} target="_blank" rel="noopener">📞 Admin 1: +{settings.whatsapp_primary}</a></li>
              )}
              {settings.whatsapp_secondary && (
                <li><a href={waLink(settings.whatsapp_secondary)} target="_blank" rel="noopener">📞 Admin 2: +{settings.whatsapp_secondary}</a></li>
              )}
              {settings.email && <li><a href={`mailto:${settings.email}`}>✉ {settings.email}</a></li>}
            </ul>
          </div>
        </div>
        <div className="copy">
          <span>© {settings.site_name} — {settings.tagline}</span>
          <span style={{ display: "flex", gap: 16 }}>
            {settings.instagram && <a href={`https://www.instagram.com/${settings.instagram}`} target="_blank" rel="noopener">Instagram</a>}
            {settings.facebook && <a href={`https://www.facebook.com/${settings.facebook}`} target="_blank" rel="noopener">Facebook</a>}
          </span>
        </div>
      </div>
      {settings.whatsapp_primary && (
        <a className="wa-float" href={waLink(settings.whatsapp_primary, settings.whatsapp_message)} target="_blank" rel="noopener" aria-label="Chat WhatsApp">
          <WhatsAppIcon />
        </a>
      )}
    </footer>
  );
}
