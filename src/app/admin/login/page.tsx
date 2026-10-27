import { Logo } from "@/components/Logo";
import { getSettings } from "@/lib/settings";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const settings = await getSettings();
  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="brand">
          <Logo src={settings.logo_url} alt={settings.site_name} height={40} />
        </div>
        <h1 style={{ fontSize: 22, marginBottom: 4 }}>Masuk Admin</h1>
        <p style={{ color: "var(--a-muted)", marginBottom: 20, fontSize: 14 }}>Kelola konten website Utsmani Aqiqah.</p>
        <LoginForm />
      </div>
    </div>
  );
}
