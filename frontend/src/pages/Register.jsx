// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { UserPlus } from "lucide-react";

// const Register = () => {
//   const navigate = useNavigate();

//  const [form, setForm] = useState({
//   name: "",
//   email: "",
//   password: "",
//   role: "collaborator"
// });

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
//         "http://localhost:5000/api/auth/register",
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
//         setMessage(data.message || "Registration failed");
//         return;
//       }

//       localStorage.setItem("token", data.token);

//       // navigate("/profile");
//       navigate(
//   data.user.role === "founder"
//     ? "/founder/dashboard"
//     : "/collaborator/dashboard"
// );

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
//             <UserPlus size={23} />
//           </div>

//           <h1>Create your account</h1>

//           <p>
//             Start turning your ideas into reality.
//           </p>

//         </div>


//         {message && (
//           <div className="form-message">
//             {message}
//           </div>
//         )}


//         <form onSubmit={handleSubmit}>

//          <div className="form-group">
//   <label className="form-label" htmlFor="role">
//     I want to join as
//   </label>

//   <select
//     id="role"
//     className="form-input"
//     name="role"
//     value={form.role}
//     onChange={handleChange}
//     required
//   >
//     <option value="collaborator">
//       Collaborator — find startup ideas to join
//     </option>

//     <option value="founder">
//       Founder — share and build my startup idea
//     </option>
//   </select>
// </div>

//           {/* <div className="form-group">
//             <label className="form-label">
//               Name
//             </label>

//             <input
//               className="form-input"
//               type="text"
//               name="name"
//               placeholder="Enter your name"
//               value={form.name}
//               onChange={handleChange}
//               required
//             />
//           </div> */}


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
//               placeholder="Minimum 6 characters"
//               value={form.password}
//               onChange={handleChange}
//               required
//               minLength={6}
//             />
//           </div>


//           <button
//             className="btn btn-primary form-button"
//             type="submit"
//             disabled={loading}
//           >
//             {loading
//               ? "Creating account..."
//               : "Create Account"}
//           </button>

//         </form>


//         <div className="auth-footer">
//           Already have an account?{" "}
//           <Link to="/login">
//             Login
//           </Link>
//         </div>

//       </div>

//     </main>
//   );
// };

// export default Register;


import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/api`;

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "collaborator"
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (form.password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Registration failed.");
        return;
      }

      if (!data.token || !data.user) {
        setMessage("Registration succeeded, but the login data is missing.");
        return;
      }

      login(data.token, data.user);

      navigate(
        data.user.role === "founder"
          ? "/founder/dashboard"
          : "/collaborator/dashboard",
        { replace: true }
      );
    } catch (error) {
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
            <UserPlus size={23} />
          </div>

          <h1>Create your account</h1>
          <p>Start turning your ideas into reality.</p>
        </div>

        {message && (
          <div className="form-message" role="alert">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full name
            </label>

            <input
              id="name"
              className="form-input"
              type="text"
              name="name"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
              required
              maxLength={80}
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role">
              I want to join as
            </label>

            <select
              id="role"
              className="form-input"
              name="role"
              value={form.role}
              onChange={handleChange}
              required
            >
              <option value="collaborator">
                Collaborator — join startup ideas
              </option>

              <option value="founder">
                Founder — share my startup idea
              </option>
            </select>
          </div>

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
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <button
            className="btn btn-primary form-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </div>
      </div>
    </main>
  );
};

export default Register;
