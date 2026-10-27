"use client";

import { useActionState } from "react";
import { login } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action}>
      {state.error && <div className="a-flash err">{state.error}</div>}
      <div className="a-field" style={{ marginBottom: 14 }}>
        <label htmlFor="email">Email</label>
        <input className="a-input" id="email" name="email" type="email" autoComplete="username" defaultValue={state.values?.email} required />
      </div>
      <div className="a-field" style={{ marginBottom: 20 }}>
        <label htmlFor="password">Password</label>
        <input className="a-input" id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <button className="a-btn" style={{ width: "100%", justifyContent: "center" }} disabled={pending}>
        {pending ? "Masuk…" : "Masuk"}
      </button>
    </form>
  );
}
