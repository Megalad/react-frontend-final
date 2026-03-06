import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../contexts/UserProvider";

export default function Logout() {
  const { logout, user } = useUser();

  useEffect(() => {
    logout();
  }, [logout]);

  if (user.isLoggedIn) {
    return <div>Logging out...</div>;
  }

  return <Navigate to="/login" replace />;
}
