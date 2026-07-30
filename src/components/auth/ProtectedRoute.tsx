import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, initialized } = useAuth();

  if (!initialized || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading RestaurantOS...</p>
        </div>
      </div>
    );
  }

  if (localStorage.getItem('ros_activated') !== 'true') {
    return <Navigate to="/activation" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
