import { expect, login, test } from './fixtures';

test.describe('cart', () => {
  test('adding a product shows it in the cart with quantity 1', async ({ page }) => {
    await login(page);
    await page.getByTestId('add-mug').click();
    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.getByTestId('qty-mug')).toHaveText('1');
    await expect(page.getByTestId('cart-count')).toHaveText('1');
  });

  test('adding the same product twice increments quantity', async ({ page }) => {
    await login(page);
    await page.getByTestId('add-tee').click();
    await page.goto('/products');
    await page.getByTestId('add-tee').click();
    await expect(page.getByTestId('qty-tee')).toHaveText('2');
  });
});
