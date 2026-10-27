import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageLoading } from "@/components/admin/PageLoading";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { RESOURCES } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { saveResource } from "../../../actions";

type Delegate = { findUnique(args: object): Promise<Record<string, unknown> | null> };

async function ResourceEditPageContent({ params }: PageProps<"/admin/[resource]/[id]">) {
  await requireAdmin();
  const { resource: key, id: idParam } = await params;
  const resource = RESOURCES[key];
  if (!resource) notFound();

  const isNew = idParam === "baru";
  const id = isNew ? null : Number(idParam);
  if (!isNew && !Number.isInteger(id)) notFound();

  let record: Record<string, unknown> | null = null;
  if (id) {
    record = await (prisma as unknown as Record<string, Delegate>)[resource.model].findUnique({ where: { id } });
    if (!record) notFound();
  }

  const values: Record<string, string | boolean | null> = {};
  for (const f of resource.fields) {
    const v = record?.[f.name];
    if (f.type === "boolean") values[f.name] = record ? v === true : f.name === "active";
    else if (v == null) values[f.name] = f.name === "sortOrder" ? "0" : f.name === "rating" ? "5" : f.type === "select" ? (f.options?.[0]?.value ?? "") : "";
    else values[f.name] = String(v);
  }

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>{isNew ? `Tambah ${resource.singular}` : `Edit ${resource.singular}`}</h1>
          <p>{resource.label}</p>
        </div>
      </div>
      <ResourceForm fields={resource.fields} values={values} action={saveResource.bind(null, key, id)} cancelHref={resource.returnTo ?? `/admin/${key}`} />
    </>
  );
}

// Suspense di dalam page (bukan loading.tsx) agar tetap berada di bawah layout bersama pada navigasi klien.
export default function ResourceEditPage(props: PageProps<"/admin/[resource]/[id]">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <ResourceEditPageContent {...props} />
    </Suspense>
  );
}
