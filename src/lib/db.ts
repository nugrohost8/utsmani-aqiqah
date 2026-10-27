import "server-only";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  return new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL!) });
}

// Di dev, instance disimpan di globalThis agar tidak membuat koneksi baru tiap hot reload.
// Setelah `prisma generate`, kelas PrismaClient berganti; instance lama (tanpa model baru)
// dibuang supaya tidak muncul error seperti "Cannot read properties of undefined (reading 'findMany')".
let cached: PrismaClient | undefined = globalForPrisma.prisma;
if (cached && !(cached instanceof PrismaClient)) {
  void (cached as { $disconnect(): Promise<void> }).$disconnect();
  cached = undefined;
}

export const prisma = cached ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
