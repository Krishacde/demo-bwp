// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { LogIn } from "lucide-react";

// const Login = () => {
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     email: "",
//     password: ""
//   });

//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setForm({
//       ...form,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     setMessage("");
//     setLoading(true);

//     try {
//       const response = await fetch(
//         "http://localhost:5000/api/auth/login",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json"
//           },
//           body: JSON.stringify(form)
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         setMessage(data.message || "Login failed");
//         return;
//       }

//       localStorage.setItem("token", data.token);

//       navigate("/profile");

//     } catch (error) {
//       setMessage(
//         "Unable to connect to the server"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main className="auth-page">

//       <div className="auth-card">

//         <div className="auth-header">

//           <div className="auth-header-icon">
//             <LogIn size={23} />
//           </div>

//           <h1>Welcome back</h1>

//           <p>
//             Login to continue building your ideas.
//           </p>

//         </div>


//         {message && (
//           <div className="form-message">
//             {message}
//           </div>
//         )}


//         <form onSubmit={handleSubmit}>

//           <div className="form-group">
//             <label className="form-label">
//               Email
//             </label>

//             <input
//               className="form-input"
//               type="email"
//               name="email"
//               placeholder="you@example.com"
//               value={form.email}
//               onChange={handleChange}
//               required
//             />
//           </div>


//           <div className="form-group">
//             <label className="form-label">
//               Password
//             </label>

//             <input
//               className="form-input"
//               type="password"
//               name="password"
//               placeholder="Enter your password"
//               value={form.password}
//               onChange={handleChange}
//               required
//             />
//           </div>


//           <button
//             className="btn btn-primary form-button"
//             type="submit"
//             disabled={loading}
//           >
//             {loading
//               ? "Signing in..."
//               : "Sign In"}
//           </button>

//         </form>


//         <div className="auth-footer">
//           Don't have an account?{" "}
//           <Link to="/register">
//             Create one
//           </Link>
//         </div>

//       </div>

//     </main>
//   );
// };

// export default Login;


import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:5000/api";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed.");
        return;
      }

      if (!data.token || !data.user) {
        setMessage("Invalid login response from server.");
        return;
      }

      // Your backend must return role for dashboard routing.
      if (!["founder", "collaborator"].includes(data.user.role)) {
        setMessage(
          "Account role is missing. Update your backend login response."
        );
        return;
      }

      // Save user and token through AuthContext.
      login(data.token, data.user);

      // Redirect according to account role.
      if (data.user.role === "founder") {
        navigate("/founder/dashboard", { replace: true });
      } else {
        navigate("/collaborator/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-header-icon">
            <LogIn size={23} />
          </div>

          <h1>Welcome back</h1>
          <p>Login to continue building your ideas.</p>
        </div>

        {message && (
          <div className="form-message" role="alert">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>

            <input
              id="email"
              className="form-input"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>

            <input
              id="password"
              className="form-input"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            className="btn btn-primary form-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register">Create one</Link>
        </div>
      </div>
    </main>
  );
};

export default Login;
