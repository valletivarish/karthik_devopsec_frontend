import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import recipeService from '../../services/recipeService';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmDialog from '../common/ConfirmDialog';

/**
 * Recipe listing page with search, filter by difficulty, and CRUD actions.
 * Displays recipe cards with nutritional summaries and action buttons.
 */
function RecipeList() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { loadRecipes(); }, []);

  const loadRecipes = async () => {
    try {
      const response = await recipeService.getAll();
      setRecipes(response.data);
    } catch { toast.error('Failed to load recipes'); }
    finally { setLoading(false); }
  };

  /* Search recipes by title keyword */
  const handleSearch = async () => {
    if (!searchTerm.trim()) { loadRecipes(); return; }
    try {
      const response = await recipeService.search(searchTerm);
      setRecipes(response.data);
    } catch { toast.error('Search failed'); }
  };

  /* Delete a recipe after confirmation */
  const handleDelete = async () => {
    try {
      await recipeService.delete(deleteId);
      setRecipes(recipes.filter(r => r.id !== deleteId));
      toast.success('Recipe deleted');
    } catch { toast.error('Failed to delete recipe'); }
    finally { setDeleteId(null); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h1>Recipes</h1>
        <Link to="/recipes/new" className="btn btn-primary"><FiPlus /> Add Recipe</Link>
      </div>

      {/* Search bar for filtering recipes by title */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <input type="text" className="form-control" placeholder="Search recipes by title..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          <button className="btn btn-primary" onClick={handleSearch}><FiSearch /> Search</button>
        </div>
      </div>

      {/* Recipe table with nutritional data and actions */}
      {recipes.length === 0 ? (
        <div className="empty-state">
          <h3>No recipes found</h3>
          <p>Create your first recipe to get started</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th><th>Difficulty</th><th>Prep Time</th><th>Servings</th>
                <th>Calories</th><th>Protein</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map(recipe => (
                <tr key={recipe.id}>
                  <td><strong>{recipe.title}</strong></td>
                  <td><span className={`badge badge-${recipe.difficulty?.toLowerCase()}`}>{recipe.difficulty}</span></td>
                  <td>{recipe.prepTime + recipe.cookTime} min</td>
                  <td>{recipe.servings}</td>
                  <td>{recipe.totalCalories} kcal</td>
                  <td>{recipe.totalProtein}g</td>
                  <td className="actions-cell">
                    <Link to={`/recipes/${recipe.id}/edit`} className="btn btn-sm btn-outline"><FiEdit2 /></Link>
                    <button className="btn btn-sm btn-danger" onClick={() => setDeleteId(recipe.id)}><FiTrash2 /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm delete dialog */}
      {deleteId && (
        <ConfirmDialog title="Delete Recipe" message="Are you sure you want to delete this recipe? This action cannot be undone."
          onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
      )}
    </div>
  );
}

export default RecipeList;
