import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";
import { getOffices } from "@/lib/queries";
import { getSettings } from "@/lib/settings";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, offices] = await Promise.all([getSettings(), getOffices()]);
  return (
    <>
      <Navbar logoUrl={settings.logo_url} siteName={settings.site_name} />
      <main>{children}</main>
      <Footer settings={settings} offices={offices} />
    </>
  );
}
