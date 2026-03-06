import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../contexts/UserProvider";

export default function RequireAuth({ children, requiredRole }) {
  const { user } = useUser();
  const location = useLocation();

  if (user.isLoading) {
    return <div>Checking authentication...</div>;
  }

  if (!user.isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <div>You do not have permission to view this page.</div>;
  }

  return children;
}
