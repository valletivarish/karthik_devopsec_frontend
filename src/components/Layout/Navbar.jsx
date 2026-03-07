import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Top navigation bar displaying user info and logout button.
 */
function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <h2 className="navbar-title">Smart Recipe Meal Planner</h2>
      <div className="navbar-actions">
        <span>Welcome, {user?.fullName || 'User'}</span>
        <button className="btn-logout" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
}

export default Navbar;
