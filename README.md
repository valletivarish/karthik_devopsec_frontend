# Smart Recipe Meal Planner - Frontend

React frontend for the Smart Recipe Meal Planner with Nutritional Analysis application.

## Tech Stack

- **Framework:** React 18 with Vite
- **Routing:** React Router DOM 6
- **HTTP Client:** Axios with JWT interceptor
- **Forms:** React Hook Form + Yup validation
- **Charts:** Recharts (Bar, Pie, Line charts)
- **Notifications:** React Toastify
- **Icons:** React Icons (Feather)
- **Linting:** ESLint with React plugins

## Project Structure

```
src/
    components/
        Auth/           Login, Register, ProtectedRoute
        Layout/         Sidebar, Navbar, MainLayout
        Dashboard/      Dashboard with charts
        Recipes/        Recipe CRUD (list + form)
        Ingredients/    Ingredient CRUD (list + form)
        MealPlans/      Meal plan CRUD (list + form)
        DietaryProfile/ Dietary profile management
        ShoppingLists/  Shopping list with item toggle
        Forecast/       ML nutritional forecast charts
        common/         LoadingSpinner, ConfirmDialog
    context/            AuthContext (JWT state)
    services/           API service modules (axios)
    utils/              Yup validation schemas
```

## Pages

- **Dashboard** - Summary cards, daily nutrition bar chart, macro pie chart
- **Recipes** - CRUD with dynamic ingredient rows, search, difficulty filter
- **Ingredients** - CRUD with full nutritional data (macro + micronutrients)
- **Meal Plans** - Weekly plans with day/meal/recipe entries
- **Dietary Profile** - Calorie and macro goals, allergies, restrictions
- **Shopping Lists** - Auto-generated lists with checkbox toggle and progress
- **Nutrition Forecast** - ML-predicted 7-day trends with line charts and confidence

## Running Locally

### Prerequisites
- Node.js 18+
- npm 9+

### Setup
1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Access at http://localhost:5173

The dev server proxies `/api` requests to http://localhost:8080 (backend).

### Build
```
npm run build
```

## Static Analysis

- ESLint with React and React Hooks plugins
- npm audit for dependency vulnerability scanning
- Trivy filesystem scan for security vulnerabilities

## CI/CD Pipeline

GitHub Actions workflow at `.github/workflows/ci-cd.yml`:
- CI: Install, lint (ESLint), audit (npm), build, Trivy security scan
- CD: Deploy built assets to AWS S3 static hosting (on push to main only)

## Infrastructure

Terraform configuration in `terraform/` for AWS deployment:
- S3 bucket with static website hosting
- Public access policy for web serving
- Error document routing to index.html for SPA support
