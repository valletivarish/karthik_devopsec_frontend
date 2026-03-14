import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import dietaryProfileService from '../../services/dietaryProfileService';
import { dietaryProfileSchema } from '../../utils/validators';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Form for managing the user's dietary profile (goals, allergies, restrictions).
 * Creates a new profile if none exists, otherwise updates the existing one.
 */
function DietaryProfileForm() {
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(dietaryProfileSchema),
  });

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const response = await dietaryProfileService.getMyProfile();
      if (response.data) {
        setProfileId(response.data.id);
        reset({
          calorieGoal: response.data.calorieGoal,
          proteinGoal: response.data.proteinGoal,
          carbGoal: response.data.carbGoal,
          fatGoal: response.data.fatGoal,
          allergies: response.data.allergies?.join(', ') || '',
          dietaryRestrictions: response.data.dietaryRestrictions?.join(', ') || '',
        });
      }
    } catch {
      /* No profile exists yet - form starts empty */
    }
    finally { setLoading(false); }
  };

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      allergies: data.allergies ? data.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
      dietaryRestrictions: data.dietaryRestrictions ? data.dietaryRestrictions.split(',').map(s => s.trim()).filter(Boolean) : [],
    };

    try {
      if (profileId) {
        await dietaryProfileService.update(profileId, payload);
        toast.success('Dietary profile updated');
      } else {
        const response = await dietaryProfileService.create(payload);
        setProfileId(response.data.id);
        toast.success('Dietary profile created');
      }
    } catch (error) {
      const message = error.response?.data?.errors || error.response?.data?.message || 'Failed to save profile';
      if (typeof message === 'object') { Object.values(message).forEach(msg => toast.error(msg)); }
      else { toast.error(message); }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header"><h1>Dietary Profile</h1></div>
      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <h3 style={{ marginBottom: 16 }}>Daily Goals</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Calorie Goal (kcal)</label>
              <input type="number" className={`form-control ${errors.calorieGoal ? 'error' : ''}`} {...register('calorieGoal')} placeholder="2000" />
              {errors.calorieGoal && <p className="error-message">{errors.calorieGoal.message}</p>}
            </div>
            <div className="form-group">
              <label>Protein Goal (g)</label>
              <input type="number" step="0.1" className={`form-control ${errors.proteinGoal ? 'error' : ''}`} {...register('proteinGoal')} placeholder="50" />
              {errors.proteinGoal && <p className="error-message">{errors.proteinGoal.message}</p>}
            </div>
            <div className="form-group">
              <label>Carbs Goal (g)</label>
              <input type="number" step="0.1" className={`form-control ${errors.carbGoal ? 'error' : ''}`} {...register('carbGoal')} placeholder="250" />
              {errors.carbGoal && <p className="error-message">{errors.carbGoal.message}</p>}
            </div>
            <div className="form-group">
              <label>Fat Goal (g)</label>
              <input type="number" step="0.1" className={`form-control ${errors.fatGoal ? 'error' : ''}`} {...register('fatGoal')} placeholder="65" />
              {errors.fatGoal && <p className="error-message">{errors.fatGoal.message}</p>}
            </div>
          </div>

          <h3 style={{ marginBottom: 16 }}>Allergies &amp; Restrictions</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Allergies (comma-separated)</label>
              <input className="form-control" {...register('allergies')} placeholder="e.g. peanuts, shellfish, dairy" />
            </div>
            <div className="form-group">
              <label>Dietary Restrictions (comma-separated)</label>
              <input className="form-control" {...register('dietaryRestrictions')} placeholder="e.g. vegetarian, gluten-free" />
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (profileId ? 'Update Profile' : 'Create Profile')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DietaryProfileForm;
