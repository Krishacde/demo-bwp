
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";

import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

const AuthContext = createContext(null);

const API_URL = `${API_BASE_URL}/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the currently logged-in user from the backend.
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // A 401 usually means the token is invalid or expired.
        if (response.status === 401) {
          localStorage.removeItem("token");
          setUser(null);
        }

        throw new Error("Unable to verify your session.");
      }

      const data = await response.json();

      if (!data.user) {
        throw new Error("User information was not returned.");
      }

      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error("Authentication check failed:", error);

      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check the saved session when the app first loads.
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Call this after successful login or registration.
  const login = useCallback((token, loggedInUser = null) => {
    localStorage.setItem("token", token);

    if (loggedInUser) {
      setUser(loggedInUser);
    } else {
      setUser(null);
    }
  }, []);

  // Clear the client-side session.
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    refreshUser,
    isAuthenticated: Boolean(user),
    isFounder: user?.role === "founder",
    isCollaborator: user?.role === "collaborator"
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook: use this to access authentication anywhere.
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
};
