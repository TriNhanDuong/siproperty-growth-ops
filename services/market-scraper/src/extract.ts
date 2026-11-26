import type { Page } from "@playwright/test";
import { parsePrice, type Price } from "./pricing";
export type Observation = {
  listingId: string;
  projectId: string;
  sourceUrl: string;
  observedAt: string;
  price: Price;
  synthetic: true;
};
export async function extractFixture(
  page: Page,
  observedAt = new Date().toISOString(),
): Promise<Observation[]> {
  const items = await page.locator("[data-listing-id]").evaluateAll((nodes) =>
    nodes.map((node) => ({
      id: node.getAttribute("data-listing-id"),
      project: node.getAttribute("data-project"),
      price: node.querySelector("[data-price]")?.textContent ?? "",
    })),
  );
  const seen = new Set<string>();
  const result: Observation[] = [];
  for (const item of items) {
    const price = parsePrice(item.price);
    if (!item.id || !item.project || !price || seen.has(item.id)) continue;
    seen.add(item.id);
    result.push({
      listingId: item.id,
      projectId: item.project,
      sourceUrl:
        "https://market.example.invalid/listings/" +
        encodeURIComponent(item.id),
      observedAt,
      price,
      synthetic: true,
    });
  }
  return result;
}
