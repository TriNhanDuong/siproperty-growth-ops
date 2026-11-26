import { it, expect } from "vitest";
import { parsePrice } from "../../services/market-scraper/src/pricing";
it("keeps total VND and per-square-metre prices distinct", () => {
  expect(parsePrice("3,2 tỷ")).toEqual({
    amount: 3200000000,
    currency: "VND",
    unit: "total",
  });
  expect(parsePrice("42 triệu/m²")).toEqual({
    amount: 42000000,
    currency: "VND",
    unit: "per_m2",
  });
});
it("handles whitespace and dot decimals in a narrow format", () => {
  expect(parsePrice("  2.75   tỷ  ")?.amount).toBe(2750000000);
  expect(parsePrice("50 triệu / m2")?.unit).toBe("per_m2");
});
it.each([
  "Contact agent",
  "1,234 tỷ",
  "0 tỷ",
  "-2 tỷ",
  "3 tỷ - 4 tỷ",
  "42 USD/m2",
])("rejects unavailable, ambiguous or unsupported prices: %s", (text) => {
  expect(parsePrice(text)).toBeNull();
});
