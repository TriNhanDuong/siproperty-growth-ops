import { test, expect, type Page } from "@playwright/test";
async function fill(page: Page) {
  await page.getByLabel("Full name", { exact: true }).fill("Demo Buyer");
  await page.getByLabel("Phone number", { exact: true }).fill("+12025550123");
  await page.getByRole("checkbox").check();
}
test("project catalogue has three working project links", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: /Fictional project/ }),
  ).toHaveCount(3);
  await page.getByRole("link", { name: /Harbour Residences/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Harbour Residences",
  );
});
test("variant A queues a real request through the local router", async ({
  page,
}) => {
  await page.goto("/projects/harbour-residences");
  await fill(page);
  await page.getByRole("button", { name: "Request details" }).click();
  await expect(page.getByRole("status")).toContainText("Demo request queued");
  await expect(page.getByLabel("Full name", { exact: true })).toHaveValue("");
});
test("variant B queues the second project form", async ({ page }) => {
  await page.goto("/projects/garden-district?variant=b");
  await expect(
    page.getByRole("heading", { name: "Explore your next chapter" }),
  ).toBeVisible();
  await fill(page);
  await page.getByRole("button", { name: "Start exploring" }).click();
  await expect(page.getByRole("status")).toContainText("Demo request queued");
});
test("consent blocks submission", async ({ page }) => {
  await page.goto("/projects/harbour-residences");
  await page.getByLabel("Full name", { exact: true }).fill("Demo Buyer");
  await page.getByLabel("Phone number", { exact: true }).fill("+12025550123");
  let posts = 0;
  page.on("request", (request) => {
    if (request.url().endsWith("/api/leads")) posts++;
  });
  await page.getByRole("button", { name: "Request details" }).click();
  await expect(page.getByRole("checkbox")).not.toBeChecked();
  expect(posts).toBe(0);
  expect(
    await page
      .getByRole("checkbox")
      .evaluate((input: HTMLInputElement) => input.validity.valueMissing),
  ).toBe(true);
});
test("invalid phone produces an accessible error", async ({ page }) => {
  await page.goto("/projects/harbour-residences");
  await fill(page);
  await page.getByLabel("Phone number", { exact: true }).fill("123");
  await page.getByRole("button", { name: "Request details" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "valid international or local phone",
  );
});
test("upstream failure allows retry without exposing the router token", async ({
  page,
}) => {
  await page.goto("/projects/harbour-residences");
  await fill(page);
  await page.route("**/api/leads", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: '{"error":"router_unavailable"}',
    }),
  );
  await page.getByRole("button", { name: "Request details" }).click();
  await expect(page.getByRole("alert")).toContainText("Please try again");
  await expect(
    page.getByRole("button", { name: "Request details" }),
  ).toBeEnabled();
  await page.unroute("**/api/leads");
  await page.getByRole("button", { name: "Request details" }).click();
  await expect(page.getByRole("status")).toContainText("Demo request queued");
});
test("unknown project returns 404", async ({ page }) => {
  const response = await page.goto("/projects/does-not-exist");
  expect(response?.status()).toBe(404);
});
