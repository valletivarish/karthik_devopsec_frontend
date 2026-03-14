import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import shoppingListService from '../../services/shoppingListService';
import ingredientService from '../../services/ingredientService';
import LoadingSpinner from '../common/LoadingSpinner';

function ShoppingListForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [items, setItems] = useState([]);
  const [ingredients, setIngredients] = useState([]);

  useEffect(() => {
    loadIngredients();
    if (isEditing) loadList();
  }, [id]);

  const loadIngredients = async () => {
    try {
      const response = await ingredientService.getAll();
      setIngredients(response.data);
    } catch { /* optional */ }
  };

  const loadList = async () => {
    setLoading(true);
    try {
      const response = await shoppingListService.getById(id);
      const list = response.data;
      setName(list.name);
      setItems(list.items?.map(i => ({
        ingredientId: i.ingredientId,
        ingredientName: i.ingredientName,
        quantity: i.quantity,
        unit: i.unit,
      })) || []);
    } catch { toast.error('Failed to load shopping list'); }
    finally { setLoading(false); }
  };

  const addItem = () => {
    setItems([...items, { ingredientId: '', quantity: '', unit: 'grams' }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Name is required'); return; }
    setSubmitting(true);
    const payload = {
      name,
      items: items.filter(i => i.ingredientId && i.quantity).map(i => ({
        ingredientId: Number(i.ingredientId),
        quantity: Number(i.quantity),
        unit: i.unit,
      })),
    };
    try {
      if (isEditing) {
        await shoppingListService.update(id, payload);
        toast.success('Shopping list updated');
      } else {
        await shoppingListService.create(payload);
        toast.success('Shopping list created');
      }
      navigate('/shopping-lists');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save shopping list';
      toast.error(message);
    }
    finally { setSubmitting(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h1>{isEditing ? 'Edit Shopping List' : 'New Shopping List'}</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>List Name</label>
            <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Weekly Groceries" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 12px' }}>
            <h3>Items</h3>
            <button type="button" className="btn btn-outline btn-sm" onClick={addItem}><FiPlus /> Add Item</button>
          </div>

          {items.length === 0 && (
            <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: 20 }}>
              No items yet. Add items to your shopping list.
            </p>
          )}

          {items.map((item, index) => (
            <div key={index} className="form-row" style={{ marginBottom: 8 }}>
              <select className="form-control" value={item.ingredientId}
                onChange={(e) => updateItem(index, 'ingredientId', e.target.value)}>
                <option value="">Select ingredient</option>
                {ingredients.map(ing => (
                  <option key={ing.id} value={ing.id}>{ing.name}</option>
                ))}
              </select>
              <input type="number" className="form-control" placeholder="Quantity" value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', e.target.value)} />
              <input className="form-control" placeholder="Unit" value={item.unit}
                onChange={(e) => updateItem(index, 'unit', e.target.value)} />
              <button type="button" className="btn btn-sm btn-danger" onClick={() => removeItem(index)}><FiTrash2 /></button>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/shopping-lists')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ShoppingListForm;
