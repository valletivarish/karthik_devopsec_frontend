import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('renders login form with all fields', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('shows validation error when username is empty', async ({ page }) => {
    await page.locator('#password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByText('Username is required')).toBeVisible();
  });

  test('shows validation error when password is empty', async ({ page }) => {
    await page.locator('#username').fill('testuser');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('shows validation errors when both fields are empty', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByText('Username is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('submit button is enabled by default', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeEnabled();
  });

  test('has link to register page', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible();
    await page.getByRole('link', { name: 'Sign up' }).click();
    await expect(page).toHaveURL('/register');
  });

  test('shows API error message on failed login', async ({ page }) => {
    /* Use 400 not 401 — axios 401 interceptor redirects to /login before toast renders */
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ message: 'Invalid credentials' }) })
    );
    await page.locator('#username').fill('wronguser');
    await page.locator('#password').fill('wrongpass');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test('redirects to dashboard on successful login', async ({ page }) => {
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'fake-jwt-token', userId: 1, username: 'testuser', fullName: 'Test User' }),
      })
    );
    await page.route('**/api/dashboard', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ totalRecipes: 0, totalMealPlans: 0, totalIngredients: 0, totalShoppingLists: 0 }) })
    );
    await page.locator('#username').fill('testuser');
    await page.locator('#password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('password field masks input', async ({ page }) => {
    await expect(page.locator('#password')).toHaveAttribute('type', 'password');
  });

  test('shows generic error when server returns no message', async ({ page }) => {
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({}) })
    );
    await page.locator('#username').fill('user');
    await page.locator('#password').fill('pass');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test('demo account buttons fill username and password', async ({ page }) => {
    await page.getByRole('button', { name: 'Demo User' }).click();
    await expect(page.locator('#username')).toHaveValue('demo');
    await expect(page.locator('#password')).toHaveValue('demo1234');
  });

  test('Alice demo button fills correct credentials', async ({ page }) => {
    await page.getByRole('button', { name: 'Alice' }).click();
    await expect(page.locator('#username')).toHaveValue('alice');
    await expect(page.locator('#password')).toHaveValue('alice1234');
  });

  test('Bob demo button fills correct credentials', async ({ page }) => {
    await page.getByRole('button', { name: 'Bob' }).click();
    await expect(page.locator('#username')).toHaveValue('bob');
    await expect(page.locator('#password')).toHaveValue('bob1234');
  });
});

test.describe('Register', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('renders registration form with all fields', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
    await expect(page.locator('#fullName')).toBeVisible();
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('shows validation errors when all fields are empty', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByText('Full name is required')).toBeVisible();
    await expect(page.getByText('Username is required')).toBeVisible();
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('shows error for invalid email format', async ({ page }) => {
    await page.locator('#fullName').fill('Test User');
    await page.locator('#username').fill('testuser');
    await page.locator('#email').fill('not-an-email');
    await page.locator('#password').fill('password123');
    await page.getByRole('button', { name: 'Create Account' }).click();
    /* Yup validates client-side synchronously — error shows without API call */
    await expect(page.getByText('Email must be a valid email address')).toBeVisible({ timeout: 3000 });
  });

  test('shows error for username too short (less than 3 chars)', async ({ page }) => {
    await page.locator('#fullName').fill('Test User');
    await page.locator('#username').fill('ab');
    await page.locator('#email').fill('test@email.com');
    await page.locator('#password').fill('password123');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByText('Username must be at least 3 characters')).toBeVisible();
  });

  test('shows error for password too short (less than 6 chars)', async ({ page }) => {
    await page.locator('#fullName').fill('Test User');
    await page.locator('#username').fill('testuser');
    await page.locator('#email').fill('test@email.com');
    await page.locator('#password').fill('abc');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByText('Password must be at least 6 characters')).toBeVisible();
  });

  test('shows error for username exceeding 50 characters', async ({ page }) => {
    await page.locator('#fullName').fill('Test User');
    await page.locator('#username').fill('a'.repeat(51));
    await page.locator('#email').fill('test@email.com');
    await page.locator('#password').fill('password123');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByText('Username must be at most 50 characters')).toBeVisible();
  });

  test('shows API error on duplicate username', async ({ page }) => {
    await page.route('**/api/auth/register', (route) =>
      route.fulfill({ status: 409, body: JSON.stringify({ message: 'Username already exists' }) })
    );
    await page.locator('#fullName').fill('Test User');
    await page.locator('#username').fill('existinguser');
    await page.locator('#email').fill('test@email.com');
    await page.locator('#password').fill('password123');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByText('Username already exists')).toBeVisible();
  });

  test('redirects to dashboard on successful registration', async ({ page }) => {
    await page.route('**/api/auth/register', (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'fake-jwt-token', userId: 1, username: 'newuser', fullName: 'New User' }),
      })
    );
    await page.route('**/api/dashboard', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ totalRecipes: 0, totalMealPlans: 0, totalIngredients: 0, totalShoppingLists: 0 }) })
    );
    await page.locator('#fullName').fill('New User');
    await page.locator('#username').fill('newuser');
    await page.locator('#email').fill('new@email.com');
    await page.locator('#password').fill('password123');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('has link back to login page', async ({ page }) => {
    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/login');
  });

  /* --- Boundary edge cases --- */

  test('accepts username exactly 3 characters (minimum boundary)', async ({ page }) => {
    await page.route('**/api/auth/register', (route) =>
      route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ token: 'tok', userId: 1, username: 'abc', fullName: 'Test' }) })
    );
    await page.route('**/api/dashboard', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ totalRecipes: 0, totalMealPlans: 0, totalIngredients: 0, totalShoppingLists: 0 }) })
    );
    await page.locator('#fullName').fill('Test');
    await page.locator('#username').fill('abc');
    await page.locator('#email').fill('abc@email.com');
    await page.locator('#password').fill('password');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('accepts password exactly 6 characters (minimum boundary)', async ({ page }) => {
    await page.route('**/api/auth/register', (route) =>
      route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ token: 'tok', userId: 1, username: 'testuser', fullName: 'Test' }) })
    );
    await page.route('**/api/dashboard', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ totalRecipes: 0, totalMealPlans: 0, totalIngredients: 0, totalShoppingLists: 0 }) })
    );
    await page.locator('#fullName').fill('Test');
    await page.locator('#username').fill('testuser');
    await page.locator('#email').fill('t@email.com');
    await page.locator('#password').fill('abc123');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('accepts username exactly 50 characters (maximum boundary)', async ({ page }) => {
    await page.route('**/api/auth/register', (route) =>
      route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ token: 'tok', userId: 1, username: 'a'.repeat(50), fullName: 'Test' }) })
    );
    await page.route('**/api/dashboard', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ totalRecipes: 0, totalMealPlans: 0, totalIngredients: 0, totalShoppingLists: 0 }) })
    );
    await page.locator('#fullName').fill('Test');
    await page.locator('#username').fill('a'.repeat(50));
    await page.locator('#email').fill('t@email.com');
    await page.locator('#password').fill('password123');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('shows error for fullName exceeding 100 characters', async ({ page }) => {
    await page.locator('#fullName').fill('A'.repeat(101));
    await page.locator('#username').fill('testuser');
    await page.locator('#email').fill('test@email.com');
    await page.locator('#password').fill('password123');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByText('Full name must be at most 100 characters')).toBeVisible();
  });

  test('shows error for email exceeding 100 characters', async ({ page }) => {
    await page.locator('#fullName').fill('Test User');
    await page.locator('#username').fill('testuser');
    await page.locator('#email').fill('a'.repeat(95) + '@e.com');
    await page.locator('#password').fill('password123');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByText('Email must be at most 100 characters')).toBeVisible();
  });

  test('shows generic fallback error when server returns no message', async ({ page }) => {
    await page.route('**/api/auth/register', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({}) })
    );
    await page.locator('#fullName').fill('Test User');
    await page.locator('#username').fill('testuser');
    await page.locator('#email').fill('test@email.com');
    await page.locator('#password').fill('password123');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByText('Registration failed')).toBeVisible();
  });

  test('shows error for password exceeding 100 characters', async ({ page }) => {
    await page.locator('#fullName').fill('Test User');
    await page.locator('#username').fill('testuser');
    await page.locator('#email').fill('test@email.com');
    await page.locator('#password').fill('A'.repeat(101));
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByText('Password must be at most 100 characters')).toBeVisible();
  });

  test('accepts password exactly 100 characters (maximum boundary)', async ({ page }) => {
    await page.route('**/api/auth/register', (route) =>
      route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ token: 'tok', userId: 1, username: 'testuser', fullName: 'Test' }) })
    );
    await page.route('**/api/dashboard', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ totalRecipes: 0, totalMealPlans: 0, totalIngredients: 0, totalShoppingLists: 0 }) })
    );
    await page.locator('#fullName').fill('Test');
    await page.locator('#username').fill('testuser');
    await page.locator('#email').fill('t@email.com');
    await page.locator('#password').fill('A'.repeat(100));
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('Create Account button is disabled while submitting', async ({ page }) => {
    /* Slow API so we can catch the disabled state */
    await page.route('**/api/auth/register', async (route) => {
      await new Promise(r => setTimeout(r, 500));
      route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ token: 'tok', userId: 1, username: 'testuser', fullName: 'Test' }) });
    });
    await page.route('**/api/dashboard', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ totalRecipes: 0, totalMealPlans: 0, totalIngredients: 0, totalShoppingLists: 0 }) })
    );
    await page.locator('#fullName').fill('Test User');
    await page.locator('#username').fill('testuser');
    await page.locator('#email').fill('t@email.com');
    await page.locator('#password').fill('password123');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByRole('button', { name: 'Creating Account...' })).toBeDisabled();
  });

  test('Sign In button is disabled while submitting', async ({ page }) => {
    await page.goto('/login');
    await page.route('**/api/auth/login', async (route) => {
      await new Promise(r => setTimeout(r, 500));
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: 'tok', userId: 1, username: 'testuser', fullName: 'Test User' }) });
    });
    await page.route('**/api/dashboard', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ totalRecipes: 0, totalMealPlans: 0, totalIngredients: 0, totalShoppingLists: 0 }) })
    );
    await page.locator('#username').fill('testuser');
    await page.locator('#password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByRole('button', { name: 'Signing in...' })).toBeDisabled();
  });
});
