import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import ingredientService from '../../services/ingredientService';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmDialog from '../common/ConfirmDialog';

/**
 * Ingredient listing page with search and CRUD operations.
 * Displays nutritional data for each ingredient in a table.
 */
function IngredientList() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { loadIngredients(); }, []);

  const loadIngredients = async () => {
    try {
      const response = await ingredientService.getAll();
      setIngredients(response.data);
    } catch { toast.error('Failed to load ingredients'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    try {
      await ingredientService.delete(deleteId);
      setIngredients(ingredients.filter(i => i.id !== deleteId));
      toast.success('Ingredient deleted');
    } catch { toast.error('Failed to delete ingredient'); }
    finally { setDeleteId(null); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h1>Ingredients</h1>
        <Link to="/ingredients/new" className="btn btn-primary"><FiPlus /> Add Ingredient</Link>
      </div>

      {ingredients.length === 0 ? (
        <div className="empty-state"><h3>No ingredients found</h3><p>Add ingredients to use in your recipes</p></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Name</th><th>Calories</th><th>Protein</th><th>Carbs</th><th>Fat</th><th>Unit</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {ingredients.map(ing => (
                <tr key={ing.id}>
                  <td><strong>{ing.name}</strong></td>
                  <td>{ing.calories}</td><td>{ing.protein}g</td><td>{ing.carbs}g</td><td>{ing.fat}g</td>
                  <td>{ing.unit}</td>
                  <td className="actions-cell">
                    <Link to={`/ingredients/${ing.id}/edit`} className="btn btn-sm btn-outline"><FiEdit2 /></Link>
                    <button className="btn btn-sm btn-danger" onClick={() => setDeleteId(ing.id)}><FiTrash2 /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteId && (
        <ConfirmDialog title="Delete Ingredient" message="Are you sure? This may affect recipes using this ingredient."
          onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
      )}
    </div>
  );
}

export default IngredientList;
