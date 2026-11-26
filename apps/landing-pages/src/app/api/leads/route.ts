import { leadSchema } from "@siproperty/contracts";
export const runtime = "nodejs";
const reply = (status: number, value: unknown) =>
  Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin)
    return reply(403, { error: "origin_not_allowed" });
  if (
    request.headers.get("content-type")?.split(";")[0].trim() !==
    "application/json"
  )
    return reply(415, { error: "json_required" });
  const key = request.headers.get("idempotency-key");
  if (!key || !/^[-a-zA-Z0-9_]{8,128}$/.test(key))
    return reply(400, { error: "invalid_idempotency_key" });
  const reader = request.body?.getReader();
  if (!reader) return reply(400, { error: "invalid_json" });
  let raw = "";
  let bytes = 0;
  const decoder = new TextDecoder();
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > 16384) {
        await reader.cancel();
        return reply(413, { error: "body_too_large" });
      }
      raw += decoder.decode(chunk.value, { stream: true });
    }
    raw += decoder.decode();
  } finally {
    reader.releaseLock();
  }
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return reply(400, { error: "invalid_json" });
  }
  const parsed = leadSchema.safeParse(data);
  if (!parsed.success) return reply(422, { error: "invalid_lead" });
  const base = process.env.LEAD_ROUTER_URL;
  const token = process.env.LEAD_ROUTER_TOKEN;
  if (!base || !token) return reply(503, { error: "router_not_configured" });
  try {
    const upstream = await fetch(new URL("/v1/leads", base), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer " + token,
        "idempotency-key": key,
      },
      body: JSON.stringify(parsed.data),
      signal: AbortSignal.timeout(5000),
      redirect: "error",
    });
    if (upstream.status === 202)
      return reply(202, { accepted: true, mode: "demo" });
    if (upstream.status === 409)
      return reply(409, { error: "idempotency_conflict" });
    return reply(503, { error: "router_unavailable" });
  } catch {
    return reply(503, { error: "router_unavailable" });
  }
}
