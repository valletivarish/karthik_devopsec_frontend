import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import ingredientService from '../../services/ingredientService';
import { ingredientSchema } from '../../utils/validators';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Ingredient form for creating and editing ingredients with full nutritional data.
 * Validates all nutritional values are non-negative per project requirements.
 */
function IngredientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(ingredientSchema),
  });

  useEffect(() => { if (isEditing) loadIngredient(); }, [id]);

  const loadIngredient = async () => {
    setLoading(true);
    try {
      const response = await ingredientService.getById(id);
      reset(response.data);
    } catch { toast.error('Failed to load ingredient'); }
    finally { setLoading(false); }
  };

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await ingredientService.update(id, data);
        toast.success('Ingredient updated');
      } else {
        await ingredientService.create(data);
        toast.success('Ingredient created');
      }
      navigate('/ingredients');
    } catch (error) {
      const message = error.response?.data?.errors || error.response?.data?.message || 'Failed to save';
      if (typeof message === 'object') { Object.values(message).forEach(msg => toast.error(msg)); }
      else { toast.error(message); }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header"><h1>{isEditing ? 'Edit Ingredient' : 'New Ingredient'}</h1></div>
      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input className={`form-control ${errors.name ? 'error' : ''}`} {...register('name')} placeholder="Ingredient name" />
              {errors.name && <p className="error-message">{errors.name.message}</p>}
            </div>
            <div className="form-group">
              <label>Unit (per)</label>
              <input className={`form-control ${errors.unit ? 'error' : ''}`} {...register('unit')} placeholder="per 100g" />
              {errors.unit && <p className="error-message">{errors.unit.message}</p>}
            </div>
          </div>

          <h3 style={{ marginBottom: 16 }}>Macronutrients</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Calories</label>
              <input type="number" step="0.01" className={`form-control ${errors.calories ? 'error' : ''}`} {...register('calories')} />
              {errors.calories && <p className="error-message">{errors.calories.message}</p>}
            </div>
            <div className="form-group">
              <label>Protein (g)</label>
              <input type="number" step="0.01" className={`form-control ${errors.protein ? 'error' : ''}`} {...register('protein')} />
              {errors.protein && <p className="error-message">{errors.protein.message}</p>}
            </div>
            <div className="form-group">
              <label>Carbs (g)</label>
              <input type="number" step="0.01" className={`form-control ${errors.carbs ? 'error' : ''}`} {...register('carbs')} />
              {errors.carbs && <p className="error-message">{errors.carbs.message}</p>}
            </div>
            <div className="form-group">
              <label>Fat (g)</label>
              <input type="number" step="0.01" className={`form-control ${errors.fat ? 'error' : ''}`} {...register('fat')} />
              {errors.fat && <p className="error-message">{errors.fat.message}</p>}
            </div>
          </div>

          <h3 style={{ marginBottom: 16 }}>Micronutrients</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Fiber (g)</label>
              <input type="number" step="0.01" className={`form-control ${errors.fiber ? 'error' : ''}`} {...register('fiber')} />
              {errors.fiber && <p className="error-message">{errors.fiber.message}</p>}
            </div>
            <div className="form-group">
              <label>Vitamin A (mcg)</label>
              <input type="number" step="0.01" className={`form-control ${errors.vitaminA ? 'error' : ''}`} {...register('vitaminA')} />
              {errors.vitaminA && <p className="error-message">{errors.vitaminA.message}</p>}
            </div>
            <div className="form-group">
              <label>Vitamin C (mg)</label>
              <input type="number" step="0.01" className={`form-control ${errors.vitaminC ? 'error' : ''}`} {...register('vitaminC')} />
              {errors.vitaminC && <p className="error-message">{errors.vitaminC.message}</p>}
            </div>
            <div className="form-group">
              <label>Calcium (mg)</label>
              <input type="number" step="0.01" className={`form-control ${errors.calcium ? 'error' : ''}`} {...register('calcium')} />
              {errors.calcium && <p className="error-message">{errors.calcium.message}</p>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Iron (mg)</label>
              <input type="number" step="0.01" className={`form-control ${errors.iron ? 'error' : ''}`} {...register('iron')} />
              {errors.iron && <p className="error-message">{errors.iron.message}</p>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/ingredients')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default IngredientForm;
