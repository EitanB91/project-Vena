import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders page heading and subtitle', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Dashboard');
    await expect(page.getByText(/overview and status/i)).toBeVisible();
  });

  test('status cards render', async ({ page }) => {
    // Status card labels are uppercase text in <p> tags inside main
    const main = page.locator('main');
    await expect(main.getByText('Phase').first()).toBeVisible();
    await expect(main.getByText('API Budget')).toBeVisible();
  });

  test('dashboard client panels render', async ({ page }) => {
    // Session Pulse panel
    await expect(page.getByText('Session Pulse')).toBeVisible();

    // Model Usage heading
    await expect(page.getByRole('heading', { name: /Model Usage/i })).toBeVisible();

    // Totals heading
    await expect(page.getByRole('heading', { name: 'Totals' })).toBeVisible();
  });

  test('token breakdown chart renders', async ({ page }) => {
    await expect(page.getByText(/Token Breakdown/i)).toBeVisible();
  });

  test('roadmap progress section renders', async ({ page }) => {
    const roadmapHeading = page.getByRole('heading', { name: /Roadmap Progress/i });
    const emptyState = page.getByText(/No roadmap/i);
    await expect(roadmapHeading.or(emptyState)).toBeVisible();
  });

  test('team status section renders', async ({ page }) => {
    const teamHeading = page.getByRole('heading', { name: /^Team$/i });
    const emptyState = page.getByText(/No agents found/i);
    await expect(teamHeading.or(emptyState)).toBeVisible();
  });

  test('responsive layout: cards stack on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Dashboard');
    // Status cards should still be visible
    const main = page.locator('main');
    await expect(main.getByText('Phase').first()).toBeVisible();
    await expect(main.getByText('API Budget')).toBeVisible();
  });
});
