// import { useEffect, useState } from "react";
// import {
//   BrowserRouter,
//   Routes,
//   Route,
//   Link
// } from "react-router-dom";

// import {
//   Lightbulb,
//   Moon,
//   Sun
// } from "lucide-react";

// import Home from "./pages/Home";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Profile from "./pages/Profile";
// import CreateIdea from "./pages/CreateIdea";
// import Ideas from "./pages/Ideas";
// import IdeaDetails from "./pages/IdeaDetails";
// import FounderDashboard from "./pages/FounderDashboard";
// import CollaboratorDashboard from "./pages/CollaboratorDashboard";
// import ProtectedRoute from "./components/ProtectedRoute";
// import { AuthProvider } from "./context/AuthContext";

// const Navbar = () => {
//   const [darkMode, setDarkMode] = useState(() => {
//     return localStorage.getItem("theme") === "dark";
//   });

//   useEffect(() => {
//     document.documentElement.setAttribute(
//       "data-theme",
//       darkMode ? "dark" : "light"
//     );

//     localStorage.setItem(
//       "theme",
//       darkMode ? "dark" : "light"
//     );
//   }, [darkMode]);

//   return (
//     <nav className="navbar">
//       <div className="navbar-inner">

//         <Link to="/" className="logo">
//           <span className="logo-mark">
//             <Lightbulb size={19} />
//           </span>

//           <span className="logo-text">
//             Vichar<span>Manthan</span>
//           </span>
//         </Link>

//         <div className="nav-links">
//           <Link to="/" className="nav-link">
//             Home
//           </Link>

//           <Link to="/ideas" className="nav-link">
//             Explore
//           </Link>

//           <Link to="/create-idea" className="nav-link">
//             Post Idea
//           </Link>

//           <Link to="/login" className="nav-link">
//             Login
//           </Link>

//           <Link to="/register" className="btn btn-primary">
//             Get Started
//           </Link>

//           <button
//             className="theme-button"
//             onClick={() => setDarkMode(!darkMode)}
//             aria-label="Toggle theme"
//           >
//             {darkMode ? (
//               <Sun size={18} />
//             ) : (
//               <Moon size={18} />
//             )}
//           </button>
//         </div>

//       </div>
//     </nav>
//   );
// };

// const App = () => {
//   return (
//     <BrowserRouter>
//       <div className="app">

//         <Navbar />

//         <Routes>
//           <Route
//   path="/founder/dashboard"
//   element={<FounderDashboard />}
// />

// <Route
//   path="/collaborator/dashboard"
//   element={<CollaboratorDashboard />}
// />
//           <Route
//   path="/founder/dashboard"
//   element={
//     <ProtectedRoute allowedRoles={["founder"]}>
//       <FounderDashboard />
//     </ProtectedRoute>
//   }
// />

// <Route
//   path="/collaborator/dashboard"
//   element={
//     <ProtectedRoute allowedRoles={["collaborator"]}>
//       <CollaboratorDashboard />
//     </ProtectedRoute>
//   }
// />

// <Route
//   path="/my-ideas"
//   element={
//     <ProtectedRoute allowedRoles={["founder"]}>
//       <MyIdeas />
//     </ProtectedRoute>
//   }
// />

// <Route
//   path="/manage-proposals"
//   element={
//     <ProtectedRoute allowedRoles={["founder"]}>
//       <ManageProposals />
//     </ProtectedRoute>
//   }
// />

// <Route
//   path="/my-applications"
//   element={
//     <ProtectedRoute allowedRoles={["collaborator"]}>
//       <MyApplications />
//     </ProtectedRoute>
//   }
// />
//           <Route
//             path="/"
//             element={<Home />}
//           />

//           <Route
//             path="/login"
//             element={<Login />}
//           />

//           <Route
//             path="/register"
//             element={<Register />}
//           />

//           <Route
//             path="/profile"
//             element={<Profile />}
//           />

//           <Route
//             path="/create-idea"
//             element={<CreateIdea />}
//           />

//           <Route
//             path="/ideas"
//             element={<Ideas />}
//           />

//           <Route
//             path="/ideas/:id"
//             element={<IdeaDetails />}
//           />

//           <Route
//             path="/ideas/:id/edit"
//             element={<CreateIdea />}
//           />
//         </Routes>

//         <footer className="footer">
//           VicharManthan · Turn ideas into reality.
//         </footer>

//       </div>
//     </BrowserRouter>
//   );
// };

// export default App;

import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation
} from "react-router-dom";

import { Bell, Lightbulb, Moon, Sun } from "lucide-react";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import CreateIdea from "./pages/CreateIdea";
import Ideas from "./pages/Ideas";
import IdeaDetails from "./pages/IdeaDetails";
import FounderDashboard from "./pages/FounderDashboard";
import CollaboratorDashboard from "./pages/CollaboratorDashboard";
import Messages from "./pages/Messages";
import PublicUserProfile from "./pages/PublicUserProfile";
import Notifications from "./pages/Notifications";

import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const currentUserId = user?._id || user?.id;
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

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

  useEffect(() => {
    if (!currentUserId) {
      setUnreadNotifications(0);
      return undefined;
    }
    const loadUnreadCount = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/notifications/unread-count", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await response.json();
        if (response.ok) setUnreadNotifications(data.unreadCount || 0);
      } catch { /* The notification page can retry if the server is offline. */ }
    };
    loadUnreadCount();
    const timer = window.setInterval(loadUnreadCount, 30000);
    return () => window.clearInterval(timer);
  }, [currentUserId]);

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

          <Link to="/ideas" className="nav-link">
            Explore
          </Link>

          {user ? (
            <>
              {user.role === "founder" && (
                <Link to="/create-idea" className="nav-link">
                  Post Idea
                </Link>
              )}

              <Link
                to={
                  user.role === "founder"
                    ? "/founder/dashboard"
                    : "/collaborator/dashboard"
                }
                className="nav-link"
              >
                Dashboard
              </Link>

              <Link to="/profile" className="nav-link">
                Profile
              </Link>

              <Link to="/messages" className="nav-link">
                Messages
              </Link>

              <Link to="/notifications" className="nav-link notification-nav-link">
                <Bell size={15} /> Notifications
                {unreadNotifications > 0 && <span className="notification-nav-count">{unreadNotifications > 99 ? "99+" : unreadNotifications}</span>}
              </Link>

              <button
                className="nav-link"
                onClick={logout}
                type="button"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>

              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
            </>
          )}

          <button
            className="theme-button"
            onClick={() => setDarkMode((previous) => !previous)}
            aria-label="Toggle theme"
            type="button"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

const AppRoutes = () => {
  return (
    <>
      <Navbar />

      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/ideas" element={<Ideas />} />
        <Route path="/ideas/:id" element={<IdeaDetails />} />

        {/* Any logged-in user */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["founder", "collaborator"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute allowedRoles={["founder", "collaborator"]}>
              <PublicUserProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute allowedRoles={["founder", "collaborator"]}>
              <Messages />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={["founder", "collaborator"]}>
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* Founder-only pages */}
        <Route
          path="/founder/dashboard"
          element={
            <ProtectedRoute allowedRoles={["founder"]}>
              <FounderDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-idea"
          element={
            <ProtectedRoute allowedRoles={["founder"]}>
              <CreateIdea />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ideas/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["founder"]}>
              <CreateIdea />
            </ProtectedRoute>
          }
        />

        {/* Collaborator-only pages */}
        <Route
          path="/collaborator/dashboard"
          element={
            <ProtectedRoute allowedRoles={["collaborator"]}>
              <CollaboratorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Home />} />
      </Routes>

      <footer className="footer">
        VicharManthan · Turn ideas into reality.
      </footer>
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
