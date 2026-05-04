import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Skeleton } from './Skeleton.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const ProtectedRoute = ({ roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Skeleton className="h-12 w-56" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};
