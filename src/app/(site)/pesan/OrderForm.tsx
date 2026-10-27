"use client";

import { useActionState, useState } from "react";
import { createOrder, type OrderFormState } from "./actions";

type PackageOption = { id: number; label: string; group: string; hasAnimal: boolean };

function FieldError({ state, name }: { state: OrderFormState; name: string }) {
  const msg = state.fieldErrors?.[name]?.[0];
  return msg ? <div className="err">{msg}</div> : null;
}

export function OrderForm({ packages, initialPackageId, minDate }: { packages: PackageOption[]; initialPackageId?: number; minDate: string }) {
  const [state, action, pending] = useActionState(createOrder, {});
  const v = state.values ?? {};
  const [packageId, setPackageId] = useState(v.packageId ?? (initialPackageId ? String(initialPackageId) : ""));
  const selected = packages.find((p) => String(p.id) === packageId);
  const groups = [...new Set(packages.map((p) => p.group))];

  return (
    <form action={action} className="form-card" noValidate>
      {state.error && (
        <div className="alert alert-error" role="alert">
          {state.error}
        </div>
      )}
      <div className="hp" aria-hidden="true">
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="form-grid">
        <div className="field">
          <label htmlFor="customerName">Nama pemesan *</label>
          <input className="input" id="customerName" name="customerName" defaultValue={v.customerName} required autoComplete="name" />
          <FieldError state={state} name="customerName" />
        </div>
        <div className="field">
          <label htmlFor="phone">No. WhatsApp *</label>
          <input className="input" id="phone" name="phone" type="tel" defaultValue={v.phone} placeholder="081234567890" required autoComplete="tel" />
          <FieldError state={state} name="phone" />
        </div>

        <div className="field">
          <label htmlFor="babyName">Nama bayi *</label>
          <input className="input" id="babyName" name="babyName" defaultValue={v.babyName} required />
          <FieldError state={state} name="babyName" />
        </div>
        <div className="field">
          <label>Jenis kelamin bayi *</label>
          <div className="radio-row">
            <label>
              <input type="radio" name="babyGender" value="LAKI_LAKI" defaultChecked={v.babyGender === "LAKI_LAKI"} /> Laki-laki
            </label>
            <label>
              <input type="radio" name="babyGender" value="PEREMPUAN" defaultChecked={v.babyGender === "PEREMPUAN"} /> Perempuan
            </label>
          </div>
          <FieldError state={state} name="babyGender" />
        </div>

        <div className="field">
          <label htmlFor="babyBirthDate">Tanggal lahir bayi</label>
          <input className="input" id="babyBirthDate" name="babyBirthDate" type="date" defaultValue={v.babyBirthDate} />
          <FieldError state={state} name="babyBirthDate" />
        </div>
        <div className="field">
          <label htmlFor="eventDate">Tanggal acara / pengiriman *</label>
          <input className="input" id="eventDate" name="eventDate" type="date" min={minDate} defaultValue={v.eventDate} required />
          <FieldError state={state} name="eventDate" />
        </div>

        <div className="field full">
          <label htmlFor="packageId">Paket *</label>
          <select className="input" id="packageId" name="packageId" value={packageId} onChange={(e) => setPackageId(e.target.value)} required>
            <option value="">— Pilih paket —</option>
            {groups.map((g) => (
              <optgroup key={g} label={g}>
                {packages
                  .filter((p) => p.group === g)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
          <FieldError state={state} name="packageId" />
        </div>

        {selected?.hasAnimal && (
          <div className="field">
            <label>Jenis domba *</label>
            <div className="radio-row">
              <label>
                <input type="radio" name="animalSex" value="BETINA" defaultChecked={v.animalSex === "BETINA"} /> Betina
              </label>
              <label>
                <input type="radio" name="animalSex" value="JANTAN" defaultChecked={v.animalSex === "JANTAN"} /> Jantan
              </label>
            </div>
            <FieldError state={state} name="animalSex" />
          </div>
        )}
        <div className="field">
          <label htmlFor="quantity">Jumlah *</label>
          <input className="input" id="quantity" name="quantity" type="number" min={1} max={1000} defaultValue={v.quantity || "1"} required />
          <div className="hint">{selected && !selected.hasAnimal ? "Jumlah box" : "Jumlah paket"}</div>
          <FieldError state={state} name="quantity" />
        </div>

        <div className="field full">
          <label htmlFor="address">Alamat pengiriman *</label>
          <textarea className="input" id="address" name="address" rows={3} defaultValue={v.address} required autoComplete="street-address" />
          <FieldError state={state} name="address" />
        </div>
        <div className="field full">
          <label htmlFor="notes">Catatan</label>
          <textarea className="input" id="notes" name="notes" rows={3} defaultValue={v.notes} placeholder="Pilihan olahan (sate, gule, tongseng…), jam pengiriman, dll." />
          <FieldError state={state} name="notes" />
        </div>
      </div>

      <button className="btn btn-gold btn-block" style={{ marginTop: 28 }} disabled={pending}>
        {pending ? "Mengirim…" : "Kirim Pesanan"}
      </button>
    </form>
  );
}
