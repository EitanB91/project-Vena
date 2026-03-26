import { test, expect } from '@playwright/test';

test.describe('Chat Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
  });

  test('renders page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Chat');
    await expect(page.getByText(/Claude CLI/i)).toBeVisible();
  });

  test('shows connection status badge', async ({ page }) => {
    // Status should show one of: Disconnected, Connecting, Connected
    const status = page.getByText(/Disconnected|Connecting|Connected/i);
    await expect(status).toBeVisible();
  });

  test('New Session button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /New Session/i })).toBeVisible();
  });

  test('chat input textarea is present', async ({ page }) => {
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible({ timeout: 10000 });
    await expect(textarea).toHaveAttribute('placeholder', /Type a command|Connecting/i);
  });

  test('send button is present', async ({ page }) => {
    // Send button (paper airplane icon)
    const sendButton = page.locator('button').filter({ has: page.locator('svg') }).last();
    await expect(sendButton).toBeVisible();
  });

  test('keyboard shortcut help text is visible', async ({ page }) => {
    await expect(page.getByText(/Enter/i).first()).toBeVisible();
  });

  test('terminal container renders', async ({ page }) => {
    // xterm terminal container should be in the DOM
    const terminal = page.locator('.xterm, [class*="terminal"], [class*="Terminal"]');
    await expect(terminal.first()).toBeVisible({ timeout: 5000 });
  });

  test('New Session button remounts terminal', async ({ page }) => {
    const button = page.getByRole('button', { name: /New Session/i });
    await button.click();
    // Terminal should re-render (no crash)
    const terminal = page.locator('.xterm, [class*="terminal"], [class*="Terminal"]');
    await expect(terminal.first()).toBeVisible({ timeout: 5000 });
  });

  test('responsive: works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Chat');
    await expect(page.locator('textarea')).toBeVisible();
  });
});
