import { chromium } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { extractFixture } from "./extract";
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.setContent(
    await readFile("fixtures/market/listings.html", "utf8"),
  );
  const rows = await extractFixture(page);
  if (rows.length !== 2)
    throw new Error("Expected two valid synthetic observations");
  console.log(
    JSON.stringify({ source: "local fixture", observations: rows }, null, 2),
  );
} finally {
  await browser.close();
}
