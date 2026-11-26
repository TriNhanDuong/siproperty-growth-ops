import { describe, it, expect } from "vitest";
import {
  leadSchema,
  metaSchema,
  normalizedPhone,
  variantFrom,
} from "@siproperty/contracts";
const lead = {
  fullName: "Demo Buyer",
  phone: "+12025550123",
  consent: true,
  projectId: "harbour-residences",
  variant: "a",
};
describe("lead boundary", () => {
  it("accepts and trims a synthetic lead", () => {
    expect(
      leadSchema.parse({ ...lead, fullName: " Demo Buyer " }).fullName,
    ).toBe("Demo Buyer");
  });
  it.each([
    { consent: false },
    { phone: "123" },
    { projectId: "unknown" },
    { fullName: "" },
    { phone: "x".repeat(100) },
    { unexpected: "field" },
  ])("rejects invalid or unexpected fields: %j", (patch) => {
    expect(leadSchema.safeParse({ ...lead, ...patch }).success).toBe(false);
  });
  it("normalizes visual separators before validation", () => {
    const phone = normalizedPhone("+1 (202) 555-0123");
    expect(phone).toBe("+12025550123");
    expect(leadSchema.safeParse({ ...lead, phone }).success).toBe(true);
  });
  it("restricts variants to the known experiment", () => {
    expect(variantFrom("b")).toBe("b");
    expect(variantFrom(["b"])).toBe("a");
    expect(variantFrom("script")).toBe("a");
  });
  it("rejects unrelated Meta webhook event shapes", () => {
    expect(
      metaSchema.safeParse({ object: "instagram", entry: [] }).success,
    ).toBe(false);
  });
});
