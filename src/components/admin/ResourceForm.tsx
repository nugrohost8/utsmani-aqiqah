"use client";

/* eslint-disable @next/next/no-img-element -- pratinjau gambar upload */
import Link from "next/link";
import { useActionState, useState } from "react";
import type { FormState } from "@/app/admin/actions";
import type { Field } from "@/lib/admin/resources";

type Values = Record<string, string | boolean | null>;

export function ImageInput({ field, value }: { field: Pick<Field, "name">; value: string }) {
  const [preview, setPreview] = useState(value);
  return (
    <div className="a-image">
      {preview && <img src={preview} alt="" />}
      <div style={{ flex: 1 }}>
        <input type="hidden" name={field.name} value={value} />
        <input
          className="a-input"
          type="file"
          name={`${field.name}__file`}
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => {
            const f = e.target.files?.[0];
            setPreview(f ? URL.createObjectURL(f) : value);
          }}
        />
        <div className="hint">JPG/PNG/WEBP, maks. 5 MB</div>
        {value && (
          <label style={{ display: "flex", gap: 6, alignItems: "center", fontWeight: 600, fontSize: 13, marginTop: 6 }}>
            <input type="checkbox" name={`${field.name}__remove`} /> Hapus gambar
          </label>
        )}
      </div>
    </div>
  );
}

function FieldInput({ field, value }: { field: Field; value: string | boolean | null }) {
  const str = typeof value === "string" ? value : "";
  switch (field.type) {
    case "textarea":
    case "markdown":
      return <textarea className="a-input" id={field.name} name={field.name} rows={field.type === "markdown" ? 18 : 4} defaultValue={str} placeholder={field.placeholder} />;
    case "number":
    case "money":
      return <input className="a-input" id={field.name} name={field.name} inputMode="numeric" defaultValue={str} placeholder={field.type === "money" ? "mis. 1450000" : field.placeholder} />;
    case "select":
      return (
        <select className="a-input" id={field.name} name={field.name} defaultValue={str}>
          {!field.required && <option value="">—</option>}
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case "image":
      return <ImageInput field={field} value={str} />;
    default:
      return <input className="a-input" id={field.name} name={field.name} defaultValue={str} placeholder={field.placeholder} />;
  }
}

export function ResourceForm({
  fields,
  values,
  action,
  cancelHref,
}: {
  fields: Field[];
  values: Values;
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const sent = state.values;
  const current = (f: Field) => (sent ? (f.type === "boolean" ? sent[f.name] === "on" : sent[f.name]) : values[f.name]) ?? null;
  const wide = (f: Field) => ["textarea", "markdown", "image"].includes(f.type) || f.name === "name" || f.name === "title";

  return (
    <form action={formAction} className="a-card">
      {state.error && <div className="a-flash err">{state.error}</div>}
      <div className="a-form">
        {fields.map((f) =>
          f.type === "boolean" ? (
            <label key={f.name} className="a-check">
              <input type="checkbox" name={f.name} defaultChecked={current(f) === true} /> {f.label}
            </label>
          ) : (
            <div key={f.name} className={`a-field${wide(f) ? " full" : ""}`}>
              <label htmlFor={f.name}>
                {f.label}
                {f.required && " *"}
              </label>
              <FieldInput field={f} value={current(f)} />
              {f.help && <div className="hint">{f.help}</div>}
              {state.fieldErrors?.[f.name] && <div className="err">{state.fieldErrors[f.name]}</div>}
            </div>
          ),
        )}
      </div>
      <div className="a-form-actions">
        <button className="a-btn" disabled={pending}>
          {pending ? "Menyimpan…" : "Simpan"}
        </button>
        <Link className="a-btn ghost" href={cancelHref}>
          Batal
        </Link>
      </div>
    </form>
  );
}
