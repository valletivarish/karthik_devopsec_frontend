import { test, expect } from '@playwright/test';

const mockRecipes = [
  { id: 1, title: 'Pasta Carbonara', difficulty: 'MEDIUM', prepTime: 10, cookTime: 20, servings: 4, totalCalories: 600, totalProtein: 25, ingredients: [] },
  { id: 2, title: 'Caesar Salad', difficulty: 'EASY', prepTime: 15, cookTime: 0, servings: 2, totalCalories: 300, totalProtein: 10, ingredients: [] },
];

const mockMealPlans = [
  { id: 1, name: 'Week 1', startDate: '2026-03-10', endDate: '2026-03-16', entries: [{ dayOfWeek: 'MONDAY', mealType: 'BREAKFAST', recipeId: 1, recipeName: 'Pasta Carbonara' }] },
  { id: 2, name: 'Week 2', startDate: '2026-03-17', endDate: '2026-03-23', entries: [] },
];

test.describe('Meal Plan List', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({ userId: 1, username: 'testuser', fullName: 'Test User' }));
    });
    await page.route('**/api/meal-plans', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockMealPlans) })
    );
    await page.goto('/meal-plans');
  });

  test('displays list of meal plans', async ({ page }) => {
    await expect(page.getByText('Week 1')).toBeVisible();
    await expect(page.getByText('Week 2')).toBeVisible();
  });

  test('shows Add Meal Plan button', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Add|New/i })).toBeVisible();
  });

  test('empty state when no meal plans', async ({ page }) => {
    await page.route('**/api/meal-plans', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    );
    await page.goto('/meal-plans');
    await expect(page.getByText('No meal plans yet. Create your first weekly plan!')).toBeVisible();
  });

  test('edit button navigates to edit form', async ({ page }) => {
    await page.locator('a.btn-outline.btn-sm').first().click();
    await expect(page).toHaveURL('/meal-plans/1/edit');
  });

  test('delete API error shows error toast', async ({ page }) => {
    await page.route('**/api/meal-plans/1', (route) =>
      route.fulfill({ status: 500 })
    );
    await page.locator('button.btn-danger').first().click();
    await page.locator('.dialog-content .btn-danger').click();
    await expect(page.getByText('Failed to delete meal plan')).toBeVisible();
    await expect(page.getByText('Week 1')).toBeVisible();
  });

  test('load failure shows error toast', async ({ page }) => {
    await page.route('**/api/meal-plans', (route) =>
      route.fulfill({ status: 500 })
    );
    await page.goto('/meal-plans');
    await expect(page.getByText('Failed to load meal plans').first()).toBeVisible();
  });

  test('delete button shows confirm dialog', async ({ page }) => {
    await page.locator('button.btn-danger').first().click();
    await expect(page.getByText('Delete Meal Plan')).toBeVisible();
  });

  test('confirming delete removes meal plan from list', async ({ page }) => {
    await page.route('**/api/meal-plans/1', (route) =>
      route.fulfill({ status: 204 })
    );
    await page.locator('button.btn-danger').first().click();
    await page.locator('.dialog-content .btn-danger').click();
    await expect(page.locator('tbody').getByText('Week 1')).not.toBeVisible();
    await expect(page.getByText('Meal plan deleted')).toBeVisible();
  });

  test('cancelling delete keeps meal plan in list', async ({ page }) => {
    await page.locator('button.btn-danger').first().click();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByText('Week 1')).toBeVisible();
  });
});

test.describe('Meal Plan Form - Create', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({ userId: 1, username: 'testuser', fullName: 'Test User' }));
    });
    await page.route('**/api/recipes', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockRecipes) })
    );
    await page.goto('/meal-plans/new');
  });

  test('renders new meal plan form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'New Meal Plan' })).toBeVisible();
    await expect(page.getByPlaceholder('e.g. Week 1 Plan')).toBeVisible();
  });

  test('shows validation error for empty name', async ({ page }) => {
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByText('Name is required')).toBeVisible();
  });

  test('shows validation error for missing start date', async ({ page }) => {
    await page.getByPlaceholder('e.g. Week 1 Plan').fill('My Plan');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByText('Start date is required')).toBeVisible();
  });

  test('shows validation error for missing end date', async ({ page }) => {
    await page.getByPlaceholder('e.g. Week 1 Plan').fill('My Plan');
    const dateInputs = page.locator('input[type="date"]');
    await dateInputs.nth(0).fill('2026-03-10');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByText('End date is required')).toBeVisible();
  });

  test('can add a meal entry', async ({ page }) => {
    await page.getByRole('button', { name: /Add Entry/i }).click();
    await expect(page.getByRole('combobox').filter({ hasText: /Monday|MONDAY/i }).first()).toBeVisible();
  });

  test('can remove a meal entry', async ({ page }) => {
    await page.getByRole('button', { name: /Add Entry/i }).click();
    await expect(page.getByRole('button').filter({ has: page.locator('svg') }).last()).toBeVisible();
    await page.getByRole('button').filter({ has: page.locator('svg') }).last().click();
    await expect(page.getByText('No entries yet. Add meals to your plan above.')).toBeVisible();
  });

  test('shows empty entries message when no entries added', async ({ page }) => {
    await expect(page.getByText('No entries yet. Add meals to your plan above.')).toBeVisible();
  });

  test('shows validation error for name exceeding 200 characters', async ({ page }) => {
    await page.getByPlaceholder('e.g. Week 1 Plan').fill('A'.repeat(201));
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByText('Name must be at most 200 characters')).toBeVisible();
  });

  test('shows both validation errors when name and dates are empty', async ({ page }) => {
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByText('Name is required')).toBeVisible();
    await expect(page.getByText('Start date is required')).toBeVisible();
    await expect(page.getByText('End date is required')).toBeVisible();
  });

  test('shows API error on failed create', async ({ page }) => {
    await page.route('**/api/meal-plans', async (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ message: 'Meal plan already exists for this period' }) });
      } else {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockMealPlans) });
      }
    });
    await page.getByPlaceholder('e.g. Week 1 Plan').fill('Conflict Plan');
    const dateInputs = page.locator('input[type="date"]');
    await dateInputs.nth(0).fill('2026-03-10');
    await dateInputs.nth(1).fill('2026-03-16');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByText('Meal plan already exists for this period')).toBeVisible();
  });

  test('cancel navigates back to meal plans list', async ({ page }) => {
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page).toHaveURL('/meal-plans');
  });

  test('successful create navigates to meal plans list', async ({ page }) => {
    await page.route('**/api/meal-plans', async (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 3, name: 'Test Plan' }) });
      } else {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockMealPlans) });
      }
    });
    await page.getByPlaceholder('e.g. Week 1 Plan').fill('Test Plan');
    const dateInputs = page.locator('input[type="date"]');
    await dateInputs.nth(0).fill('2026-03-10');
    await dateInputs.nth(1).fill('2026-03-16');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page).toHaveURL('/meal-plans');
    await expect(page.getByText('Meal plan created')).toBeVisible();
  });

  test('submit button is disabled while submitting', async ({ page }) => {
    await page.route('**/api/meal-plans', async (route) => {
      if (route.request().method() === 'POST') {
        await new Promise(r => setTimeout(r, 500));
        route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 3, name: 'Test Plan' }) });
      } else {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockMealPlans) });
      }
    });
    await page.getByPlaceholder('e.g. Week 1 Plan').fill('Test Plan');
    const dateInputs = page.locator('input[type="date"]');
    await dateInputs.nth(0).fill('2026-03-10');
    await dateInputs.nth(1).fill('2026-03-16');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByRole('button', { name: 'Saving...' })).toBeDisabled();
  });

  test('day dropdown has all 7 day options', async ({ page }) => {
    await page.getByRole('button', { name: /Add Entry/i }).click();
    const daySelect = page.locator('select').first();
    for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']) {
      await expect(daySelect.locator(`option:has-text("${day}")`)).toHaveCount(1);
    }
  });

  test('meal type dropdown has all 4 meal type options', async ({ page }) => {
    await page.getByRole('button', { name: /Add Entry/i }).click();
    const mealSelect = page.locator('select').nth(1);
    for (const meal of ['Breakfast', 'Lunch', 'Dinner', 'Snack']) {
      await expect(mealSelect.locator(`option:has-text("${meal}")`)).toHaveCount(1);
    }
  });

  test('shows error toast when recipes fail to load', async ({ page }) => {
    await page.route('**/api/recipes', (route) =>
      route.fulfill({ status: 500 })
    );
    await page.goto('/meal-plans/new');
    await expect(page.getByText('Failed to load recipes').first()).toBeVisible();
  });
});

test.describe('Meal Plan Form - Edit', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({ userId: 1, username: 'testuser', fullName: 'Test User' }));
    });
    await page.route('**/api/recipes', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockRecipes) })
    );
    await page.route('**/api/meal-plans/1', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockMealPlans[0]) });
      } else {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockMealPlans[0]) });
      }
    });
    await page.goto('/meal-plans/1/edit');
  });

  test('pre-fills form with existing meal plan name', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Edit Meal Plan' })).toBeVisible();
    await expect(page.getByPlaceholder('e.g. Week 1 Plan')).toHaveValue('Week 1');
  });

  test('shows Update button instead of Create', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Update/i })).toBeVisible();
  });

  test('pre-existing entries are shown', async ({ page }) => {
    await expect(page.getByRole('combobox').filter({ hasText: /Monday|MONDAY/i }).first()).toBeVisible();
  });

  test('shows error toast when meal plan fails to load on edit', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({ userId: 1, username: 'testuser', fullName: 'Test User' }));
    });
    await page.route('**/api/recipes', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockRecipes) })
    );
    await page.route('**/api/meal-plans/99', (route) =>
      route.fulfill({ status: 404 })
    );
    await page.goto('/meal-plans/99/edit');
    await expect(page.getByText('Failed to load meal plan').first()).toBeVisible();
  });

  test('submit button is disabled while updating', async ({ page }) => {
    await page.route('**/api/meal-plans/1', async (route) => {
      if (route.request().method() === 'PUT') {
        await new Promise(r => setTimeout(r, 500));
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockMealPlans[0]) });
      } else {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockMealPlans[0]) });
      }
    });
    await page.getByPlaceholder('e.g. Week 1 Plan').fill('Updated Plan');
    await page.getByRole('button', { name: 'Update' }).click();
    await expect(page.getByRole('button', { name: 'Saving...' })).toBeDisabled();
  });
});
