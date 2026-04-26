import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth-store";

export function ProtectedRoute({ allowedRoles }) {
  const location = useLocation();
  const { session, profile, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="glass rounded-3xl px-6 py-5 text-sm">Memuat aplikasi...</div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(profile?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

