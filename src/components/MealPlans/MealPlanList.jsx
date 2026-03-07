import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar } from 'react-icons/fi';
import mealPlanService from '../../services/mealPlanService';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmDialog from '../common/ConfirmDialog';

/**
 * Displays all meal plans in a table with CRUD actions.
 */
function MealPlanList() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { loadPlans(); }, []);

  const loadPlans = async () => {
    try {
      const response = await mealPlanService.getAll();
      setPlans(response.data);
    } catch { toast.error('Failed to load meal plans'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    try {
      await mealPlanService.delete(deleteTarget.id);
      toast.success('Meal plan deleted');
      setPlans(plans.filter(p => p.id !== deleteTarget.id));
    } catch { toast.error('Failed to delete meal plan'); }
    finally { setDeleteTarget(null); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h1>Meal Plans</h1>
        <Link to="/meal-plans/new" className="btn btn-primary"><FiPlus /> New Plan</Link>
      </div>

      {plans.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <FiCalendar size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
          <p>No meal plans yet. Create your first weekly plan!</p>
          <Link to="/meal-plans/new" className="btn btn-primary" style={{ marginTop: 16 }}>Create Meal Plan</Link>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Entries</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(plan => (
                <tr key={plan.id}>
                  <td><strong>{plan.name}</strong></td>
                  <td>{plan.startDate}</td>
                  <td>{plan.endDate}</td>
                  <td>{plan.entries?.length || 0}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link to={`/meal-plans/${plan.id}/edit`} className="btn btn-outline btn-sm"><FiEdit2 /></Link>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(plan)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Meal Plan"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default MealPlanList;
