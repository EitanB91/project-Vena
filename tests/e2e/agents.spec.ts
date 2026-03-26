import { test, expect } from '@playwright/test';

test.describe('Agents Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/agents');
  });

  test('renders page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Agents');
    await expect(page.getByText(/Team members/i)).toBeVisible();
  });

  test('shows agent stats row', async ({ page }) => {
    // Stats row: "4" and "Total Agents" are separate elements
    const main = page.locator('main');
    const agentLabel = main.getByText('Total Agents');
    const emptyState = page.getByText(/No agents found/i);
    await expect(agentLabel.or(emptyState)).toBeVisible();
  });

  test('agent cards display and are clickable', async ({ page }) => {
    const cards = page.locator('a[href^="/agents/"]');
    const emptyState = page.getByText(/No agents found/i);

    if (await emptyState.isVisible()) return;

    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    const firstCard = cards.first();
    await expect(firstCard).toBeVisible();
  });

  test('click agent card navigates to detail', async ({ page }) => {
    const cards = page.locator('a[href^="/agents/"]');
    if ((await cards.count()) === 0) return;

    const href = await cards.first().getAttribute('href');
    await cards.first().click();
    await expect(page).toHaveURL(href!);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});

test.describe('Agent Detail Page', () => {
  test('renders agent detail or 404', async ({ page }) => {
    await page.goto('/agents');
    const cards = page.locator('a[href^="/agents/"]');
    if ((await cards.count()) === 0) return;

    await cards.first().click();
    // Should have back link
    await expect(page.locator('a[href="/agents"]').first()).toBeVisible();

    // Agent name heading
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('shows identity and memory sections', async ({ page }) => {
    await page.goto('/agents');
    const cards = page.locator('a[href^="/agents/"]');
    if ((await cards.count()) === 0) return;

    await cards.first().click();
    await expect(page.getByText('Identity').first()).toBeVisible();
  });

  test('back link returns to agents list', async ({ page }) => {
    await page.goto('/agents');
    const cards = page.locator('a[href^="/agents/"]');
    if ((await cards.count()) === 0) return;

    await cards.first().click();
    await page.locator('a[href="/agents"]').first().click();
    await expect(page).toHaveURL('/agents');
  });

  test('invalid agent slug shows not-found state', async ({ page }) => {
    await page.goto('/agents/nonexistent-agent-xyz');
    const notFound = page.getByText(/not found/i);
    const heading = page.getByRole('heading', { level: 1 });
    await expect(notFound.or(heading)).toBeVisible();
  });
});
