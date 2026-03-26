import { test, expect } from '@playwright/test';

test.describe('Budget Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/budget');
  });

  test('renders page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Budget');
    await expect(page.getByText(/Vault & Valve/i)).toBeVisible();
  });

  test('Pro Plan usage panel renders', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Pro Plan Usage/i })).toBeVisible();
  });

  test('API Budget panel renders or shows empty state', async ({ page }) => {
    const apiHeading = page.getByRole('heading', { name: /API Budget/i });
    const emptyState = page.getByText(/No API budget ledger/i);
    await expect(apiHeading.or(emptyState)).toBeVisible();
  });

  test('telemetry metrics display', async ({ page }) => {
    // Pro plan panel should have metrics — scope to main
    const main = page.locator('main');
    await expect(main.getByText('Output Tokens').first()).toBeVisible();
    await expect(main.getByText('Total Time').first()).toBeVisible();
  });

  test('burn rate chart has 7d/30d toggle', async ({ page }) => {
    const burnRate = page.getByRole('heading', { name: /Burn Rate/i });
    if (await burnRate.isVisible()) {
      await expect(page.getByRole('button', { name: '7d' })).toBeVisible();
      await expect(page.getByRole('button', { name: '30d' })).toBeVisible();

      await page.getByRole('button', { name: '30d' }).click();
      await expect(page.getByRole('button', { name: '30d' })).toBeVisible();
    }
  });

  test('usage chart has metric toggles', async ({ page }) => {
    const usageChart = page.getByRole('heading', { name: /Usage Over Time/i });
    if (await usageChart.isVisible()) {
      await expect(page.getByRole('button', { name: 'Tokens' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Messages' })).toBeVisible();

      await page.getByRole('button', { name: 'Messages' }).click();
      await expect(page.getByRole('button', { name: 'Messages' })).toBeVisible();

      await expect(page.getByRole('button', { name: 'Sessions' })).toBeVisible();
    }
  });

  test('Claude Code Plan section renders', async ({ page }) => {
    const planHeading = page.getByRole('heading', { name: /Claude Code Plan/i });
    if (await planHeading.isVisible()) {
      await expect(page.getByText('Session Usage')).toBeVisible();
    }
  });

  test('alert thresholds section renders', async ({ page }) => {
    const thresholds = page.getByRole('heading', { name: /Alert Thresholds/i });
    if (await thresholds.isVisible()) {
      await expect(page.getByText(/Warn/).first()).toBeVisible();
      await expect(page.getByText(/Critical/).first()).toBeVisible();
    }
  });
});
