import { afterEach, it, expect, vi } from "vitest";
import { POST } from "../../apps/landing-pages/src/app/api/leads/route";
const lead = {
  fullName: "Demo Buyer",
  phone: "+12025550123",
  consent: true,
  projectId: "harbour-residences",
  variant: "a",
};
function request(body: unknown = lead, extra: Record<string, string> = {}) {
  return new Request("http://localhost:3000/api/leads", {
    method: "POST",
    headers: {
      origin: "http://localhost:3000",
      "content-type": "application/json",
      "idempotency-key": "synthetic-proxy-request",
      ...extra,
    },
    body: JSON.stringify(body),
  });
}
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
it("rejects a foreign origin before contacting the router", async () => {
  expect(
    (await POST(request(lead, { origin: "https://other.example.invalid" })))
      .status,
  ).toBe(403);
});
it("rejects missing origin", async () => {
  const r = request();
  r.headers.delete("origin");
  expect((await POST(r)).status).toBe(403);
});
it("does not forward invalid leads", async () => {
  expect((await POST(request({ ...lead, consent: false }))).status).toBe(422);
});
it("requires JSON and bounded idempotency keys", async () => {
  expect(
    (await POST(request(lead, { "content-type": "text/plain" }))).status,
  ).toBe(415);
  expect((await POST(request(lead, { "idempotency-key": "x" }))).status).toBe(
    400,
  );
});
it("fails closed when server configuration is missing", async () => {
  vi.stubEnv("LEAD_ROUTER_URL", "");
  vi.stubEnv("LEAD_ROUTER_TOKEN", "");
  expect((await POST(request())).status).toBe(503);
});
it("caps the public form payload", async () => {
  expect((await POST(request({ extra: "a".repeat(17000) }))).status).toBe(413);
});
it("forwards the server-only token and idempotency key without returning it", async () => {
  vi.stubEnv("LEAD_ROUTER_URL", "http://127.0.0.1:4100");
  vi.stubEnv("LEAD_ROUTER_TOKEN", "synthetic-private-router-token");
  const mock = vi
    .fn()
    .mockResolvedValue(new Response('{"accepted":true}', { status: 202 }));
  vi.stubGlobal("fetch", mock);
  const r = await POST(request());
  expect(r.status).toBe(202);
  expect(await r.text()).not.toContain("synthetic-private-router-token");
  expect(mock.mock.calls[0][1].headers).toMatchObject({
    authorization: "Bearer synthetic-private-router-token",
    "idempotency-key": "synthetic-proxy-request",
  });
});
it("maps router/network failures to a retryable response", async () => {
  vi.stubEnv("LEAD_ROUTER_URL", "http://127.0.0.1:4100");
  vi.stubEnv("LEAD_ROUTER_TOKEN", "synthetic-private-router-token");
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
  expect((await POST(request())).status).toBe(503);
});
