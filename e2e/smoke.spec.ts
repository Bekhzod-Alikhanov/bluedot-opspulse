import { test, expect } from "@playwright/test";

// End-to-end smoke: demo login → control room → queue → resolve.
// Mutates Supabase data; run `node scripts/reset-data.mjs` afterwards.
test("ops can sign in, see the control room, and resolve a queue item", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText("Sign in to the control room")).toBeVisible();

  await page.getByRole("button", { name: /Enter as Ops Lead/i }).click();

  // Lands on the Control Room with a live health index.
  await expect(page.getByRole("heading", { name: "Control Room" })).toBeVisible();
  await expect(page.getByText("System Health Index")).toBeVisible();

  // Go to the queue and resolve the top incident.
  await page.goto("/queue");
  await expect(page.getByRole("heading", { name: "Triage Queue" })).toBeVisible();

  const firstResolve = page.getByRole("button", { name: "Resolve" }).first();
  await expect(firstResolve).toBeVisible();
  await firstResolve.click();

  // The resolved filter should now contain at least one item.
  await page.getByRole("button", { name: /^resolved/i }).click();
  await expect(page.locator("article")).not.toHaveCount(0);
});
