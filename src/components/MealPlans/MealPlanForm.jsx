import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import mealPlanService from '../../services/mealPlanService';
import recipeService from '../../services/recipeService';
import { mealPlanSchema } from '../../utils/validators';
import LoadingSpinner from '../common/LoadingSpinner';

const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];
const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

/**
 * Form for creating/editing meal plans with dynamic meal entries.
 * Each entry maps a day + meal type to a recipe.
 */
function MealPlanForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState([]);

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(mealPlanSchema),
    defaultValues: { entries: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'entries' });

  useEffect(() => {
    loadRecipes();
    if (isEditing) loadPlan();
  }, [id]);

  const loadRecipes = async () => {
    try {
      const response = await recipeService.getAll();
      setRecipes(response.data);
    } catch { toast.error('Failed to load recipes'); }
  };

  const loadPlan = async () => {
    setLoading(true);
    try {
      const response = await mealPlanService.getById(id);
      const plan = response.data;
      reset({
        name: plan.name,
        startDate: plan.startDate,
        endDate: plan.endDate,
        entries: plan.entries?.map(e => ({
          dayOfWeek: e.dayOfWeek,
          mealType: e.mealType,
          recipeId: e.recipeId,
        })) || [],
      });
    } catch { toast.error('Failed to load meal plan'); }
    finally { setLoading(false); }
  };

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await mealPlanService.update(id, data);
        toast.success('Meal plan updated');
      } else {
        await mealPlanService.create(data);
        toast.success('Meal plan created');
      }
      navigate('/meal-plans');
    } catch (error) {
      const message = error.response?.data?.errors || error.response?.data?.message || 'Failed to save';
      if (typeof message === 'object') { Object.values(message).forEach(msg => toast.error(msg)); }
      else { toast.error(message); }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header"><h1>{isEditing ? 'Edit Meal Plan' : 'New Meal Plan'}</h1></div>
      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-row">
            <div className="form-group">
              <label>Plan Name</label>
              <input className={`form-control ${errors.name ? 'error' : ''}`} {...register('name')} placeholder="e.g. Week 1 Plan" />
              {errors.name && <p className="error-message">{errors.name.message}</p>}
            </div>
            <div className="form-group">
              <label>Start Date</label>
              <input type="date" className={`form-control ${errors.startDate ? 'error' : ''}`} {...register('startDate')} />
              {errors.startDate && <p className="error-message">{errors.startDate.message}</p>}
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input type="date" className={`form-control ${errors.endDate ? 'error' : ''}`} {...register('endDate')} />
              {errors.endDate && <p className="error-message">{errors.endDate.message}</p>}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 12px' }}>
            <h3>Meal Entries</h3>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => append({ dayOfWeek: 'MONDAY', mealType: 'BREAKFAST', recipeId: '' })}>
              <FiPlus /> Add Entry
            </button>
          </div>

          {fields.length === 0 && (
            <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: 20 }}>
              No entries yet. Add meals to your plan above.
            </p>
          )}

          {fields.map((field, index) => (
            <div key={field.id} className="form-row" style={{ alignItems: 'flex-end' }}>
              <div className="form-group">
                <label>Day</label>
                <select className="form-control" {...register(`entries.${index}.dayOfWeek`)}>
                  {DAYS.map(d => <option key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Meal</label>
                <select className="form-control" {...register(`entries.${index}.mealType`)}>
                  {MEAL_TYPES.map(m => <option key={m} value={m}>{m.charAt(0) + m.slice(1).toLowerCase()}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ flex: 2 }}>
                <label>Recipe</label>
                <select className={`form-control ${errors.entries?.[index]?.recipeId ? 'error' : ''}`} {...register(`entries.${index}.recipeId`)}>
                  <option value="">Select recipe...</option>
                  {recipes.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                </select>
                {errors.entries?.[index]?.recipeId && <p className="error-message">{errors.entries[index].recipeId.message}</p>}
              </div>
              <div className="form-group" style={{ flex: 0 }}>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(index)}><FiTrash2 /></button>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/meal-plans')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MealPlanForm;
