import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

/**
 * Main layout component wrapping protected pages with sidebar and navbar.
 * Renders child routes via Outlet in the main content area.
 */
function MainLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
