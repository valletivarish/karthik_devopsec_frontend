import * as yup from 'yup';

/**
 * Yup validation schemas matching backend Jakarta Bean Validation rules.
 * Ensures client-side validation mirrors server-side constraints.
 */

/* Helper: non-negative numeric field with a required label */
const nonNegativeNumber = (label) =>
  yup.number().required(`${label} is required`).min(0, `${label} must be non-negative`).typeError('Must be a number');

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
  calories: nonNegativeNumber('Calories'),
  protein: nonNegativeNumber('Protein'),
  carbs: nonNegativeNumber('Carbs'),
  fat: nonNegativeNumber('Fat'),
  fiber: nonNegativeNumber('Fiber'),
  vitaminA: nonNegativeNumber('Vitamin A'),
  vitaminC: nonNegativeNumber('Vitamin C'),
  calcium: nonNegativeNumber('Calcium'),
  iron: nonNegativeNumber('Iron'),
  unit: yup.string().required('Unit is required').max(50, 'Unit must be at most 50 characters'),
});

/* Meal plan form validation with date constraints */
export const mealPlanSchema = yup.object().shape({
  name: yup.string().required('Name is required').max(200, 'Name must be at most 200 characters'),
  startDate: yup.string().required('Start date is required'),
  endDate: yup.string().required('End date is required'),
});

/* Dietary profile form validation with non-negative goals */
export const dietaryProfileSchema = yup.object().shape({
  calorieGoal: nonNegativeNumber('Calorie goal'),
  proteinGoal: nonNegativeNumber('Protein goal'),
  carbGoal: nonNegativeNumber('Carbs goal'),
  fatGoal: nonNegativeNumber('Fat goal'),
  allergies: yup.string(),
  dietaryRestrictions: yup.string(),
});

/* Shopping list form validation */
export const shoppingListSchema = yup.object().shape({
  name: yup.string().required('Name is required').max(200, 'Name must be at most 200 characters'),
});
