import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function KitchenProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!user) return <Navigate to="/kitchen/login" state={{ from: location }} replace />;
  if (profile && !['kitchen', 'admin', 'manager'].includes(profile.role)) {
    return <Navigate to="/kitchen/login" replace />;
  }
  return <>{children}</>;
}
