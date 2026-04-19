import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { getUserProfile } from '../hooks/useUserProfile';

export function ProtectedRoute({ allowedRoles }) {
  const { currentUser } = useAppContext();
  const location = useLocation();
  
  // Also check localStorage as fallback
  const userProfile = getUserProfile()
  const effectiveRole = currentUser?.role || userProfile?.role || 'employee'

  const isGuest = !currentUser || currentUser.name === 'Guest' || !currentUser.email;

  // 1. If not logged in, redirect to login page
  if (isGuest) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. If logged in but role does not match, redirect to appropriate home/dashboard
  if (allowedRoles && !allowedRoles.includes(effectiveRole)) {
    if (effectiveRole === 'recruiter') {
      return <Navigate to="/recruiter/services" replace />;
    }
    // Default fallback to services
    return <Navigate to="/services" replace />;
  }

  // 3. Authorized, render the child routes
  return <Outlet />;
}
