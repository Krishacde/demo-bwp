import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation
} from "react-router-dom";

import {
  Lightbulb,
  Moon,
  Sun,
  Users as UsersIcon,
  User,
  LogIn
} from "lucide-react";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Users from "./pages/Users";
import UserProfile from "./pages/UserProfile";

const Navbar = () => {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const [token, setToken] = useState(() => localStorage.getItem("token"));

  useEffect(() => {
    // Sync token on location change
    setToken(localStorage.getItem("token"));
  }, [location]);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );

    localStorage.setItem(
      "theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        <Link to="/" className="logo">
          <span className="logo-mark">
            <Lightbulb size={19} />
          </span>

          <span className="logo-text">
            Vichar<span>Manthan</span>
          </span>
        </Link>

        <div className="nav-links">
          <Link
            to="/"
            className={`nav-link ${location.pathname === "/" ? "nav-link-active" : ""}`}
          >
            Home
          </Link>

          <Link
            to="/users"
            className={`nav-link ${location.pathname.startsWith("/users") ? "nav-link-active" : ""}`}
          >
            <UsersIcon size={16} /> Explore Users
          </Link>

          {token ? (
            <Link
              to="/profile"
              className={`nav-link ${location.pathname.startsWith("/profile") ? "nav-link-active" : ""}`}
            >
              <User size={16} /> My Profile
            </Link>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                <LogIn size={16} /> Login
              </Link>

              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </>
          )}

          <button
            className="theme-button"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <Sun size={18} />
            ) : (
              <Moon size={18} />
            )}
          </button>
        </div>

      </div>
    </nav>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <div className="app">

        <Navbar />

        <Routes>
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/profile/edit"
            element={<EditProfile />}
          />

          <Route
            path="/users"
            element={<Users />}
          />

          <Route
            path="/users/:id"
            element={<UserProfile />}
          />
        </Routes>

        <footer className="footer">
          VicharManthan · Turn ideas into reality.
        </footer>

      </div>
    </BrowserRouter>
  );
};

export default App;