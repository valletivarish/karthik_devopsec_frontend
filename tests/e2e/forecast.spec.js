import { test, expect } from '@playwright/test';

const mockForecast = {
  forecasts: [
    {
      nutrient: 'calories',
      confidence: 0.87,
      trend: 'INCREASING',
      predictedValues: [1800, 1850, 1900, 1920, 1950, 1970, 2000],
    },
    {
      nutrient: 'protein',
      confidence: 0.75,
      trend: 'STABLE',
      predictedValues: [85, 86, 87, 88, 87, 86, 87],
    },
    {
      nutrient: 'carbs',
      confidence: 0.60,
      trend: 'DECREASING',
      predictedValues: [220, 215, 210, 205, 200, 198, 195],
    },
    {
      nutrient: 'fat',
      confidence: 0.55,
      trend: 'STABLE',
      predictedValues: [60, 61, 60, 62, 61, 60, 61],
    },
  ],
};

async function goToForecast(page, forecastData = mockForecast) {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'fake-jwt-token');
    localStorage.setItem('user', JSON.stringify({ userId: 1, username: 'testuser', fullName: 'Test User' }));
  });
  await page.route('**/api/forecast', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(forecastData) })
  );
  await page.goto('/forecast');
}

test.describe('Nutrition Forecast', () => {
  test('renders Nutritional Forecast heading', async ({ page }) => {
    await goToForecast(page);
    await expect(page.getByRole('heading', { name: 'Nutritional Forecast' })).toBeVisible();
  });

  test('shows confidence cards for each nutrient', async ({ page }) => {
    await goToForecast(page);
    /* Use summary-card scope to avoid matching the table column headers */
    const cards = page.locator('.summary-card');
    await expect(cards.filter({ hasText: 'Calories' })).toBeVisible();
    await expect(cards.filter({ hasText: 'Protein' })).toBeVisible();
    await expect(cards.filter({ hasText: 'Carbs' })).toBeVisible();
    await expect(cards.filter({ hasText: 'Fat' })).toBeVisible();
  });

  test('shows R-squared confidence percentage for calories', async ({ page }) => {
    await goToForecast(page);
    /* 0.87 * 100 = 87% */
    await expect(page.getByText('87%')).toBeVisible();
  });

  test('shows R-squared confidence label', async ({ page }) => {
    await goToForecast(page);
    await expect(page.getByText('R-squared confidence').first()).toBeVisible();
  });

  test('renders 7-Day Predicted Trends chart section', async ({ page }) => {
    await goToForecast(page);
    await expect(page.getByText('7-Day Predicted Trends')).toBeVisible();
  });

  test('renders Forecast Details table', async ({ page }) => {
    await goToForecast(page);
    await expect(page.getByText('Forecast Details')).toBeVisible();
  });

  test('table has Day column header', async ({ page }) => {
    await goToForecast(page);
    await expect(page.getByRole('columnheader', { name: 'Day' })).toBeVisible();
  });

  test('table has nutrient column headers', async ({ page }) => {
    await goToForecast(page);
    await expect(page.getByRole('columnheader', { name: 'Calories' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Protein' })).toBeVisible();
  });

  test('table shows 7 rows of forecast data (Day 1 through Day 7)', async ({ page }) => {
    await goToForecast(page);
    for (let d = 1; d <= 7; d++) {
      await expect(page.getByRole('cell', { name: `Day ${d}` })).toBeVisible();
    }
  });

  test('shows empty state when no forecast data', async ({ page }) => {
    await goToForecast(page, { forecasts: [] });
    await expect(page.getByText('Not enough meal plan data to generate forecasts.')).toBeVisible();
  });

  test('shows empty state message with instructions', async ({ page }) => {
    await goToForecast(page, { forecasts: [] });
    await expect(page.getByText('Create meal plans with recipes to see predicted nutritional trends.')).toBeVisible();
  });

  test('shows empty state when forecast is null', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({ userId: 1, username: 'testuser', fullName: 'Test User' }));
    });
    await page.route('**/api/forecast', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(null) })
    );
    await page.goto('/forecast');
    await expect(page.getByText('Not enough meal plan data to generate forecasts.')).toBeVisible();
  });

  test('shows error toast when forecast API fails', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({ userId: 1, username: 'testuser', fullName: 'Test User' }));
    });
    await page.route('**/api/forecast', (route) =>
      route.fulfill({ status: 500 })
    );
    await page.goto('/forecast');
    await expect(page.getByText('Failed to load forecast data').first()).toBeVisible();
  });

  test('still renders empty state when API fails', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({ userId: 1, username: 'testuser', fullName: 'Test User' }));
    });
    await page.route('**/api/forecast', (route) =>
      route.fulfill({ status: 500 })
    );
    await page.goto('/forecast');
    await expect(page.getByText('Not enough meal plan data to generate forecasts.')).toBeVisible();
  });

  test('single nutrient forecast renders without error', async ({ page }) => {
    await goToForecast(page, {
      forecasts: [
        {
          nutrient: 'calories',
          confidence: 0.92,
          trend: 'INCREASING',
          predictedValues: [2000, 2050, 2100, 2150, 2200, 2250, 2300],
        },
      ],
    });
    /* Use column header to confirm nutrient is shown — avoids ambiguous card+header match */
    await expect(page.getByRole('columnheader', { name: 'Calories' })).toBeVisible();
    await expect(page.getByText('92%')).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Day 1' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Day 7' })).toBeVisible();
  });
});
