import { test, expect } from '@playwright/test';

test.describe('Navigation & Layout', () => {
  test('sidebar renders with all navigation links', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Logo / branding — scoped to sidebar (aside), use .first() since footer also contains VenaOS
    const sidebar = page.locator('aside');
    await expect(sidebar.getByText('VenaOS').first()).toBeVisible();
    await expect(sidebar.getByText('v0.2').first()).toBeVisible();

    // All 6 nav links
    await expect(nav.getByRole('link', { name: /dashboard/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /agents/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /budget/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /roadmap/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /sessions/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /chat/i })).toBeVisible();
  });

  test('navigate to each page via sidebar', async ({ page }) => {
    test.slow(); // This test navigates through 6 pages sequentially with server-rendered loading states
    await page.goto('/');

    const routes = [
      { name: /agents/i, url: '/agents', heading: 'Agents' },
      { name: /budget/i, url: '/budget', heading: 'Budget' },
      { name: /roadmap/i, url: '/roadmap', heading: 'Roadmap' },
      { name: /sessions/i, url: '/sessions', heading: 'Sessions' },
      { name: /chat/i, url: '/chat', heading: 'Chat' },
      { name: /dashboard/i, url: '/', heading: 'Dashboard' },
    ];

    for (const route of routes) {
      await page.locator('nav').getByRole('link', { name: route.name }).click();
      await expect(page).toHaveURL(route.url);
      // Server-rendered pages show loading skeletons first; wait for h1 to appear
      await expect(page.getByRole('heading', { level: 1 })).toContainText(route.heading, { timeout: 15000 });
    }
  });

  test('active nav link is highlighted', async ({ page }) => {
    await page.goto('/agents');
    const agentsLink = page.locator('nav').getByRole('link', { name: /agents/i });
    await expect(agentsLink).toHaveClass(/text-vena-accent/);
  });

  test('dark theme applied via CSS variables', async ({ page }) => {
    await page.goto('/');
    // Theme is applied via CSS variables on body, not via a dark class
    const body = page.locator('body');
    await expect(body).toHaveClass(/bg-vena-bg/);
    await expect(body).toHaveClass(/text-vena-text/);
  });

  test('mobile hamburger menu works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Sidebar should be hidden on mobile initially (translated off-screen)
    const sidebar = page.locator('aside');
    await expect(sidebar).not.toBeInViewport();

    // Open mobile menu
    const hamburger = page.getByRole('button', { name: /open navigation/i });
    await hamburger.click();
    await expect(sidebar).toBeInViewport();

    // Navigate should close the menu
    await page.locator('nav').getByRole('link', { name: /agents/i }).click();
    await expect(page).toHaveURL('/agents');
  });

  test('footer text visible in sidebar', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('aside');
    await expect(sidebar.getByText(/VenaOS · Local Monitor/)).toBeVisible();
  });
});
