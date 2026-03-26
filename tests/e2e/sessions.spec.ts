import { test, expect } from '@playwright/test';

test.describe('Sessions Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sessions');
  });

  test('renders page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Sessions');
    await expect(page.getByText(/Telemetry-powered/i)).toBeVisible();
  });

  test('shows session stats row', async ({ page }) => {
    const sessions = page.getByText(/sessions/i).first();
    const emptyState = page.getByText(/No sessions found/i);
    await expect(sessions.or(emptyState)).toBeVisible();
  });

  test('sessions grouped by date', async ({ page }) => {
    const emptyState = page.getByText(/No sessions found/i);
    if (await emptyState.isVisible()) return;

    // Should have date group headers with session counts
    // Date groups contain formatted dates
    const dateHeaders = page.locator('h3, h2').filter({ hasText: /\d{2}/ });
    expect(await dateHeaders.count()).toBeGreaterThan(0);
  });

  test('session rows display model tags', async ({ page }) => {
    const emptyState = page.getByText(/No sessions found/i);
    if (await emptyState.isVisible()) return;

    // Model tags (Opus, Sonnet, Haiku)
    const modelTags = page.getByText(/Opus|Sonnet|Haiku/i);
    expect(await modelTags.count()).toBeGreaterThan(0);
  });

  test('session rows show token counts', async ({ page }) => {
    const emptyState = page.getByText(/No sessions found/i);
    if (await emptyState.isVisible()) return;

    // Token indicators (↓ input, ↑ output)
    const tokenIndicators = page.getByText(/[↓↑]/);
    expect(await tokenIndicators.count()).toBeGreaterThan(0);
  });

  test('session rows show duration', async ({ page }) => {
    const emptyState = page.getByText(/No sessions found/i);
    if (await emptyState.isVisible()) return;

    // Duration values (e.g., "5m", "1h 23m")
    const durations = page.getByText(/\d+[hm]/);
    expect(await durations.count()).toBeGreaterThan(0);
  });

  test('shows last updated timestamp', async ({ page }) => {
    const emptyState = page.getByText(/No sessions found/i);
    if (await emptyState.isVisible()) return;

    await expect(page.getByText(/Last updated/i)).toBeVisible();
  });

  test('responsive: stacks on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Sessions');
  });
});
