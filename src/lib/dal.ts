import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { SESSION_COOKIE, decrypt } from "./session";

/** Wajib dipanggil di setiap halaman & server action admin. */
export const requireAdmin = cache(async () => {
  const session = await decrypt((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) redirect("/admin/login");
  const admin = await prisma.adminUser.findUnique({
    where: { id: session.adminId },
    select: { id: true, name: true, email: true },
  });
  if (!admin) redirect("/admin/login");
  return admin;
});
