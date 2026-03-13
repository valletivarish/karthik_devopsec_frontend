import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './components/Dashboard/Dashboard';
import RecipeList from './components/Recipes/RecipeList';
import RecipeForm from './components/Recipes/RecipeForm';
import IngredientList from './components/Ingredients/IngredientList';
import IngredientForm from './components/Ingredients/IngredientForm';
import MealPlanList from './components/MealPlans/MealPlanList';
import MealPlanForm from './components/MealPlans/MealPlanForm';
import ShoppingListList from './components/ShoppingLists/ShoppingListList';
import ShoppingListDetail from './components/ShoppingLists/ShoppingListDetail';
import NutritionForecast from './components/Forecast/NutritionForecast';

/**
 * Main App component defining all application routes.
 * Public routes: login, register
 * Protected routes: dashboard, recipes, ingredients, meal plans, etc.
 */
function App() {
  return (
    <>
      {/* Toast notification container for success/error messages */}
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Public authentication routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* Protected routes wrapped with MainLayout for navigation */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/recipes" element={<RecipeList />} />
            <Route path="/recipes/new" element={<RecipeForm />} />
            <Route path="/recipes/:id/edit" element={<RecipeForm />} />
            <Route path="/ingredients" element={<IngredientList />} />
            <Route path="/ingredients/new" element={<IngredientForm />} />
            <Route path="/ingredients/:id/edit" element={<IngredientForm />} />
            <Route path="/meal-plans" element={<MealPlanList />} />
            <Route path="/meal-plans/new" element={<MealPlanForm />} />
            <Route path="/meal-plans/:id/edit" element={<MealPlanForm />} />
            <Route path="/shopping-lists" element={<ShoppingListList />} />
            <Route path="/shopping-lists/:id" element={<ShoppingListDetail />} />
            <Route path="/forecast" element={<NutritionForecast />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
