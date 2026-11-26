import { afterAll, beforeAll, describe, it, expect } from "vitest";
import type { AddressInfo } from "node:net";
import { createHmac } from "node:crypto";
import { createApp } from "../../services/lead-router/src/app";
import { MemoryQueue } from "../../services/lead-router/src/queue";
const token = "synthetic-router-token-for-integration-tests";
const secret = "synthetic-meta-secret-for-integration-tests";
const queue = new MemoryQueue();
const { server } = createApp(
  { token, metaVerifyToken: "demo-verify", metaAppSecret: secret },
  queue,
);
let base = "";
const lead = {
  fullName: "Demo Buyer",
  phone: "+12025550123",
  consent: true,
  projectId: "harbour-residences",
  variant: "a",
};
beforeAll(async () => {
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = "http://127.0.0.1:" + (server.address() as AddressInfo).port;
});
afterAll(async () => {
  server.closeAllConnections();
  await new Promise<void>((resolve) => server.close(() => resolve()));
});
function post(
  path: string,
  body: unknown,
  headers: Record<string, string> = {},
) {
  return fetch(base + path, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}
describe("real HTTP router", () => {
  it("health reports the volatile demo boundary without payloads", async () => {
    const r = await fetch(base + "/health");
    expect(r.status).toBe(200);
    expect(await r.json()).toMatchObject({ mode: "demo", storage: "volatile" });
  });
  it("requires backend authentication", async () => {
    expect((await post("/v1/leads", lead)).status).toBe(401);
  });
  it("validates consent on the server", async () => {
    expect(
      (
        await post(
          "/v1/leads",
          { ...lead, consent: false },
          {
            authorization: "Bearer " + token,
            "idempotency-key": "invalid-consent",
          },
        )
      ).status,
    ).toBe(422);
  });
  it("requires an explicit bounded idempotency key", async () => {
    expect(
      (await post("/v1/leads", lead, { authorization: "Bearer " + token }))
        .status,
    ).toBe(400);
  });
  it("accepts a lead once and deduplicates delivery retries", async () => {
    const headers = {
      authorization: "Bearer " + token,
      "idempotency-key": "repeat-demo-lead",
    };
    expect((await post("/v1/leads", lead, headers)).status).toBe(202);
    const retry = await post("/v1/leads", lead, headers);
    expect(await retry.json()).toMatchObject({ duplicate: true });
    expect(queue.jobs.has("landing:repeat-demo-lead")).toBe(true);
  });
  it("detects conflicting payloads for the same key", async () => {
    const headers = {
      authorization: "Bearer " + token,
      "idempotency-key": "conflict-demo-lead",
    };
    await post("/v1/leads", lead, headers);
    expect(
      (
        await post(
          "/v1/leads",
          { ...lead, fullName: "Different Demo" },
          headers,
        )
      ).status,
    ).toBe(409);
  });
  it("returns the Meta verification challenge with a matching token", async () => {
    const r = await fetch(
      base +
        "/webhooks/meta?hub.mode=subscribe&hub.verify_token=demo-verify&hub.challenge=demo-challenge",
    );
    expect(r.status).toBe(200);
    expect(await r.text()).toBe("demo-challenge");
  });
  it("rejects an incorrect verification token", async () => {
    expect(
      (
        await fetch(
          base +
            "/webhooks/meta?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=demo",
        )
      ).status,
    ).toBe(403);
  });
  it("rejects an unsigned Meta delivery", async () => {
    expect((await post("/webhooks/meta", {})).status).toBe(401);
  });
  it("accepts signed lead IDs and deduplicates webhook replay", async () => {
    const body = {
      object: "page",
      entry: [
        {
          id: "demo-page",
          changes: [
            {
              field: "leadgen",
              value: { leadgen_id: "demo-lead", page_id: "demo-page" },
            },
          ],
        },
      ],
    };
    const signature =
      "sha256=" +
      createHmac("sha256", secret).update(JSON.stringify(body)).digest("hex");
    const headers = { "x-hub-signature-256": signature };
    const first = await post("/webhooks/meta", body, headers);
    expect(first.status).toBe(202);
    expect(await first.json()).toMatchObject({ accepted: 1, duplicates: 0 });
    expect(
      await (await post("/webhooks/meta", body, headers)).json(),
    ).toMatchObject({ accepted: 0, duplicates: 1 });
  });
  it("returns 400 for malformed JSON after authentication", async () => {
    const r = await fetch(base + "/v1/leads", {
      method: "POST",
      headers: {
        authorization: "Bearer " + token,
        "content-type": "application/json",
      },
      body: "{",
    });
    expect(r.status).toBe(400);
  });
  it("limits request bodies before queueing them", async () => {
    const r = await fetch(base + "/v1/leads", {
      method: "POST",
      headers: {
        authorization: "Bearer " + token,
        "content-type": "application/json",
      },
      body: JSON.stringify({ oversize: "a".repeat(70000) }),
    });
    expect(r.status).toBe(413);
  });
  it("returns backpressure to upstream senders when capacity is exhausted", async () => {
    const q = new MemoryQueue(1);
    q.enqueue({ key: "occupied", source: "meta", data: {} });
    const small = createApp({ token }, q).server;
    await new Promise<void>((resolve) => small.listen(0, "127.0.0.1", resolve));
    try {
      const r = await fetch(
        "http://127.0.0.1:" +
          (small.address() as AddressInfo).port +
          "/v1/leads",
        {
          method: "POST",
          headers: {
            authorization: "Bearer " + token,
            "content-type": "application/json",
            "idempotency-key": "capacity-demo",
          },
          body: JSON.stringify(lead),
        },
      );
      expect(r.status).toBe(503);
    } finally {
      small.closeAllConnections();
      await new Promise<void>((resolve) => small.close(() => resolve()));
    }
  });
  it("does not start with an undersized router token", () => {
    expect(() => createApp({ token: "short" })).toThrow("at least 24");
  });
});
