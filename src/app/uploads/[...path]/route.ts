import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { UPLOAD_ROOT } from "@/lib/uploads";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(_req: Request, ctx: RouteContext<"/uploads/[...path]">) {
  const { path: parts } = await ctx.params;
  const filePath = path.resolve(UPLOAD_ROOT, ...parts);
  const type = TYPES[path.extname(filePath).toLowerCase()];
  if (!filePath.startsWith(UPLOAD_ROOT + path.sep) || !type) {
    return new Response("Not found", { status: 404 });
  }
  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error();
    return new Response(new Uint8Array(await readFile(filePath)), {
      headers: {
        "Content-Type": type,
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
