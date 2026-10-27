import { createHash, timingSafeEqual } from "node:crypto";
import { after, type NextRequest } from "next/server";
import { handleIncoming, type IncomingPayload } from "@/lib/wa-notify";

/**
 * Webhook pesan masuk dari WA Gateway Homeitop.
 * URL: /api/wa/webhook/{WA_WEBHOOK_SECRET} — gateway tidak mengirim signature, jadi rahasia ada di path.
 */

function validSecret(given: string) {
  const expected = process.env.WA_WEBHOOK_SECRET;
  if (!expected) return false;
  // Bandingkan hash agar panjang sama dan waktu perbandingan konstan.
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function POST(request: NextRequest, ctx: RouteContext<"/api/wa/webhook/[secret]">) {
  const { secret } = await ctx.params;
  if (!validSecret(secret)) return new Response("Not found", { status: 404 });

  const payload = (await request.json().catch(() => null)) as IncomingPayload | null;
  if (!payload || typeof payload !== "object") return Response.json({ ok: false }, { status: 400 });

  // Balas segera; gateway tidak mengulang pengiriman webhook, jadi pemrosesan jangan sampai membuatnya timeout.
  after(async () => {
    try {
      await handleIncoming(payload);
    } catch (e) {
      console.error("[wa-webhook] gagal memproses pesan masuk", e);
    }
  });
  return Response.json({ ok: true });
}

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/wa/webhook/[secret]">) {
  const { secret } = await ctx.params;
  if (!validSecret(secret)) return new Response("Not found", { status: 404 });
  return Response.json({ ok: true, message: "Webhook WA aktif" });
}
