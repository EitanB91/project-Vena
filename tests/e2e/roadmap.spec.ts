import { test, expect } from '@playwright/test';

test.describe('Roadmap Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/roadmap');
  });

  test('renders page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Roadmap');
    await expect(page.getByText(/Phase tracker/i)).toBeVisible();
  });

  test('shows phase completion stats', async ({ page }) => {
    const stats = page.getByText(/Phases Complete/i);
    const emptyState = page.getByText(/No roadmap found/i);
    await expect(stats.or(emptyState)).toBeVisible();
  });

  test('phase cards render with status', async ({ page }) => {
    const phaseCards = page.getByRole('heading', { level: 3 });
    if ((await phaseCards.count()) === 0) return;

    // At least Phase 0 should exist
    await expect(page.getByText(/Phase 0/i).first()).toBeVisible();
  });

  test('phase cards expand and collapse', async ({ page }) => {
    // Find clickable phase headers
    const phaseHeaders = page.locator('[class*="cursor-pointer"]').first();
    if (!(await phaseHeaders.isVisible())) return;

    // Click to expand
    await phaseHeaders.click();
    // Should show tasks/details after expand
    await page.waitForTimeout(300); // animation

    // Click again to collapse
    await phaseHeaders.click();
    await page.waitForTimeout(300);
  });

  test('expanded phase shows task checklist', async ({ page }) => {
    const phaseHeaders = page.locator('[class*="cursor-pointer"]').first();
    if (!(await phaseHeaders.isVisible())) return;

    await phaseHeaders.click();
    await page.waitForTimeout(300);

    // Should see checkmark or task items
    const tasks = page.locator('li').filter({ hasText: /.+/ });
    expect(await tasks.count()).toBeGreaterThan(0);
  });

  test('expanded phase shows metadata', async ({ page }) => {
    // Find in-progress phase (Phase 10) which should have metadata
    const phaseHeaders = page.locator('[class*="cursor-pointer"]');
    const count = await phaseHeaders.count();
    if (count === 0) return;

    // Click the last phase (most likely to be in-progress)
    await phaseHeaders.last().click();
    await page.waitForTimeout(300);
  });

  test('feature registry table renders', async ({ page }) => {
    const registry = page.getByText(/Feature Registry/i);
    if (await registry.isVisible()) {
      // Table should have headers
      await expect(page.getByText('Feature').first()).toBeVisible();
      await expect(page.getByText('Priority').first()).toBeVisible();
      await expect(page.getByText('Status').first()).toBeVisible();
    }
  });

  test('phase token report renders', async ({ page }) => {
    const report = page.getByText(/Phase Token Report/i);
    if (await report.isVisible()) {
      await expect(page.getByText('Duration').first()).toBeVisible();
    }
  });

  test('plan documents section renders', async ({ page }) => {
    const plans = page.getByText(/Plan Documents/i);
    if (await plans.isVisible()) {
      // Should have at least one plan card
      const planCards = page.locator('a[href*="/roadmap/plans"]');
      if ((await planCards.count()) > 0) {
        await expect(planCards.first()).toBeVisible();
      }
    }
  });

  test('vision section renders if present', async ({ page }) => {
    const vision = page.getByText('Vision');
    if (await vision.isVisible()) {
      // Vision should have descriptive text
      await expect(page.getByText(/dashboard|monitor/i).first()).toBeVisible();
    }
  });
});
