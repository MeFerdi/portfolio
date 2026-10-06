import { DEMO_USER, expect, login, test } from './fixtures';

test.describe('login', () => {
  test('valid credentials land on the product list', async ({ page }) => {
    await login(page);
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
  });

  test('invalid password shows an error and stays on /login', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('email').fill(DEMO_USER.email);
    await page.getByTestId('password').fill('wrong-password');
    await page.getByTestId('login-submit').click();
    await expect(page.getByTestId('login-error')).toHaveText('Invalid email or password');
  });
});
