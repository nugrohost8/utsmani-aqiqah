import "server-only";
import { prisma } from "./db";
import { normalizePhone } from "./format";

/**
 * Klien WA Gateway Homeitop (https://wag.homeitop.web.id/api/docs).
 * Nomor gateway hanya dipakai untuk mengirim; semua pesan dicatat ke tabel WaMessage.
 */

export type SendResult = { ok: boolean; error?: string };

type SendInput = { number: string; message: string; purpose: string; orderId?: number | null };

const TIMEOUT_MS = 15_000;

export function waConfigured() {
  return Boolean(process.env.WA_GATEWAY_URL && process.env.WA_API_KEY && process.env.WA_SENDER);
}

export function gatewaySender() {
  return normalizePhone(process.env.WA_SENDER ?? "");
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function post(number: string, message: string): Promise<SendResult & { retryAfter?: number }> {
  const url = `${process.env.WA_GATEWAY_URL!.replace(/\/+$/, "")}/send-message`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ api_key: process.env.WA_API_KEY, sender: process.env.WA_SENDER, number, message }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    const body = (await res.json().catch(() => null)) as { status?: boolean; msg?: string; message?: string } | null;
    if (res.ok && body?.status === true) return { ok: true };

    const detail = body?.msg ?? body?.message ?? res.statusText;
    if (res.status === 429) return { ok: false, error: `Batas kirim gateway tercapai (429)`, retryAfter: Number(res.headers.get("retry-after")) || 5 };
    if (res.status === 403) return { ok: false, error: `Langganan gateway habis (403): ${detail}` };
    if (res.status >= 500) return { ok: false, error: `Gateway bermasalah (${res.status}): ${detail}`, retryAfter: 3 };
    return { ok: false, error: `Ditolak gateway (${res.status}): ${detail}` };
  } catch (e) {
    const timeout = e instanceof Error && e.name === "TimeoutError";
    return { ok: false, error: timeout ? "Gateway tidak merespons (timeout)" : `Gagal menghubungi gateway: ${(e as Error).message}`, retryAfter: 3 };
  }
}

/** Kirim pesan teks. Tidak pernah throw: kegagalan dicatat di log dan dikembalikan sebagai { ok: false }. */
export async function sendWhatsApp({ number, message, purpose, orderId }: SendInput): Promise<SendResult> {
  const to = normalizePhone(number);
  let result: SendResult & { retryAfter?: number };

  if (!waConfigured()) result = { ok: false, error: "WA gateway belum dikonfigurasi (WA_GATEWAY_URL / WA_API_KEY / WA_SENDER)" };
  else if (!to) result = { ok: false, error: "Nomor tujuan kosong" };
  else {
    result = await post(to, message);
    // Error sementara (429, 5xx, timeout) dicoba ulang sekali.
    if (!result.ok && result.retryAfter) {
      await sleep(Math.min(result.retryAfter, 10) * 1000);
      result = await post(to, message);
    }
  }

  try {
    await prisma.waMessage.create({
      data: { direction: "OUT", number: to || number, message, purpose, orderId: orderId ?? null, ok: result.ok, error: result.error ?? null },
    });
  } catch (e) {
    console.error("[whatsapp] gagal mencatat log", e);
  }
  if (!result.ok) console.error(`[whatsapp] ${purpose} ke ${to}: ${result.error}`);
  return { ok: result.ok, error: result.error };
}
