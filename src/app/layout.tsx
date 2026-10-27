import type { Metadata } from "next";
import { Amiri, Cinzel, Cormorant_Garamond, Nunito_Sans } from "next/font/google";
import "./globals.css";

const serif = Cormorant_Garamond({ variable: "--font-serif", subsets: ["latin"], weight: ["500", "600", "700"], style: ["normal", "italic"] });
const display = Cinzel({ variable: "--font-display", subsets: ["latin"], weight: ["500", "700"] });
const sans = Nunito_Sans({ variable: "--font-sans", subsets: ["latin"] });
const arabic = Amiri({ variable: "--font-arabic", subsets: ["arabic"], weight: ["700"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: { default: "Utsmani Aqiqah — Aqiqah Mudah Penuh Berkah", template: "%s · Utsmani Aqiqah" },
  description:
    "Layanan aqiqah sudah masak plus sedekah di Bandung. Domba pilihan, penyembelihan sesuai syariat, gratis ongkir Bandung, 100% keuntungan untuk wakaf & sedekah.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${serif.variable} ${display.variable} ${sans.variable} ${arabic.variable}`}>
      <body>{children}</body>
    </html>
  );
}
