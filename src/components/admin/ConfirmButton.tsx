"use client";

/** Tombol submit yang meminta konfirmasi sebelum menjalankan server action. */
export function ConfirmButton({ action, message, children }: { action: () => Promise<void>; message: string; children: React.ReactNode }) {
  return (
    <form
      action={action}
      style={{ display: "inline" }}
      onSubmit={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      <button className="a-btn sm danger">{children}</button>
    </form>
  );
}
