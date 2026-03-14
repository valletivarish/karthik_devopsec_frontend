import { NavLink } from 'react-router-dom';
import { FiGrid, FiBook, FiPackage, FiCalendar, FiShoppingCart, FiTrendingUp, FiUser } from 'react-icons/fi';

/**
 * Sidebar navigation component with links to all main pages.
 * Uses NavLink for automatic active state highlighting.
 */
function Sidebar() {
  /* Navigation items with icons and route paths */
  const navItems = [
    { to: '/dashboard', icon: <FiGrid />, label: 'Dashboard' },
    { to: '/recipes', icon: <FiBook />, label: 'Recipes' },
    { to: '/ingredients', icon: <FiPackage />, label: 'Ingredients' },
    { to: '/meal-plans', icon: <FiCalendar />, label: 'Meal Plans' },
    { to: '/shopping-lists', icon: <FiShoppingCart />, label: 'Shopping Lists' },
    { to: '/dietary-profile', icon: <FiUser />, label: 'Dietary Profile' },
    { to: '/forecast', icon: <FiTrendingUp />, label: 'Nutrition Forecast' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">Meal Planner</div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
