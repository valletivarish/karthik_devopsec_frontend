import { test, expect } from '@playwright/test';

const mockRecipes = [
  { id: 1, title: 'Pasta Carbonara', difficulty: 'MEDIUM', prepTime: 10, cookTime: 20, servings: 4, totalCalories: 600, totalProtein: 25, ingredients: [] },
  { id: 2, title: 'Caesar Salad', difficulty: 'EASY', prepTime: 15, cookTime: 0, servings: 2, totalCalories: 300, totalProtein: 10, ingredients: [] },
];

test.describe('Recipe List', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({ userId: 1, username: 'testuser', fullName: 'Test User' }));
    });
    await page.route('**/api/recipes', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockRecipes) })
    );
    await page.goto('/recipes');
  });

  test('displays list of recipes', async ({ page }) => {
    await expect(page.getByText('Pasta Carbonara')).toBeVisible();
    await expect(page.getByText('Caesar Salad')).toBeVisible();
  });

  test('shows recipe difficulty badges', async ({ page }) => {
    await expect(page.getByText('MEDIUM')).toBeVisible();
    await expect(page.getByText('EASY')).toBeVisible();
  });

  test('displays total time (prep + cook)', async ({ page }) => {
    await expect(page.getByText('30 min')).toBeVisible();
    await expect(page.getByText('15 min')).toBeVisible();
  });

  test('displays calories and protein', async ({ page }) => {
    await expect(page.getByText('600 kcal')).toBeVisible();
    await expect(page.getByText('25g')).toBeVisible();
  });

  test('has Add Recipe button linking to new recipe form', async ({ page }) => {
    const addBtn = page.getByRole('link', { name: /Add Recipe/i });
    await expect(addBtn).toBeVisible();
    await addBtn.click();
    await expect(page).toHaveURL('/recipes/new');
  });

  test('shows empty state when no recipes exist', async ({ page }) => {
    await page.route('**/api/recipes', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    );
    await page.goto('/recipes');
    await expect(page.getByText('No recipes found')).toBeVisible();
    await expect(page.getByText('Create your first recipe to get started')).toBeVisible();
  });

  test('search filters recipes by keyword', async ({ page }) => {
    await page.route('**/api/recipes/search*', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([mockRecipes[0]]) })
    );
    await page.getByPlaceholder('Search recipes by title...').fill('Pasta');
    await page.getByRole('button', { name: /Search/i }).click();
    await expect(page.getByText('Pasta Carbonara')).toBeVisible();
    await expect(page.getByText('Caesar Salad')).not.toBeVisible();
  });

  test('search triggers on Enter key', async ({ page }) => {
    let searchCalled = false;
    await page.route('**/api/recipes/search*', (route) => {
      searchCalled = true;
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockRecipes) });
    });
    await page.getByPlaceholder('Search recipes by title...').fill('Pasta');
    await page.getByPlaceholder('Search recipes by title...').press('Enter');
    expect(searchCalled).toBe(true);
  });

  test('empty search reloads full recipe list', async ({ page }) => {
    let getAllCalled = 0;
    await page.route('**/api/recipes', (route) => {
      getAllCalled++;
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockRecipes) });
    });
    await page.getByRole('button', { name: /Search/i }).click();
    expect(getAllCalled).toBeGreaterThanOrEqual(1);
  });

  test('search with no results shows empty state', async ({ page }) => {
    await page.route('**/api/recipes/search*', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    );
    await page.getByPlaceholder('Search recipes by title...').fill('xyznotfound');
    await page.getByRole('button', { name: /Search/i }).click();
    await expect(page.getByText('No recipes found')).toBeVisible();
  });

  test('whitespace-only search reloads full list without calling search API', async ({ page }) => {
    let searchCalled = false;
    await page.route('**/api/recipes/search*', (route) => {
      searchCalled = true;
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.getByPlaceholder('Search recipes by title...').fill('   ');
    await page.getByRole('button', { name: /Search/i }).click();
    expect(searchCalled).toBe(false);
    await expect(page.getByText('Pasta Carbonara')).toBeVisible();
  });

  test('search API error shows error toast', async ({ page }) => {
    await page.route('**/api/recipes/search*', (route) =>
      route.fulfill({ status: 500 })
    );
    await page.getByPlaceholder('Search recipes by title...').fill('Pasta');
    await page.getByRole('button', { name: /Search/i }).click();
    await expect(page.getByText('Search failed')).toBeVisible();
  });

  test('shows error toast when delete API fails', async ({ page }) => {
    await page.route('**/api/recipes/1', (route) =>
      route.fulfill({ status: 500 })
    );
    await page.locator('button.btn-danger').first().click();
    await page.locator('.dialog-content .btn-danger').click();
    await expect(page.getByText('Failed to delete recipe')).toBeVisible();
    await expect(page.getByText('Pasta Carbonara')).toBeVisible();
  });

  test('shows error toast when recipes fail to load', async ({ page }) => {
    await page.route('**/api/recipes', (route) =>
      route.fulfill({ status: 500 })
    );
    await page.goto('/recipes');
    await expect(page.getByText('Failed to load recipes').first()).toBeVisible();
  });

  test('delete button shows confirm dialog', async ({ page }) => {
    await page.locator('button.btn-danger').first().click();
    await expect(page.getByText('Delete Recipe')).toBeVisible();
    await expect(page.getByText('Are you sure you want to delete this recipe?')).toBeVisible();
  });

  test('confirming delete removes recipe from list', async ({ page }) => {
    await page.route('**/api/recipes/1', (route) =>
      route.fulfill({ status: 204 })
    );
    await page.locator('button.btn-danger').first().click();
    await page.locator('.dialog-content .btn-danger').click();
    await expect(page.locator('tbody').getByText('Pasta Carbonara')).not.toBeVisible();
    await expect(page.getByText('Recipe deleted')).toBeVisible();
  });

  test('cancelling delete keeps recipe in list', async ({ page }) => {
    await page.locator('button.btn-danger').first().click();
    await page.getByRole('button', { name: /Cancel/i }).click();
    await expect(page.getByText('Pasta Carbonara')).toBeVisible();
  });

  test('edit button navigates to edit form', async ({ page }) => {
    /* Use btn-outline class to target the edit link specifically */
    await page.locator('a.btn-outline.btn-sm').first().click();
    await expect(page).toHaveURL('/recipes/1/edit');
  });
});

test.describe('Recipe Form - Create', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({ userId: 1, username: 'testuser', fullName: 'Test User' }));
    });
    await page.route('**/api/ingredients', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 1, name: 'Chicken' }, { id: 2, name: 'Rice' }]) })
    );
    await page.goto('/recipes/new');
  });

  test('renders new recipe form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'New Recipe' })).toBeVisible();
    await expect(page.getByPlaceholder('Recipe title')).toBeVisible();
    await expect(page.getByPlaceholder('Brief description')).toBeVisible();
    await expect(page.getByPlaceholder('Step-by-step cooking instructions')).toBeVisible();
  });

  test('shows validation error for empty title', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Recipe' }).click();
    await expect(page.getByText('Title is required')).toBeVisible();
  });

  test('shows validation error for missing instructions', async ({ page }) => {
    await page.getByPlaceholder('Recipe title').fill('Test Recipe');
    await page.getByRole('button', { name: 'Create Recipe' }).click();
    await expect(page.getByText('Instructions are required')).toBeVisible();
  });

  test('shows validation error for prep time below 1', async ({ page }) => {
    await page.getByPlaceholder('Recipe title').fill('Test Recipe');
    await page.getByPlaceholder('Step-by-step cooking instructions').fill('Cook it');
    await page.locator('input[type="number"]').first().fill('0');
    await page.getByRole('button', { name: 'Create Recipe' }).click();
    await expect(page.getByText('Prep time must be at least 1 minute')).toBeVisible();
  });

  test('shows validation error for missing difficulty', async ({ page }) => {
    await page.getByPlaceholder('Recipe title').fill('Test Recipe');
    await page.getByPlaceholder('Step-by-step cooking instructions').fill('Cook it');
    await page.getByRole('button', { name: 'Create Recipe' }).click();
    await expect(page.getByText('Difficulty is required')).toBeVisible();
  });

  test('shows validation error for servings below 1', async ({ page }) => {
    await page.getByPlaceholder('Recipe title').fill('Test');
    await page.getByPlaceholder('Step-by-step cooking instructions').fill('Instructions');
    const numberInputs = page.locator('input[type="number"]');
    await numberInputs.nth(2).fill('0');
    await page.getByRole('button', { name: 'Create Recipe' }).click();
    await expect(page.getByText('Servings must be at least 1')).toBeVisible();
  });

  test('can add and remove ingredient rows', async ({ page }) => {
    await page.getByRole('button', { name: '+ Add Ingredient' }).click();
    await expect(page.getByRole('button', { name: 'Remove' })).toBeVisible();
    await page.getByRole('button', { name: 'Remove' }).click();
    await expect(page.getByRole('button', { name: 'Remove' })).not.toBeVisible();
  });

  test('shows validation error for prep time above 1440', async ({ page }) => {
    await page.getByPlaceholder('Recipe title').fill('Test');
    await page.getByPlaceholder('Step-by-step cooking instructions').fill('Instructions');
    await page.locator('input[type="number"]').first().fill('1441');
    await page.getByRole('button', { name: 'Create Recipe' }).click();
    await expect(page.getByText('Prep time must be at most 1440 minutes')).toBeVisible();
  });

  test('shows validation error for cook time above 1440', async ({ page }) => {
    await page.getByPlaceholder('Recipe title').fill('Test');
    await page.getByPlaceholder('Step-by-step cooking instructions').fill('Instructions');
    await page.locator('input[type="number"]').nth(1).fill('1441');
    await page.getByRole('button', { name: 'Create Recipe' }).click();
    await expect(page.getByText('Cook time must be at most 1440 minutes')).toBeVisible();
  });

  test('shows validation error for servings above 100', async ({ page }) => {
    await page.getByPlaceholder('Recipe title').fill('Test');
    await page.getByPlaceholder('Step-by-step cooking instructions').fill('Instructions');
    await page.locator('input[type="number"]').nth(2).fill('101');
    await page.getByRole('button', { name: 'Create Recipe' }).click();
    await expect(page.getByText('Servings must be at most 100')).toBeVisible();
  });

  test('shows validation error for title exceeding 200 characters', async ({ page }) => {
    await page.getByPlaceholder('Recipe title').fill('A'.repeat(201));
    await page.getByRole('button', { name: 'Create Recipe' }).click();
    await expect(page.getByText('Title must be at most 200 characters')).toBeVisible();
  });

  test('shows API error on failed create', async ({ page }) => {
    await page.route('**/api/recipes', async (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ message: 'Recipe with this title already exists' }) });
      } else {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      }
    });
    await page.getByPlaceholder('Recipe title').fill('Duplicate');
    await page.getByPlaceholder('Step-by-step cooking instructions').fill('Instructions');
    await page.locator('input[type="number"]').nth(0).fill('10');
    await page.locator('input[type="number"]').nth(1).fill('20');
    await page.locator('input[type="number"]').nth(2).fill('4');
    await page.getByRole('combobox').first().selectOption('EASY');
    await page.getByRole('button', { name: 'Create Recipe' }).click();
    await expect(page.getByText('Recipe with this title already exists')).toBeVisible();
  });

  test('shows validation error for description exceeding 2000 characters', async ({ page }) => {
    await page.getByPlaceholder('Recipe title').fill('Test');
    await page.getByPlaceholder('Brief description').fill('A'.repeat(2001));
    await page.getByRole('button', { name: 'Create Recipe' }).click();
    await expect(page.getByText('Description must be at most 2000 characters')).toBeVisible();
  });

  test('cook time of 0 is accepted as valid', async ({ page }) => {
    await page.route('**/api/recipes', async (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 3 }) });
      } else {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockRecipes) });
      }
    });
    await page.getByPlaceholder('Recipe title').fill('Quick Recipe');
    await page.getByPlaceholder('Step-by-step cooking instructions').fill('Just eat it raw');
    await page.locator('input[type="number"]').nth(0).fill('5');
    await page.locator('input[type="number"]').nth(1).fill('0');
    await page.locator('input[type="number"]').nth(2).fill('2');
    await page.getByRole('combobox').first().selectOption('EASY');
    await page.getByRole('button', { name: 'Create Recipe' }).click();
    await expect(page.getByText('Cook time must be at most 1440 minutes')).not.toBeVisible();
  });

  test('submit button is disabled while submitting', async ({ page }) => {
    await page.route('**/api/recipes', async (route) => {
      if (route.request().method() === 'POST') {
        await new Promise(r => setTimeout(r, 500));
        route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 3, title: 'New Recipe' }) });
      } else {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockRecipes) });
      }
    });
    await page.getByPlaceholder('Recipe title').fill('New Recipe');
    await page.getByPlaceholder('Step-by-step cooking instructions').fill('Instructions');
    await page.locator('input[type="number"]').nth(0).fill('10');
    await page.locator('input[type="number"]').nth(1).fill('20');
    await page.locator('input[type="number"]').nth(2).fill('4');
    await page.getByRole('combobox').first().selectOption('EASY');
    await page.getByRole('button', { name: 'Create Recipe' }).click();
    await expect(page.getByRole('button', { name: 'Saving...' })).toBeDisabled();
  });

  test('cancel button navigates back to recipes list', async ({ page }) => {
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page).toHaveURL('/recipes');
  });

  test('successful create navigates to recipes list', async ({ page }) => {
    await page.route('**/api/recipes', async (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 3, title: 'New Recipe' }) });
      } else {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockRecipes) });
      }
    });
    await page.getByPlaceholder('Recipe title').fill('New Recipe');
    await page.getByPlaceholder('Brief description').fill('A delicious recipe');
    await page.getByPlaceholder('Step-by-step cooking instructions').fill('Step 1: Cook. Step 2: Eat.');
    const numberInputs = page.locator('input[type="number"]');
    await numberInputs.nth(0).fill('10');
    await numberInputs.nth(1).fill('20');
    await numberInputs.nth(2).fill('4');
    await page.getByRole('combobox').first().selectOption('EASY');
    await page.getByRole('button', { name: 'Create Recipe' }).click();
    await expect(page).toHaveURL('/recipes');
    await expect(page.getByText('Recipe created successfully')).toBeVisible();
  });
});

test.describe('Recipe Form - Edit', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({ userId: 1, username: 'testuser', fullName: 'Test User' }));
    });
    await page.route('**/api/ingredients', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 1, name: 'Chicken' }]) })
    );
    await page.route('**/api/recipes/1', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200, contentType: 'application/json',
          body: JSON.stringify({ id: 1, title: 'Pasta Carbonara', description: 'Classic Italian', instructions: 'Boil pasta', prepTime: 10, cookTime: 20, servings: 4, difficulty: 'MEDIUM', ingredients: [] }),
        });
      } else {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
      }
    });
    await page.goto('/recipes/1/edit');
  });

  test('pre-fills form with existing recipe data', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Edit Recipe' })).toBeVisible();
    await expect(page.getByPlaceholder('Recipe title')).toHaveValue('Pasta Carbonara');
    await expect(page.getByPlaceholder('Brief description')).toHaveValue('Classic Italian');
  });

  test('shows Update Recipe button instead of Create', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Update Recipe' })).toBeVisible();
  });

  test('successful update shows success toast', async ({ page }) => {
    await page.route('**/api/recipes', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockRecipes) })
    );
    await page.getByPlaceholder('Recipe title').fill('Updated Pasta');
    await page.getByRole('button', { name: 'Update Recipe' }).click();
    await expect(page.getByText('Recipe updated successfully')).toBeVisible();
  });

  test('shows error toast when recipe fails to load on edit', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({ userId: 1, username: 'testuser', fullName: 'Test User' }));
    });
    await page.route('**/api/ingredients', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    );
    await page.route('**/api/recipes/99', (route) =>
      route.fulfill({ status: 404 })
    );
    await page.goto('/recipes/99/edit');
    await expect(page.getByText('Failed to load recipe').first()).toBeVisible();
  });

  test('submit button shows Saving... and is disabled during update', async ({ page }) => {
    await page.route('**/api/recipes', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockRecipes) })
    );
    await page.route('**/api/recipes/1', async (route) => {
      if (route.request().method() === 'PUT') {
        await new Promise(r => setTimeout(r, 500));
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
      } else {
        route.fulfill({
          status: 200, contentType: 'application/json',
          body: JSON.stringify({ id: 1, title: 'Pasta Carbonara', description: 'Classic Italian', instructions: 'Boil pasta', prepTime: 10, cookTime: 20, servings: 4, difficulty: 'MEDIUM', ingredients: [] }),
        });
      }
    });
    await page.goto('/recipes/1/edit');
    await page.getByPlaceholder('Recipe title').fill('Updated Pasta');
    await page.getByRole('button', { name: 'Update Recipe' }).click();
    await expect(page.getByRole('button', { name: 'Saving...' })).toBeDisabled();
  });
});
