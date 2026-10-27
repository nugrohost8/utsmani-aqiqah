/* eslint-disable @next/next/no-img-element -- thumbnail upload */
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { PageLoading } from "@/components/admin/PageLoading";
import { COLUMN_LABELS, RESOURCES } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { formatDate, rupiah } from "@/lib/format";
import { CATEGORY_INFO } from "@/lib/packages";
import { deleteResource } from "../../actions";

type Row = Record<string, unknown> & { id: number };
type ListDelegate = { findMany(args: object): Promise<Row[]> };

function Cell({ column, value }: { column: string; value: unknown }) {
  if (typeof value === "boolean") return <span className={`badge ${value ? "on" : "off"}`}>{value ? "Ya" : "Tidak"}</span>;
  if (value == null || value === "") return <span style={{ color: "var(--a-muted)" }}>—</span>;
  if (column === "imageUrl") return <img className="thumb" src={String(value)} alt="" />;
  if (column === "category") return <>{CATEGORY_INFO[value as keyof typeof CATEGORY_INFO]?.label ?? String(value)}</>;
  if (column.startsWith("price")) return <>{rupiah(Number(value))}</>;
  if (value instanceof Date) return <>{formatDate(value)}</>;
  const text = String(value);
  return <>{text.length > 80 ? `${text.slice(0, 80)}…` : text}</>;
}

async function ResourceListPageContent({ params, searchParams }: PageProps<"/admin/[resource]">) {
  await requireAdmin();
  const { resource: key } = await params;
  const resource = RESOURCES[key];
  if (!resource) notFound();
  const sp = await searchParams;

  const delegate = (prisma as unknown as Record<string, ListDelegate>)[resource.model];
  const rows = await delegate.findMany({ orderBy: resource.orderBy });

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>
            {resource.icon} {resource.label}
          </h1>
          <p>{rows.length} data</p>
        </div>
        <Link className="a-btn" href={`/admin/${key}/baru`}>
          + Tambah {resource.singular}
        </Link>
      </div>
      {sp.saved && <div className="a-flash ok">Data tersimpan.</div>}
      {sp.deleted && <div className="a-flash ok">Data dihapus.</div>}
      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              {resource.columns.map((c) => (
                <th key={c}>{COLUMN_LABELS[c] ?? c}</th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={resource.columns.length + 1} style={{ color: "var(--a-muted)" }}>
                  Belum ada data.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id}>
                {resource.columns.map((c, i) => (
                  <td key={c}>
                    {i === resource.columns.findIndex((col) => !["imageUrl", "icon"].includes(col)) ? (
                      <Link className="link" href={`/admin/${key}/${row.id}`}>
                        <Cell column={c} value={row[c]} />
                      </Link>
                    ) : (
                      <Cell column={c} value={row[c]} />
                    )}
                  </td>
                ))}
                <td className="actions">
                  {key === "blog" && row.published === true && (
                    <a className="a-btn sm ghost" href={`/blog/${row.slug}`} target="_blank">
                      Lihat
                    </a>
                  )}
                  <Link className="a-btn sm ghost" href={`/admin/${key}/${row.id}`}>
                    Edit
                  </Link>
                  <ConfirmButton action={deleteResource.bind(null, key, row.id)} message={`Hapus ${resource.singular.toLowerCase()} ini?`}>
                    Hapus
                  </ConfirmButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// Suspense di dalam page (bukan loading.tsx) agar tetap berada di bawah layout bersama pada navigasi klien.
export default function ResourceListPage(props: PageProps<"/admin/[resource]">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <ResourceListPageContent {...props} />
    </Suspense>
  );
}
