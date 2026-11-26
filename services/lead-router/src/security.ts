import { createHmac, timingSafeEqual } from "node:crypto";
export function equalSecret(
  actual: string | undefined,
  expected: string,
): boolean {
  if (!actual || !expected) return false;
  const a = Buffer.from(actual),
    b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
export function validSignature(
  raw: Buffer,
  signature: string | undefined,
  secret: string,
): boolean {
  if (!secret || !signature || !/^sha256=[a-f0-9]{64}$/.test(signature))
    return false;
  return equalSecret(
    signature,
    "sha256=" + createHmac("sha256", secret).update(raw).digest("hex"),
  );
}
