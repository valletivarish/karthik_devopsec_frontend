import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import recipeService from '../../services/recipeService';
import ingredientService from '../../services/ingredientService';
import { recipeSchema } from '../../utils/validators';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Recipe form component for creating and editing recipes.
 * Includes dynamic ingredient addition with quantity and unit fields.
 * Client-side validation mirrors backend Jakarta Bean Validation rules.
 */
function RecipeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [ingredients, setIngredients] = useState([]);
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(recipeSchema),
  });

  useEffect(() => {
    loadIngredients();
    if (isEditing) loadRecipe();
  }, [id]);

  const loadIngredients = async () => {
    try {
      const response = await ingredientService.getAll();
      setIngredients(response.data);
    } catch { /* Ingredients list is optional */ }
  };

  /* Load existing recipe data for editing */
  const loadRecipe = async () => {
    setLoading(true);
    try {
      const response = await recipeService.getById(id);
      const recipe = response.data;
      reset({
        title: recipe.title, description: recipe.description,
        instructions: recipe.instructions, prepTime: recipe.prepTime,
        cookTime: recipe.cookTime, servings: recipe.servings,
        difficulty: recipe.difficulty, imageUrl: recipe.imageUrl,
      });
      setRecipeIngredients(recipe.ingredients?.map(ri => ({
        ingredientId: ri.ingredientId, quantity: ri.quantity, unit: ri.unit,
      })) || []);
    } catch { toast.error('Failed to load recipe'); }
    finally { setLoading(false); }
  };

  /* Add a blank ingredient row to the dynamic list */
  const addIngredientRow = () => {
    setRecipeIngredients([...recipeIngredients, { ingredientId: '', quantity: '', unit: 'grams' }]);
  };

  /* Remove an ingredient row by index */
  const removeIngredientRow = (index) => {
    setRecipeIngredients(recipeIngredients.filter((_, i) => i !== index));
  };

  /* Update a specific field in an ingredient row */
  const updateIngredientRow = (index, field, value) => {
    const updated = [...recipeIngredients];
    updated[index][field] = value;
    setRecipeIngredients(updated);
  };

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      ingredients: recipeIngredients.filter(ri => ri.ingredientId && ri.quantity).map(ri => ({
        ingredientId: Number(ri.ingredientId),
        quantity: Number(ri.quantity),
        unit: ri.unit,
      })),
    };

    try {
      if (isEditing) {
        await recipeService.update(id, payload);
        toast.success('Recipe updated successfully');
      } else {
        await recipeService.create(payload);
        toast.success('Recipe created successfully');
      }
      navigate('/recipes');
    } catch (error) {
      const message = error.response?.data?.errors || error.response?.data?.message || 'Failed to save recipe';
      if (typeof message === 'object') {
        Object.values(message).forEach(msg => toast.error(msg));
      } else {
        toast.error(message);
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h1>{isEditing ? 'Edit Recipe' : 'New Recipe'}</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>Title</label>
            <input className={`form-control ${errors.title ? 'error' : ''}`} {...register('title')} placeholder="Recipe title" />
            {errors.title && <p className="error-message">{errors.title.message}</p>}
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea className={`form-control ${errors.description ? 'error' : ''}`} rows="3" {...register('description')} placeholder="Brief description" />
            {errors.description && <p className="error-message">{errors.description.message}</p>}
          </div>

          <div className="form-group">
            <label>Instructions</label>
            <textarea className={`form-control ${errors.instructions ? 'error' : ''}`} rows="6" {...register('instructions')} placeholder="Step-by-step cooking instructions" />
            {errors.instructions && <p className="error-message">{errors.instructions.message}</p>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Prep Time (minutes)</label>
              <input type="number" className={`form-control ${errors.prepTime ? 'error' : ''}`} {...register('prepTime')} />
              {errors.prepTime && <p className="error-message">{errors.prepTime.message}</p>}
            </div>
            <div className="form-group">
              <label>Cook Time (minutes)</label>
              <input type="number" className={`form-control ${errors.cookTime ? 'error' : ''}`} {...register('cookTime')} />
              {errors.cookTime && <p className="error-message">{errors.cookTime.message}</p>}
            </div>
            <div className="form-group">
              <label>Servings</label>
              <input type="number" className={`form-control ${errors.servings ? 'error' : ''}`} {...register('servings')} />
              {errors.servings && <p className="error-message">{errors.servings.message}</p>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Difficulty</label>
              <select className={`form-control ${errors.difficulty ? 'error' : ''}`} {...register('difficulty')}>
                <option value="">Select difficulty</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
              {errors.difficulty && <p className="error-message">{errors.difficulty.message}</p>}
            </div>
            <div className="form-group">
              <label>Image URL (optional)</label>
              <input className="form-control" {...register('imageUrl')} placeholder="https://example.com/image.jpg" />
            </div>
          </div>

          {/* Dynamic ingredient list */}
          <div className="form-group">
            <label>Ingredients</label>
            {recipeIngredients.map((ri, index) => (
              <div key={index} className="form-row" style={{ marginBottom: 8 }}>
                <select className="form-control" value={ri.ingredientId}
                  onChange={(e) => updateIngredientRow(index, 'ingredientId', e.target.value)}>
                  <option value="">Select ingredient</option>
                  {ingredients.map(ing => (
                    <option key={ing.id} value={ing.id}>{ing.name}</option>
                  ))}
                </select>
                <input type="number" className="form-control" placeholder="Quantity" value={ri.quantity}
                  onChange={(e) => updateIngredientRow(index, 'quantity', e.target.value)} />
                <input className="form-control" placeholder="Unit" value={ri.unit}
                  onChange={(e) => updateIngredientRow(index, 'unit', e.target.value)} />
                <button type="button" className="btn btn-sm btn-danger" onClick={() => removeIngredientRow(index)}>Remove</button>
              </div>
            ))}
            <button type="button" className="btn btn-sm btn-outline" onClick={addIngredientRow}>+ Add Ingredient</button>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update Recipe' : 'Create Recipe')}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/recipes')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RecipeForm;
