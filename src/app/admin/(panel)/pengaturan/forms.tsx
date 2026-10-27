"use client";

import { useActionState } from "react";
import { ImageInput } from "@/components/admin/ResourceForm";
import { changePassword, saveSettings } from "../../actions";

type SettingField = { key: string; label: string; textarea?: boolean; image?: boolean; help?: string };

export function SettingsForm({ fields, values }: { fields: SettingField[]; values: Record<string, string> }) {
  const [state, action, pending] = useActionState(saveSettings, {});
  const current = { ...values, ...state.values };
  return (
    <form action={action} className="a-card">
      {state.ok && <div className="a-flash ok">{state.ok}</div>}
      {state.error && <div className="a-flash err">{state.error}</div>}
      <div className="a-form">
        {fields.map((f) => (
          <div key={f.key} className={`a-field${f.textarea || f.image ? " full" : ""}`}>
            <label htmlFor={f.key}>{f.label}</label>
            {f.image ? (
              <div className="a-logo-preview">
                <ImageInput key={current[f.key]} field={{ name: f.key }} value={current[f.key] ?? ""} />
              </div>
            ) : f.textarea ? (
              <textarea className="a-input" id={f.key} name={f.key} rows={3} defaultValue={current[f.key]} />
            ) : (
              <input className="a-input" id={f.key} name={f.key} defaultValue={current[f.key]} />
            )}
            {f.help && <div className="hint">{f.help}</div>}
          </div>
        ))}
      </div>
      <div className="a-form-actions">
        <button className="a-btn" disabled={pending}>
          {pending ? "Menyimpan…" : "Simpan Pengaturan"}
        </button>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, {});
  return (
    <form action={action} className="a-card">
      {state.ok && <div className="a-flash ok">{state.ok}</div>}
      {state.error && <div className="a-flash err">{state.error}</div>}
      <div className="a-form">
        <div className="a-field full">
          <label htmlFor="current">Password lama</label>
          <input className="a-input" id="current" name="current" type="password" autoComplete="current-password" required />
        </div>
        <div className="a-field">
          <label htmlFor="next">Password baru</label>
          <input className="a-input" id="next" name="next" type="password" autoComplete="new-password" minLength={10} required />
          <div className="hint">Minimal 10 karakter</div>
        </div>
        <div className="a-field">
          <label htmlFor="confirm">Ulangi password baru</label>
          <input className="a-input" id="confirm" name="confirm" type="password" autoComplete="new-password" required />
        </div>
      </div>
      <div className="a-form-actions">
        <button className="a-btn" disabled={pending}>
          {pending ? "Menyimpan…" : "Ganti Password"}
        </button>
      </div>
    </form>
  );
}
