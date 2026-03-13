import { test, expect } from '@playwright/test';

const mockIngredients = [
  { id: 1, name: 'Chicken Breast', unit: 'per 100g', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, vitaminA: 0, vitaminC: 0, calcium: 15, iron: 0.9 },
  { id: 2, name: 'Brown Rice', unit: 'per 100g', calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5, vitaminA: 0, vitaminC: 0, calcium: 23, iron: 1.5 },
];

test.describe('Ingredient List', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({ userId: 1, username: 'testuser', fullName: 'Test User' }));
    });
    await page.route('**/api/ingredients', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockIngredients) })
    );
    await page.goto('/ingredients');
  });

  test('displays list of ingredients', async ({ page }) => {
    await expect(page.getByText('Chicken Breast')).toBeVisible();
    await expect(page.getByText('Brown Rice')).toBeVisible();
  });

  test('shows empty state when no ingredients', async ({ page }) => {
    await page.route('**/api/ingredients', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    );
    await page.goto('/ingredients');
    await expect(page.getByText(/No ingredients found/i)).toBeVisible();
  });

  test('Add Ingredient button links to new ingredient form', async ({ page }) => {
    await page.getByRole('link', { name: /Add Ingredient/i }).click();
    await expect(page).toHaveURL('/ingredients/new');
  });

  test('shows nutritional data in list', async ({ page }) => {
    await expect(page.getByRole('cell', { name: '165', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'per 100g', exact: true }).first()).toBeVisible();
  });

  test('delete button shows confirm dialog', async ({ page }) => {
    await page.locator('button.btn-danger').first().click();
    await expect(page.getByText('Delete Ingredient')).toBeVisible();
  });

  test('confirming delete removes ingredient from list', async ({ page }) => {
    await page.route('**/api/ingredients/1', (route) =>
      route.fulfill({ status: 204 })
    );
    await page.locator('button.btn-danger').first().click();
    await page.locator('.dialog-content .btn-danger').click();
    await expect(page.locator('tbody').getByText('Chicken Breast')).not.toBeVisible();
    await expect(page.getByText('Ingredient deleted')).toBeVisible();
  });

  test('cancelling delete keeps ingredient in list', async ({ page }) => {
    await page.locator('button.btn-danger').first().click();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByText('Chicken Breast')).toBeVisible();
  });

  test('shows error toast when delete API fails', async ({ page }) => {
    await page.route('**/api/ingredients/1', (route) =>
      route.fulfill({ status: 500 })
    );
    await page.locator('button.btn-danger').first().click();
    await page.locator('.dialog-content .btn-danger').click();
    await expect(page.getByText('Failed to delete ingredient')).toBeVisible();
    await expect(page.getByText('Chicken Breast')).toBeVisible();
  });

  test('shows error toast when ingredients fail to load', async ({ page }) => {
    await page.route('**/api/ingredients', (route) =>
      route.fulfill({ status: 500 })
    );
    await page.goto('/ingredients');
    await expect(page.getByText('Failed to load ingredients').first()).toBeVisible();
  });
});

test.describe('Ingredient Form - Create', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({ userId: 1, username: 'testuser', fullName: 'Test User' }));
    });
    await page.goto('/ingredients/new');
  });

  test('renders new ingredient form heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'New Ingredient' })).toBeVisible();
  });

  test('shows validation error for empty name', async ({ page }) => {
    await page.getByRole('button', { name: /Create/i }).click();
    await expect(page.getByText('Name is required')).toBeVisible();
  });

  test('shows validation error for empty unit', async ({ page }) => {
    await page.getByRole('button', { name: /Create/i }).click();
    await expect(page.getByText('Unit is required')).toBeVisible();
  });

  test('shows validation error for negative calories', async ({ page }) => {
    await page.getByPlaceholder('Ingredient name').fill('Test');
    await page.getByPlaceholder('per 100g').fill('per 100g');
    const numberInputs = page.locator('input[type="number"]');
    await numberInputs.nth(0).fill('-1');
    await page.getByRole('button', { name: /Create/i }).click();
    await expect(page.getByText('Calories must be non-negative')).toBeVisible();
  });

  test('shows validation error for negative protein', async ({ page }) => {
    await page.getByPlaceholder('Ingredient name').fill('Test');
    await page.getByPlaceholder('per 100g').fill('per 100g');
    const numberInputs = page.locator('input[type="number"]');
    await numberInputs.nth(1).fill('-5');
    await page.getByRole('button', { name: /Create/i }).click();
    await expect(page.getByText('Protein must be non-negative')).toBeVisible();
  });

  test('shows validation error for negative fat', async ({ page }) => {
    await page.getByPlaceholder('Ingredient name').fill('Test');
    await page.getByPlaceholder('per 100g').fill('per 100g');
    const numberInputs = page.locator('input[type="number"]');
    await numberInputs.nth(3).fill('-1');
    await page.getByRole('button', { name: /Create/i }).click();
    await expect(page.getByText('Fat must be non-negative')).toBeVisible();
  });

  test('shows all required field validation errors on empty submit', async ({ page }) => {
    await page.getByRole('button', { name: /Create/i }).click();
    await expect(page.getByText('Name is required')).toBeVisible();
    await expect(page.getByText('Unit is required')).toBeVisible();
  });

  test('shows validation error for negative carbs', async ({ page }) => {
    await page.getByPlaceholder('Ingredient name').fill('Test');
    await page.getByPlaceholder('per 100g').fill('per 100g');
    const numberInputs = page.locator('input[type="number"]');
    await numberInputs.nth(2).fill('-1');
    await page.getByRole('button', { name: /Create/i }).click();
    await expect(page.getByText('Carbs must be non-negative')).toBeVisible();
  });

  test('shows validation error for negative fiber', async ({ page }) => {
    await page.getByPlaceholder('Ingredient name').fill('Test');
    await page.getByPlaceholder('per 100g').fill('per 100g');
    const numberInputs = page.locator('input[type="number"]');
    await numberInputs.nth(4).fill('-1');
    await page.getByRole('button', { name: /Create/i }).click();
    await expect(page.getByText('Fiber must be non-negative')).toBeVisible();
  });

  test('shows validation error for negative vitamin A', async ({ page }) => {
    await page.getByPlaceholder('Ingredient name').fill('Test');
    await page.getByPlaceholder('per 100g').fill('per 100g');
    const numberInputs = page.locator('input[type="number"]');
    await numberInputs.nth(5).fill('-1');
    await page.getByRole('button', { name: /Create/i }).click();
    await expect(page.getByText('Vitamin A must be non-negative')).toBeVisible();
  });

  test('shows validation error for negative vitamin C', async ({ page }) => {
    await page.getByPlaceholder('Ingredient name').fill('Test');
    await page.getByPlaceholder('per 100g').fill('per 100g');
    const numberInputs = page.locator('input[type="number"]');
    await numberInputs.nth(6).fill('-1');
    await page.getByRole('button', { name: /Create/i }).click();
    await expect(page.getByText('Vitamin C must be non-negative')).toBeVisible();
  });

  test('shows validation error for negative calcium', async ({ page }) => {
    await page.getByPlaceholder('Ingredient name').fill('Test');
    await page.getByPlaceholder('per 100g').fill('per 100g');
    const numberInputs = page.locator('input[type="number"]');
    await numberInputs.nth(7).fill('-1');
    await page.getByRole('button', { name: /Create/i }).click();
    await expect(page.getByText('Calcium must be non-negative')).toBeVisible();
  });

  test('shows validation error for negative iron', async ({ page }) => {
    await page.getByPlaceholder('Ingredient name').fill('Test');
    await page.getByPlaceholder('per 100g').fill('per 100g');
    const numberInputs = page.locator('input[type="number"]');
    await numberInputs.nth(8).fill('-1');
    await page.getByRole('button', { name: /Create/i }).click();
    await expect(page.getByText('Iron must be non-negative')).toBeVisible();
  });

  test('shows validation error for name exceeding 100 characters', async ({ page }) => {
    await page.getByPlaceholder('Ingredient name').fill('A'.repeat(101));
    await page.getByRole('button', { name: /Create/i }).click();
    await expect(page.getByText('Name must be at most 100 characters')).toBeVisible();
  });

  test('shows validation error for unit exceeding 50 characters', async ({ page }) => {
    await page.getByPlaceholder('Ingredient name').fill('Test');
    await page.getByPlaceholder('per 100g').fill('A'.repeat(51));
    const numberInputs = page.locator('input[type="number"]');
    for (let i = 0; i < 9; i++) await numberInputs.nth(i).fill('0');
    await page.getByRole('button', { name: /Create/i }).click();
    await expect(page.getByText('Unit must be at most 50 characters')).toBeVisible();
  });

  test('shows API error on failed create', async ({ page }) => {
    await page.route('**/api/ingredients', async (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ message: 'Ingredient already exists' }) });
      } else {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockIngredients) });
      }
    });
    await page.getByPlaceholder('Ingredient name').fill('Chicken Breast');
    await page.getByPlaceholder('per 100g').fill('per 100g');
    const numberInputs = page.locator('input[type="number"]');
    for (let i = 0; i < 9; i++) await numberInputs.nth(i).fill('0');
    await page.getByRole('button', { name: /Create/i }).click();
    await expect(page.getByText('Ingredient already exists')).toBeVisible();
  });

  test('zero values are valid for all nutritional fields', async ({ page }) => {
    await page.route('**/api/ingredients', async (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 3, name: 'Water' }) });
      } else {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockIngredients) });
      }
    });
    await page.getByPlaceholder('Ingredient name').fill('Water');
    await page.getByPlaceholder('per 100g').fill('per 100ml');
    const numberInputs = page.locator('input[type="number"]');
    for (let i = 0; i < 9; i++) await numberInputs.nth(i).fill('0');
    await page.getByRole('button', { name: /Create/i }).click();
    await expect(page).toHaveURL('/ingredients');
  });

  test('submit button is disabled while submitting', async ({ page }) => {
    await page.route('**/api/ingredients', async (route) => {
      if (route.request().method() === 'POST') {
        await new Promise(r => setTimeout(r, 500));
        route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 3, name: 'Oats' }) });
      } else {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockIngredients) });
      }
    });
    await page.getByPlaceholder('Ingredient name').fill('Oats');
    await page.getByPlaceholder('per 100g').fill('per 100g');
    const numberInputs = page.locator('input[type="number"]');
    for (let i = 0; i < 9; i++) await numberInputs.nth(i).fill('0');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByRole('button', { name: 'Saving...' })).toBeDisabled();
  });

  test('cancel navigates back to ingredients list', async ({ page }) => {
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page).toHaveURL('/ingredients');
  });

  test('successful create navigates to ingredients list', async ({ page }) => {
    await page.route('**/api/ingredients', async (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 3, name: 'Oats' }) });
      } else {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockIngredients) });
      }
    });
    await page.getByPlaceholder('Ingredient name').fill('Oats');
    await page.getByPlaceholder('per 100g').fill('per 100g');
    const numberInputs = page.locator('input[type="number"]');
    for (let i = 0; i < 9; i++) {
      await numberInputs.nth(i).fill('0');
    }
    await page.getByRole('button', { name: /Create/i }).click();
    await expect(page).toHaveURL('/ingredients');
    await expect(page.getByText('Ingredient created')).toBeVisible();
  });
});

test.describe('Ingredient Form - Edit', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({ userId: 1, username: 'testuser', fullName: 'Test User' }));
    });
    await page.route('**/api/ingredients/1', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockIngredients[0]) });
      } else {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockIngredients[0]) });
      }
    });
    await page.goto('/ingredients/1/edit');
  });

  test('pre-fills form with existing ingredient data', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Edit Ingredient' })).toBeVisible();
    await expect(page.getByPlaceholder('Ingredient name')).toHaveValue('Chicken Breast');
  });

  test('shows Update button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Update' })).toBeVisible();
  });

  test('successful update shows success toast', async ({ page }) => {
    await page.route('**/api/ingredients', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockIngredients) })
    );
    await page.getByPlaceholder('Ingredient name').fill('Chicken Breast Updated');
    await page.getByRole('button', { name: 'Update' }).click();
    await expect(page.getByText('Ingredient updated')).toBeVisible();
  });

  test('shows error toast when ingredient fails to load on edit', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({ userId: 1, username: 'testuser', fullName: 'Test User' }));
    });
    await page.route('**/api/ingredients/99', (route) =>
      route.fulfill({ status: 404 })
    );
    await page.goto('/ingredients/99/edit');
    await expect(page.getByText('Failed to load ingredient').first()).toBeVisible();
  });

  test('submit button is disabled while updating', async ({ page }) => {
    await page.route('**/api/ingredients/1', async (route) => {
      if (route.request().method() === 'PUT') {
        await new Promise(r => setTimeout(r, 500));
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockIngredients[0]) });
      } else {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockIngredients[0]) });
      }
    });
    await page.getByPlaceholder('Ingredient name').fill('Chicken Breast Updated');
    await page.getByRole('button', { name: 'Update' }).click();
    await expect(page.getByRole('button', { name: 'Saving...' })).toBeDisabled();
  });
});
