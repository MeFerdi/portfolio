import { expect, login, test } from './fixtures';

test.describe('checkout', () => {
  test('order total equals the sum of line totals', async ({ page }) => {
    await login(page);
    // 2 x Enamel Mug ($14.99) + 1 x Canvas Cap ($19.99) = $49.97
    await page.getByTestId('add-mug').click();
    await page.goto('/products');
    await page.getByTestId('add-mug').click();
    await page.goto('/products');
    await page.getByTestId('add-cap').click();
    await page.getByTestId('go-checkout').click();

    await expect(page.getByTestId('order-total')).toHaveText('$49.97');

    await page.getByTestId('place-order').click();
    await expect(page.getByTestId('order-confirmation')).toBeVisible();
    await expect(page.getByTestId('charged-total')).toHaveText('$49.97');
  });
});
