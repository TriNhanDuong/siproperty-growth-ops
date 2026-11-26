export type Price = {
  amount: number;
  currency: "VND";
  unit: "total" | "per_m2";
};
/** Narrow parser: supported Vietnamese fixture formats only. Reject ambiguous separators. */
export function parsePrice(text: string): Price | null {
  const normalized = text.toLowerCase().trim().replace(/\s+/g, " ");
  const match = normalized.match(
    /^(\d+(?:[.,]\d{1,2})?) (tỷ|triệu)(?:\s*\/\s*(m²|m2))?$/,
  );
  if (!match) return null;
  const value =
    Number(match[1].replace(",", ".")) * (match[2] === "tỷ" ? 1e9 : 1e6);
  if (!Number.isFinite(value) || value <= 0) return null;
  return {
    amount: Math.round(value),
    currency: "VND",
    unit: match[3] ? "per_m2" : "total",
  };
}
