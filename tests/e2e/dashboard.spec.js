import { test, expect } from '@playwright/test';

const mockDashboard = {
  totalRecipes: 12,
  totalMealPlans: 3,
  totalIngredients: 45,
  totalShoppingLists: 2,
  dailyNutrition: [
    { day: 'MONDAY', calories: 1800, protein: 90, carbs: 220, fat: 60 },
    { day: 'TUESDAY', calories: 2000, protein: 100, carbs: 240, fat: 70 },
  ],
  macroDistribution: { Protein: 25, Carbs: 55, Fat: 20 },
};

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({ userId: 1, username: 'testuser', fullName: 'Test User' }));
    });
    await page.route('**/api/dashboard', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockDashboard) })
    );
    await page.goto('/dashboard');
  });

  test('displays dashboard heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('shows total recipes count', async ({ page }) => {
    await expect(page.getByText('12')).toBeVisible();
    await expect(page.getByText('Total Recipes')).toBeVisible();
  });

  test('shows total meal plans count', async ({ page }) => {
    /* Use locator scoped to the Meal Plans card to avoid ambiguous text matches */
    const card = page.locator('.summary-card').filter({ hasText: 'Meal Plans' });
    await expect(card.locator('h3')).toHaveText('3');
    await expect(card.getByText('Meal Plans')).toBeVisible();
  });

  test('shows total ingredients count', async ({ page }) => {
    const card = page.locator('.summary-card').filter({ hasText: 'Ingredients' });
    await expect(card.locator('h3')).toHaveText('45');
    await expect(card.getByText('Ingredients')).toBeVisible();
  });

  test('shows total shopping lists count', async ({ page }) => {
    const card = page.locator('.summary-card').filter({ hasText: 'Shopping Lists' });
    await expect(card.locator('h3')).toHaveText('2');
    await expect(card.getByText('Shopping Lists')).toBeVisible();
  });

  test('renders daily nutrition chart when data exists', async ({ page }) => {
    await expect(page.getByText('Daily Nutrition (Current Meal Plan)')).toBeVisible();
  });

  test('renders macro distribution chart when data exists', async ({ page }) => {
    await expect(page.getByText('Macro Distribution')).toBeVisible();
  });

  test('shows empty chart state when no daily nutrition', async ({ page }) => {
    await page.route('**/api/dashboard', (route) =>
      route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ ...mockDashboard, dailyNutrition: [], macroDistribution: {} }),
      })
    );
    await page.goto('/dashboard');
    await expect(page.getByText('No meal plan data yet')).toBeVisible();
    await expect(page.getByText('No macro data available')).toBeVisible();
  });

  test('shows zeroes when API returns null data', async ({ page }) => {
    await page.route('**/api/dashboard', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) })
    );
    await page.goto('/dashboard');
    const zeros = page.getByText('0');
    await expect(zeros.first()).toBeVisible();
  });

  test('dashboard loads gracefully when API fails', async ({ page }) => {
    await page.route('**/api/dashboard', (route) =>
      route.fulfill({ status: 500 })
    );
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});
