import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RouteGuard({ children, requireRole }) {
  const { isAuthenticated, currentUser } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && currentUser.role !== requireRole) {
    // If user tries to access a route they don't have permission for,
    // redirect them to their appropriate dashboard
    return <Navigate to={currentUser.role === 'admin' ? '/admin' : '/instructor'} replace />;
  }

  return children;
}
