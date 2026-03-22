import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiEdit2, FiArrowLeft, FiCopy } from 'react-icons/fi';
import mealPlanService from '../../services/mealPlanService';
import LoadingSpinner from '../common/LoadingSpinner';

function MealPlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPlan(); }, [id]);

  const loadPlan = async () => {
    try {
      const response = await mealPlanService.getById(id);
      setPlan(response.data);
    } catch { toast.error('Failed to load meal plan'); navigate('/meal-plans'); }
    finally { setLoading(false); }
  };

  if (loading) return <LoadingSpinner />;
  if (!plan) return null;

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

  const getEntry = (day, meal) => plan.entries?.find(e => e.dayOfWeek === day && e.mealType === meal);

  const today = new Date();
  const todayDayName = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][today.getDay()];
  const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  const isTodayInRange = todayStr >= plan.startDate && todayStr <= plan.endDate;
  const isToday = (day) => isTodayInRange && day === todayDayName;

  const extendToNextWeek = async () => {
    try {
      const nextStart = new Date(plan.endDate);
      nextStart.setDate(nextStart.getDate() + 1);
      const nextEnd = new Date(nextStart);
      nextEnd.setDate(nextEnd.getDate() + 6);
      const formatDate = (d) => d.toISOString().split('T')[0];
      const newPlan = {
        name: `${plan.name} (Next Week)`,
        startDate: formatDate(nextStart),
        endDate: formatDate(nextEnd),
        entries: (plan.entries || []).map(e => ({
          dayOfWeek: e.dayOfWeek,
          mealType: e.mealType,
          recipeId: e.recipeId
        }))
      };
      const response = await mealPlanService.create(newPlan);
      toast.success('Meal plan extended to next week!');
      navigate(`/meal-plans/${response.data.id}`);
    } catch {
      toast.error('Failed to extend meal plan');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>{plan.name}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" onClick={extendToNextWeek}><FiCopy /> Extend to Next Week</button>
          <Link to={`/meal-plans/${id}/edit`} className="btn btn-primary"><FiEdit2 /> Edit</Link>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 24 }}>
          <div><strong>Start Date:</strong> {plan.startDate}</div>
          <div><strong>End Date:</strong> {plan.endDate}</div>
          <div><strong>Total Entries:</strong> {plan.entries?.length || 0}</div>
        </div>
      </div>

      <div className="card">
        <h3>Weekly Schedule</h3>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Day</th>
                {mealTypes.map(m => <th key={m}>{m.charAt(0) + m.slice(1).toLowerCase()}</th>)}
              </tr>
            </thead>
            <tbody>
              {days.map(day => (
                <tr key={day} style={isToday(day) ? { backgroundColor: 'var(--primary)', color: '#fff' } : {}}>
                  <td><strong>{day.charAt(0) + day.slice(1).toLowerCase()}{isToday(day) ? ' (Today)' : ''}</strong></td>
                  {mealTypes.map(meal => {
                    const entry = getEntry(day, meal);
                    return (
                      <td key={meal} style={{ color: entry ? 'inherit' : 'var(--text-light)' }}>
                        {entry ? (entry.recipeName || entry.recipeTitle || `Recipe #${entry.recipeId}`) : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <button className="btn btn-outline" onClick={() => navigate('/meal-plans')}><FiArrowLeft /> Back to Meal Plans</button>
      </div>
    </div>
  );
}

export default MealPlanDetail;
