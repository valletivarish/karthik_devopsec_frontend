import * as yup from 'yup';

/**
 * Yup validation schemas matching backend Jakarta Bean Validation rules.
 * Ensures client-side validation mirrors server-side constraints.
 */

/* Login form validation - username and password required */
export const loginSchema = yup.object().shape({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required'),
});

/* Registration form validation with length and format constraints */
export const registerSchema = yup.object().shape({
  username: yup.string().required('Username is required').min(3, 'Username must be at least 3 characters').max(50, 'Username must be at most 50 characters'),
  email: yup.string().required('Email is required').email('Email must be a valid email address').max(100, 'Email must be at most 100 characters'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters').max(100, 'Password must be at most 100 characters'),
  fullName: yup.string().required('Full name is required').max(100, 'Full name must be at most 100 characters'),
});

/* Recipe form validation with time and serving constraints */
export const recipeSchema = yup.object().shape({
  title: yup.string().required('Title is required').max(200, 'Title must be at most 200 characters'),
  description: yup.string().max(2000, 'Description must be at most 2000 characters'),
  instructions: yup.string().required('Instructions are required'),
  prepTime: yup.number().required('Prep time is required').min(1, 'Prep time must be at least 1 minute').max(1440, 'Prep time must be at most 1440 minutes').typeError('Prep time must be a number'),
  cookTime: yup.number().required('Cook time is required').min(0, 'Cook time must be non-negative').max(1440, 'Cook time must be at most 1440 minutes').typeError('Cook time must be a number'),
  servings: yup.number().required('Servings is required').min(1, 'Servings must be at least 1').max(100, 'Servings must be at most 100').typeError('Servings must be a number'),
  difficulty: yup.string().required('Difficulty is required'),
});

/* Ingredient form validation with non-negative nutritional values */
export const ingredientSchema = yup.object().shape({
  name: yup.string().required('Name is required').max(100, 'Name must be at most 100 characters'),
  calories: yup.number().required('Calories is required').min(0, 'Calories must be non-negative').typeError('Must be a number'),
  protein: yup.number().required('Protein is required').min(0, 'Protein must be non-negative').typeError('Must be a number'),
  carbs: yup.number().required('Carbs is required').min(0, 'Carbs must be non-negative').typeError('Must be a number'),
  fat: yup.number().required('Fat is required').min(0, 'Fat must be non-negative').typeError('Must be a number'),
  fiber: yup.number().required('Fiber is required').min(0, 'Fiber must be non-negative').typeError('Must be a number'),
  vitaminA: yup.number().required('Vitamin A is required').min(0, 'Must be non-negative').typeError('Must be a number'),
  vitaminC: yup.number().required('Vitamin C is required').min(0, 'Must be non-negative').typeError('Must be a number'),
  calcium: yup.number().required('Calcium is required').min(0, 'Must be non-negative').typeError('Must be a number'),
  iron: yup.number().required('Iron is required').min(0, 'Must be non-negative').typeError('Must be a number'),
  unit: yup.string().required('Unit is required').max(50, 'Unit must be at most 50 characters'),
});

/* Meal plan form validation with date constraints */
export const mealPlanSchema = yup.object().shape({
  name: yup.string().required('Name is required').max(200, 'Name must be at most 200 characters'),
  startDate: yup.string().required('Start date is required'),
  endDate: yup.string().required('End date is required'),
});

/* Dietary profile validation with calorie goal range 500-10000 */
export const dietaryProfileSchema = yup.object().shape({
  calorieGoal: yup.number().required('Calorie goal is required').min(500, 'Calorie goal must be at least 500').max(10000, 'Calorie goal must be at most 10000').typeError('Must be a number'),
  proteinGoal: yup.number().required('Protein goal is required').min(0, 'Must be non-negative').typeError('Must be a number'),
  carbGoal: yup.number().required('Carb goal is required').min(0, 'Must be non-negative').typeError('Must be a number'),
  fatGoal: yup.number().required('Fat goal is required').min(0, 'Must be non-negative').typeError('Must be a number'),
});

/* Shopping list form validation */
export const shoppingListSchema = yup.object().shape({
  name: yup.string().required('Name is required').max(200, 'Name must be at most 200 characters'),
});
