import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPlus, FiEye, FiEdit2, FiTrash2, FiShoppingCart } from 'react-icons/fi';
import shoppingListService from '../../services/shoppingListService';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmDialog from '../common/ConfirmDialog';

/**
 * Displays all shopping lists with links to detail view.
 */
function ShoppingListList() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { loadLists(); }, []);

  const loadLists = async () => {
    try {
      const response = await shoppingListService.getAll();
      setLists(response.data);
    } catch { toast.error('Failed to load shopping lists'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    try {
      await shoppingListService.delete(deleteTarget.id);
      toast.success('Shopping list deleted');
      setLists(lists.filter(l => l.id !== deleteTarget.id));
    } catch { toast.error('Failed to delete shopping list'); }
    finally { setDeleteTarget(null); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h1>Shopping Lists</h1>
        <Link to="/shopping-lists/new" className="btn btn-primary"><FiPlus /> New List</Link>
      </div>

      {lists.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <FiShoppingCart size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
          <p>No shopping lists yet. Generate one from a meal plan!</p>
          <Link to="/shopping-lists/new" className="btn btn-primary" style={{ marginTop: 16 }}>Create Shopping List</Link>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Items</th>
                <th>Completed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lists.map(list => {
                const total = list.items?.length || 0;
                const checked = list.items?.filter(i => i.checked).length || 0;
                return (
                  <tr key={list.id}>
                    <td><strong>{list.name}</strong></td>
                    <td>{total}</td>
                    <td>{checked}/{total}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link to={`/shopping-lists/${list.id}`} className="btn btn-outline btn-sm"><FiEye /></Link>
                        <Link to={`/shopping-lists/${list.id}/edit`} className="btn btn-outline btn-sm"><FiEdit2 /></Link>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(list)}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Shopping List"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default ShoppingListList;
