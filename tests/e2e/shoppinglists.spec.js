import { test, expect } from '@playwright/test';

const mockLists = [
  {
    id: 1,
    name: 'Week 1 Shopping',
    items: [
      { id: 1, ingredientName: 'Chicken Breast', quantity: 500, unit: 'grams', checked: true },
      { id: 2, ingredientName: 'Brown Rice', quantity: 200, unit: 'grams', checked: false },
      { id: 3, ingredientName: 'Broccoli', quantity: 300, unit: 'grams', checked: false },
    ],
  },
  {
    id: 2,
    name: 'Week 2 Shopping',
    items: [],
  },
];

/* Helper: navigate fresh to shopping-lists with auth + mocked API */
async function goToShoppingLists(page) {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'fake-jwt-token');
    localStorage.setItem('user', JSON.stringify({ userId: 1, username: 'testuser', fullName: 'Test User' }));
  });
  await page.route('**/api/shopping-lists', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockLists) })
  );
  await page.goto('/shopping-lists');
  await expect(page.getByText('Week 1 Shopping')).toBeVisible();
}

test.describe('Shopping List - List View', () => {
  test('displays shopping list names', async ({ page }) => {
    await goToShoppingLists(page);
    await expect(page.getByText('Week 1 Shopping')).toBeVisible();
    await expect(page.getByText('Week 2 Shopping')).toBeVisible();
  });

  test('shows item count and completion progress', async ({ page }) => {
    await goToShoppingLists(page);
    await expect(page.getByRole('cell', { name: '3', exact: true })).toBeVisible();
    await expect(page.getByText('1/3')).toBeVisible();
  });

  test('shows empty state with create button when no lists', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({ userId: 1, username: 'testuser', fullName: 'Test User' }));
    });
    await page.route('**/api/shopping-lists', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    );
    await page.goto('/shopping-lists');
    await expect(page.getByText('No shopping lists yet')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Create Shopping List' })).toBeVisible();
  });

  test('New List button is visible', async ({ page }) => {
    await goToShoppingLists(page);
    await expect(page.getByRole('link', { name: /New List/i })).toBeVisible();
  });

  test('view button navigates to detail page', async ({ page }) => {
    await goToShoppingLists(page);
    await page.route('**/api/shopping-lists/1', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockLists[0]) })
    );
    await page.locator('a.btn-outline').first().click();
    await expect(page).toHaveURL('/shopping-lists/1');
  });

  test('delete button shows confirm dialog', async ({ page }) => {
    await goToShoppingLists(page);
    await page.locator('button.btn-danger').first().click();
    await expect(page.getByText('Delete Shopping List')).toBeVisible();
    await expect(page.getByText(/Delete "Week 1 Shopping"/)).toBeVisible();
  });

  test('confirming delete removes list', async ({ page }) => {
    await goToShoppingLists(page);
    await page.route('**/api/shopping-lists/1', (route) =>
      route.fulfill({ status: 204 })
    );
    await page.locator('button.btn-danger').first().click();
    /* Click the Delete button inside the dialog (not the row delete button) */
    await page.locator('.dialog-content .btn-danger').click();
    /* After deletion the table row with Week 1 Shopping should be gone */
    await expect(page.locator('tbody').getByText('Week 1 Shopping')).not.toBeVisible();
    await expect(page.getByText('Shopping list deleted')).toBeVisible();
  });

  test('cancelling delete keeps list visible', async ({ page }) => {
    await goToShoppingLists(page);
    await page.locator('button.btn-danger').first().click();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByText('Week 1 Shopping')).toBeVisible();
  });

  test('shows API error when delete fails', async ({ page }) => {
    await goToShoppingLists(page);
    await page.route('**/api/shopping-lists/1', (route) =>
      route.fulfill({ status: 500 })
    );
    await page.locator('button.btn-danger').first().click();
    await page.locator('.dialog-content .btn-danger').click();
    await expect(page.getByText('Failed to delete shopping list')).toBeVisible();
    await expect(page.getByText('Week 1 Shopping')).toBeVisible();
  });
});

/* --- Shopping List Detail View --- */

test.describe('Shopping List - Detail View', () => {
  const mockDetail = {
    id: 1,
    name: 'Week 1 Shopping',
    items: [
      { id: 1, ingredientName: 'Chicken Breast', quantity: 500, unit: 'grams', checked: false },
      { id: 2, ingredientName: 'Brown Rice', quantity: 200, unit: 'grams', checked: true },
    ],
  };

  async function goToDetail(page) {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({ userId: 1, username: 'testuser', fullName: 'Test User' }));
    });
    await page.route('**/api/shopping-lists/1', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockDetail) })
    );
    await page.goto('/shopping-lists/1');
    await expect(page.getByText('Week 1 Shopping')).toBeVisible();
  }

  test('displays shopping list name as heading', async ({ page }) => {
    await goToDetail(page);
    await expect(page.getByRole('heading', { name: 'Week 1 Shopping' })).toBeVisible();
  });

  test('shows all items with ingredient names', async ({ page }) => {
    await goToDetail(page);
    await expect(page.getByText('Chicken Breast')).toBeVisible();
    await expect(page.getByText('Brown Rice')).toBeVisible();
  });

  test('shows item quantities and units', async ({ page }) => {
    await goToDetail(page);
    await expect(page.getByText('500')).toBeVisible();
    await expect(page.getByText('grams').first()).toBeVisible();
  });

  test('shows completed items count', async ({ page }) => {
    await goToDetail(page);
    await expect(page.getByText('1/2 items completed')).toBeVisible();
  });

  test('shows progress percentage', async ({ page }) => {
    await goToDetail(page);
    await expect(page.getByText('50%')).toBeVisible();
  });

  test('checked items have checked checkbox', async ({ page }) => {
    await goToDetail(page);
    await expect(page.locator('input[type="checkbox"]').nth(1)).toBeChecked();
  });

  test('unchecked items have unchecked checkbox', async ({ page }) => {
    await goToDetail(page);
    await expect(page.locator('input[type="checkbox"]').first()).not.toBeChecked();
  });

  test('toggling checkbox calls API and updates UI optimistically', async ({ page }) => {
    await goToDetail(page);
    let toggleCalled = false;
    await page.route('**/api/shopping-lists/items/1/toggle', (route) => {
      toggleCalled = true;
      route.fulfill({ status: 200 });
    });
    await page.locator('input[type="checkbox"]').first().click();
    expect(toggleCalled).toBe(true);
    await expect(page.locator('input[type="checkbox"]').first()).toBeChecked();
  });

  test('shows error toast when toggle fails', async ({ page }) => {
    await goToDetail(page);
    await page.route('**/api/shopping-lists/items/1/toggle', (route) =>
      route.fulfill({ status: 500 })
    );
    await page.locator('input[type="checkbox"]').first().click();
    await expect(page.getByText('Failed to update item')).toBeVisible();
  });

  test('back button navigates to shopping lists', async ({ page }) => {
    await goToDetail(page);
    await page.getByRole('button', { name: 'Back to Lists' }).click();
    await expect(page).toHaveURL('/shopping-lists');
  });

  test('shows empty state message when list has no items', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({ userId: 1, username: 'testuser', fullName: 'Test User' }));
    });
    await page.route('**/api/shopping-lists/2', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 2, name: 'Empty List', items: [] }) })
    );
    await page.goto('/shopping-lists/2');
    await expect(page.getByText('No items in this shopping list.')).toBeVisible();
  });

  test('redirects to shopping lists when API returns error', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({ userId: 1, username: 'testuser', fullName: 'Test User' }));
    });
    await page.route('**/api/shopping-lists/999', (route) =>
      route.fulfill({ status: 404 })
    );
    await page.route('**/api/shopping-lists', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    );
    await page.goto('/shopping-lists/999');
    await expect(page).toHaveURL('/shopping-lists');
  });

  test('all-checked list shows 100% progress', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({ userId: 1, username: 'testuser', fullName: 'Test User' }));
    });
    await page.route('**/api/shopping-lists/3', (route) =>
      route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({
          id: 3, name: 'Done List',
          items: [
            { id: 10, ingredientName: 'Eggs', quantity: 12, unit: 'pcs', checked: true },
            { id: 11, ingredientName: 'Milk', quantity: 1, unit: 'litre', checked: true },
          ],
        }),
      })
    );
    await page.goto('/shopping-lists/3');
    await expect(page.getByText('2/2 items completed')).toBeVisible();
    await expect(page.getByText('100%')).toBeVisible();
  });
});
