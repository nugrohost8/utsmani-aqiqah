"use client";

import { useActionState } from "react";
import { testWhatsApp } from "../../actions";

export function TestForm({ defaultNumber }: { defaultNumber: string }) {
  const [state, action, pending] = useActionState(testWhatsApp, {});
  return (
    <form action={action} className="a-card" style={{ marginBottom: 18 }}>
      {state.ok && <div className="a-flash ok">{state.ok}</div>}
      {state.error && <div className="a-flash err">{state.error}</div>}
      <div className="a-inline-form">
        <b>Tes kirim WA ke</b>
        <input className="a-input" name="number" defaultValue={state.values?.number ?? defaultNumber} placeholder="6281234567890" />
        <button className="a-btn" disabled={pending}>
          {pending ? "Mengirim…" : "Kirim Tes"}
        </button>
      </div>
    </form>
  );
}
