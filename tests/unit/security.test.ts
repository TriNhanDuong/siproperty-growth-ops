import { createHmac } from "node:crypto";
import { it, expect } from "vitest";
import {
  equalSecret,
  validSignature,
} from "../../services/lead-router/src/security";
it("checks a signature against the original raw bytes", () => {
  const raw = Buffer.from('{ "demo":true }');
  const secret = "synthetic-test-signing-secret";
  const signature =
    "sha256=" + createHmac("sha256", secret).update(raw).digest("hex");
  expect(validSignature(raw, signature, secret)).toBe(true);
  expect(validSignature(Buffer.from('{"demo":true}'), signature, secret)).toBe(
    false,
  );
});
it.each([
  undefined,
  "sha256=abc",
  "sha1=" + "a".repeat(64),
  "sha256=" + "f".repeat(64),
])("rejects missing, malformed or incorrect HMAC: %s", (signature) => {
  expect(validSignature(Buffer.from("{}"), signature, "synthetic-secret")).toBe(
    false,
  );
});
it("does not accept empty or differently sized shared secrets", () => {
  expect(equalSecret("", "")).toBe(false);
  expect(equalSecret("short", "longer")).toBe(false);
  expect(equalSecret("same", "same")).toBe(true);
});
