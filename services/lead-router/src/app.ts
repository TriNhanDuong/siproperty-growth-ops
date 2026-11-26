import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { leadSchema, metaSchema } from "@siproperty/contracts";
import { CapacityError, ConflictError, MemoryQueue } from "./queue";
import { equalSecret, validSignature } from "./security";
type Config = {
  token: string;
  metaVerifyToken?: string;
  metaAppSecret?: string;
};
class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(code);
  }
}
async function readBody(req: IncomingMessage) {
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 65536) throw new HttpError(413, "body_too_large");
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}
function json(res: ServerResponse, status: number, value: unknown) {
  res.writeHead(status, {
    "content-type": "application/json",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  res.end(JSON.stringify(value));
}
export function createApp(config: Config, queue = new MemoryQueue()) {
  if (config.token.length < 24)
    throw new Error("LEAD_ROUTER_TOKEN must contain at least 24 characters");
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? "/", "http://localhost");
      if (req.method === "GET" && url.pathname === "/health")
        return json(res, 200, {
          status: "ok",
          mode: "demo",
          storage: "volatile",
          ...queue.counts(),
        });
      if (url.pathname === "/webhooks/meta" && req.method === "GET") {
        if (!config.metaVerifyToken)
          return json(res, 503, { error: "meta_not_configured" });
        if (
          url.searchParams.get("hub.mode") !== "subscribe" ||
          !equalSecret(
            url.searchParams.get("hub.verify_token") ?? undefined,
            config.metaVerifyToken,
          )
        )
          return json(res, 403, { error: "verification_failed" });
        const challenge = url.searchParams.get("hub.challenge");
        if (!challenge || challenge.length > 200)
          return json(res, 400, { error: "invalid_challenge" });
        res.writeHead(200, {
          "content-type": "text/plain",
          "cache-control": "no-store",
        });
        res.end(challenge);
        return;
      }
      if (
        req.method !== "POST" ||
        !["/v1/leads", "/webhooks/meta"].includes(url.pathname)
      )
        return json(res, 404, { error: "not_found" });
      if (
        url.pathname === "/v1/leads" &&
        !equalSecret(req.headers.authorization, "Bearer " + config.token)
      )
        return json(res, 401, { error: "unauthorized" });
      if (url.pathname === "/webhooks/meta" && !config.metaAppSecret)
        return json(res, 503, { error: "meta_not_configured" });
      if (
        !req.headers["content-type"]
          ?.split(";")[0]
          .trim()
          .match(/^application\/json$/i)
      )
        return json(res, 415, { error: "json_required" });
      const raw = await readBody(req);
      if (
        url.pathname === "/webhooks/meta" &&
        !validSignature(
          raw,
          typeof req.headers["x-hub-signature-256"] === "string"
            ? req.headers["x-hub-signature-256"]
            : undefined,
          config.metaAppSecret!,
        )
      )
        return json(res, 401, { error: "invalid_signature" });
      let body: unknown;
      try {
        body = JSON.parse(raw.toString("utf8"));
      } catch {
        return json(res, 400, { error: "invalid_json" });
      }
      if (url.pathname === "/v1/leads") {
        const result = leadSchema.safeParse(body);
        if (!result.success) return json(res, 422, { error: "invalid_lead" });
        const key = req.headers["idempotency-key"];
        if (typeof key !== "string" || !/^[-a-zA-Z0-9_]{8,128}$/.test(key))
          return json(res, 400, { error: "invalid_idempotency_key" });
        const status = queue.enqueue({
          key: "landing:" + key,
          source: "landing",
          data: result.data,
        });
        return json(res, 202, {
          accepted: true,
          duplicate: status.duplicate,
          mode: "demo",
        });
      }
      const result = metaSchema.safeParse(body);
      if (!result.success)
        return json(res, 422, { error: "invalid_meta_payload" });
      let accepted = 0,
        duplicates = 0;
      // Each event is independently idempotent. If a batch fills capacity, retry safely replays accepted IDs.
      for (const entry of result.data.entry)
        for (const change of entry.changes) {
          const value = change.value;
          if (value.page_id !== entry.id)
            return json(res, 422, { error: "page_id_mismatch" });
          const status = queue.enqueue({
            key: "meta:" + value.page_id + ":" + value.leadgen_id,
            source: "meta",
            data: { pageId: value.page_id, leadId: value.leadgen_id },
          });
          status.duplicate ? duplicates++ : accepted++;
        }
      return json(res, 202, { accepted, duplicates, mode: "demo" });
    } catch (error) {
      if (error instanceof HttpError)
        return json(res, error.status, { error: error.code });
      if (error instanceof CapacityError)
        return json(res, 503, { error: "queue_full" });
      if (error instanceof ConflictError)
        return json(res, 409, { error: "idempotency_conflict" });
      json(res, 500, { error: "internal_error" });
    }
  });
  server.requestTimeout = 10000;
  server.headersTimeout = 10000;
  return { server, queue };
}
