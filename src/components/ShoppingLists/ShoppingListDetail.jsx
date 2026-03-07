import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import shoppingListService from '../../services/shoppingListService';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Detail view for a shopping list showing all items with toggle checkboxes.
 * Items can be marked as checked/unchecked for tracking purchases.
 */
function ShoppingListDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadList(); }, [id]);

  const loadList = async () => {
    try {
      const response = await shoppingListService.getById(id);
      setList(response.data);
    } catch { toast.error('Failed to load shopping list'); navigate('/shopping-lists'); }
    finally { setLoading(false); }
  };

  const toggleItem = async (itemId) => {
    try {
      await shoppingListService.toggleItem(itemId);
      setList(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.id === itemId ? { ...item, checked: !item.checked } : item
        ),
      }));
    } catch { toast.error('Failed to update item'); }
  };

  if (loading) return <LoadingSpinner />;
  if (!list) return null;

  const total = list.items?.length || 0;
  const checked = list.items?.filter(i => i.checked).length || 0;

  return (
    <div>
      <div className="page-header">
        <h1>{list.name}</h1>
        <span style={{ color: 'var(--text-light)' }}>{checked}/{total} items completed</span>
      </div>

      <div className="card">
        {total === 0 ? (
          <p style={{ textAlign: 'center', padding: 20, color: 'var(--text-light)' }}>
            No items in this shopping list.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {list.items.map(item => (
              <div key={item.id} className={`shopping-item ${item.checked ? 'checked' : ''}`}
                   onClick={() => toggleItem(item.id)} style={{ cursor: 'pointer' }}>
                <input type="checkbox" checked={item.checked} onChange={() => toggleItem(item.id)}
                       onClick={e => e.stopPropagation()} />
                <span style={{ flex: 1, textDecoration: item.checked ? 'line-through' : 'none',
                               opacity: item.checked ? 0.5 : 1 }}>
                  {item.ingredientName}
                </span>
                <span style={{ color: 'var(--text-light)', fontSize: 14 }}>
                  {item.quantity} {item.unit}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span>Progress</span>
            <span>{Math.round((checked / total) * 100)}%</span>
          </div>
          <div style={{ background: 'var(--border)', borderRadius: 8, height: 12, overflow: 'hidden' }}>
            <div style={{ width: `${(checked / total) * 100}%`, height: '100%',
                          background: 'var(--primary)', borderRadius: 8, transition: 'width 0.3s ease' }} />
          </div>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <button className="btn btn-outline" onClick={() => navigate('/shopping-lists')}>Back to Lists</button>
      </div>
    </div>
  );
}

export default ShoppingListDetail;
