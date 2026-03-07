import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Protected route wrapper that redirects unauthenticated users to login.
 * Renders child routes via Outlet if user has a valid JWT token.
 */
function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
