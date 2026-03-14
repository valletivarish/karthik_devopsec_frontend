import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiEdit2, FiArrowLeft } from 'react-icons/fi';
import recipeService from '../../services/recipeService';
import LoadingSpinner from '../common/LoadingSpinner';

function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadRecipe(); }, [id]);

  const loadRecipe = async () => {
    try {
      const response = await recipeService.getById(id);
      setRecipe(response.data);
    } catch { toast.error('Failed to load recipe'); navigate('/recipes'); }
    finally { setLoading(false); }
  };

  if (loading) return <LoadingSpinner />;
  if (!recipe) return null;

  return (
    <div>
      <div className="page-header">
        <h1>{recipe.title}</h1>
        <Link to={`/recipes/${id}/edit`} className="btn btn-primary"><FiEdit2 /> Edit</Link>
      </div>

      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div><strong>Difficulty:</strong> <span className={`badge badge-${recipe.difficulty?.toLowerCase()}`}>{recipe.difficulty}</span></div>
          <div><strong>Prep Time:</strong> {recipe.prepTime} min</div>
          <div><strong>Cook Time:</strong> {recipe.cookTime} min</div>
          <div><strong>Servings:</strong> {recipe.servings}</div>
          <div><strong>Total Calories:</strong> {recipe.totalCalories} kcal</div>
          <div><strong>Total Protein:</strong> {recipe.totalProtein}g</div>
        </div>

        {recipe.description && (
          <div style={{ marginBottom: 16 }}>
            <h3>Description</h3>
            <p>{recipe.description}</p>
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <h3>Instructions</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{recipe.instructions}</p>
        </div>

        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div>
            <h3>Ingredients</h3>
            <table>
              <thead>
                <tr><th>Ingredient</th><th>Quantity</th><th>Unit</th></tr>
              </thead>
              <tbody>
                {recipe.ingredients.map((ri, idx) => (
                  <tr key={idx}>
                    <td>{ri.ingredientName || ri.name || `Ingredient #${ri.ingredientId}`}</td>
                    <td>{ri.quantity}</td>
                    <td>{ri.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <button className="btn btn-outline" onClick={() => navigate('/recipes')}><FiArrowLeft /> Back to Recipes</button>
      </div>
    </div>
  );
}

export default RecipeDetail;
