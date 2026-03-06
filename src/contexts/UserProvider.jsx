/* eslint-disable react-refresh/only-export-components */
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "./UserContext";

const initialUserState = {
  isLoading: true,
  isLoggedIn: false,
  id: "",
  username: "",
  email: "",
  role: "",
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function apiUrl(path) {
  return `${API_URL}${path}`;
}

function mapProfileToUser(profile) {
  return {
    isLoading: false,
    isLoggedIn: true,
    id: profile?._id || "",
    username: profile?.username || "",
    email: profile?.email || "",
    role: profile?.role || "",
  };
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(initialUserState);

  const refreshProfile = useCallback(async () => {
    try {
      const response = await fetch(apiUrl("/api/user/profile"), {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        setUser({
          isLoading: false,
          isLoggedIn: false,
          id: "",
          username: "",
          email: "",
          role: "",
        });
        return false;
      }

      const data = await response.json();
      setUser(mapProfileToUser(data.user));
      return true;
    } catch {
      setUser({
        isLoading: false,
        isLoggedIn: false,
        id: "",
        username: "",
        email: "",
        role: "",
      });
      return false;
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = useCallback(async (email, password) => {
    try {
      const response = await fetch(apiUrl("/api/user/login"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        return false;
      }

      await refreshProfile();
      return true;
    } catch {
      return false;
    }
  }, [refreshProfile]);

  const logout = useCallback(async () => {
    try {
      await fetch(apiUrl("/api/user/logout"), {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser({
        isLoading: false,
        isLoggedIn: false,
        id: "",
        username: "",
        email: "",
        role: "",
      });
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      refreshProfile,
    }),
    [login, logout, refreshProfile, user]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
