import { test, expect } from '@playwright/test';

test.describe('Protected Route - Unauthenticated', () => {
  test('redirects unauthenticated user from / to /login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });

  test('redirects unauthenticated user from /dashboard to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });

  test('redirects unauthenticated user from /recipes to /login', async ({ page }) => {
    await page.goto('/recipes');
    await expect(page).toHaveURL('/login');
  });

  test('redirects unauthenticated user from /ingredients to /login', async ({ page }) => {
    await page.goto('/ingredients');
    await expect(page).toHaveURL('/login');
  });

  test('redirects unauthenticated user from /meal-plans to /login', async ({ page }) => {
    await page.goto('/meal-plans');
    await expect(page).toHaveURL('/login');
  });

  test('redirects unauthenticated user from /shopping-lists to /login', async ({ page }) => {
    await page.goto('/shopping-lists');
    await expect(page).toHaveURL('/login');
  });

  test('redirects unauthenticated user from /forecast to /login', async ({ page }) => {
    await page.goto('/forecast');
    await expect(page).toHaveURL('/login');
  });

  test('redirects unauthenticated user from /recipes/new to /login', async ({ page }) => {
    await page.goto('/recipes/new');
    await expect(page).toHaveURL('/login');
  });

  test('redirects unauthenticated user from /ingredients/new to /login', async ({ page }) => {
    await page.goto('/ingredients/new');
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Navigation - Authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({ userId: 1, username: 'testuser', fullName: 'Test User' }));
    });
    await page.route('**/api/dashboard', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ totalRecipes: 0, totalMealPlans: 0, totalIngredients: 0, totalShoppingLists: 0 }) })
    );
    await page.route('**/api/recipes', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    );
    await page.route('**/api/ingredients', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    );
    await page.route('**/api/meal-plans', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    );
    await page.route('**/api/shopping-lists', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    );
    await page.goto('/dashboard');
  });

  test('sidebar shows navigation links', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Dashboard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Recipes/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Ingredients/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Meal Plans/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Shopping/i })).toBeVisible();
  });

  test('clicking Recipes link navigates to /recipes', async ({ page }) => {
    await page.getByRole('link', { name: /^Recipes$/i }).click();
    await expect(page).toHaveURL('/recipes');
  });

  test('clicking Ingredients link navigates to /ingredients', async ({ page }) => {
    await page.getByRole('link', { name: /^Ingredients$/i }).click();
    await expect(page).toHaveURL('/ingredients');
  });

  test('clicking Meal Plans link navigates to /meal-plans', async ({ page }) => {
    await page.getByRole('link', { name: /^Meal Plans$/i }).click();
    await expect(page).toHaveURL('/meal-plans');
  });

  test('clicking Shopping Lists link navigates to /shopping-lists', async ({ page }) => {
    await page.getByRole('link', { name: /Shopping/i }).click();
    await expect(page).toHaveURL('/shopping-lists');
  });

  test('logout clears token and redirects to login', async ({ page }) => {
    await page.getByRole('button', { name: /Logout|Sign out/i }).click();
    await expect(page).toHaveURL('/login');
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });

  test('401 response clears session and redirects to login', async ({ page }) => {
    await page.route('**/api/recipes', (route) =>
      route.fulfill({ status: 401 })
    );
    await page.goto('/recipes');
    await expect(page).toHaveURL('/login');
  });

  test('sidebar Nutrition Forecast link navigates to /forecast', async ({ page }) => {
    await page.route('**/api/forecast', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ forecasts: [] }) })
    );
    await page.getByRole('link', { name: /Forecast/i }).click();
    await expect(page).toHaveURL('/forecast');
  });

  test('active sidebar link is highlighted', async ({ page }) => {
    const link = page.getByRole('link', { name: /^Dashboard$/i });
    await expect(link).toHaveClass(/active/);
  });

  test('navbar displays logged-in full name', async ({ page }) => {
    await expect(page.getByText('Welcome, Test User')).toBeVisible();
  });

  test('after logout login page is shown and token is cleared', async ({ page }) => {
    await page.getByRole('button', { name: /Logout|Sign out/i }).click();
    await expect(page).toHaveURL('/login');
    const user = await page.evaluate(() => localStorage.getItem('user'));
    expect(user).toBeNull();
  });
});
