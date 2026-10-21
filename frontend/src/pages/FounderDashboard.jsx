
// import { useEffect, useMemo, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   Lightbulb,
//   Plus,
//   FolderOpen,
//   Users,
//   TrendingUp,
//   ArrowRight,
//   RefreshCw,
//   Search,
//   Rocket,
//   CircleCheck,
//   LogOut
// } from "lucide-react";

// import "./Dashboard.css";

// const API_URL = "http://localhost:5000/api";

// const FounderDashboard = () => {
//   const navigate = useNavigate();

//   const [user, setUser] = useState(null);
//   const [ideas, setIdeas] = useState([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // Fetch the profile and ideas when the page opens.
//   const loadDashboard = async () => {
//     const token = localStorage.getItem("token");

//     if (!token) {
//       navigate("/login");
//       return;
//     }

//     setLoading(true);
//     setError("");

//     try {
//       const headers = {
//         Authorization: `Bearer ${token}`
//       };

//       const [userResponse, ideasResponse] = await Promise.all([
//         fetch(`${API_URL}/auth/me`, { headers }),
//         fetch(`${API_URL}/ideas`, { headers })
//       ]);

//       // An invalid or expired token should send the user to login.
//       if (
//         userResponse.status === 401 ||
//         userResponse.status === 403
//       ) {
//         localStorage.removeItem("token");
//         navigate("/login");
//         return;
//       }

//       const userData = await userResponse.json();
//       const ideasData = await ideasResponse.json();

//       if (!userResponse.ok) {
//         throw new Error(
//           userData.message || "Could not load your profile."
//         );
//       }

//       if (!ideasResponse.ok) {
//         throw new Error(
//           ideasData.message || "Could not load ideas."
//         );
//       }

//       const currentUser = userData.user;

//       // The role field must be added to your User model first.
//       if (currentUser.role !== "founder") {
//         navigate("/collaborator/dashboard", { replace: true });
//         return;
//       }

//       setUser(currentUser);
//       setIdeas(ideasData.ideas || []);
//     } catch (err) {
//       setError(
//         err.message || "Unable to connect to the server."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadDashboard();
//     // Load once when this dashboard mounts.
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Only show ideas authored by the logged-in founder.
//   const myIdeas = useMemo(() => {
//     if (!user) return [];

//     return ideas.filter((idea) => {
//       const authorId =
//         typeof idea.author === "object"
//           ? idea.author?._id
//           : idea.author;

//       return String(authorId) === String(user._id);
//     });
//   }, [ideas, user]);

//   // Search only within this founder's ideas.
//   const filteredIdeas = useMemo(() => {
//     const query = search.trim().toLowerCase();

//     if (!query) return myIdeas;

//     return myIdeas.filter((idea) => {
//       const title = idea.title || "";
//       const description = idea.description || "";
//       const category = idea.category || "";

//       return (
//         title.toLowerCase().includes(query) ||
//         description.toLowerCase().includes(query) ||
//         category.toLowerCase().includes(query)
//       );
//     });
//   }, [myIdeas, search]);

//   const totalUpvotes = myIdeas.reduce(
//     (total, idea) => total + (idea.upvotes?.length || 0),
//     0
//   );

//   const totalTeamMembers = myIdeas.reduce(
//     (total, idea) => total + (idea.teamMembers?.length || 0),
//     0
//   );

//   const logout = () => {
//     localStorage.removeItem("token");
//     navigate("/login");
//   };

//   if (loading) {
//     return (
//       <main className="dashboard-page">
//         <div className="dashboard-loading">
//           <div className="dashboard-spinner" />
//           <p>Preparing your founder dashboard...</p>
//         </div>
//       </main>
//     );
//   }

//   if (error) {
//     return (
//       <main className="dashboard-page">
//         <div className="dashboard-error">
//           <h2>Unable to load dashboard</h2>
//           <p>{error}</p>

//           <button
//             className="dashboard-button dashboard-button-primary"
//             onClick={loadDashboard}
//           >
//             <RefreshCw size={17} />
//             Try again
//           </button>

//           <button
//             className="dashboard-button dashboard-button-secondary"
//             onClick={logout}
//           >
//             <LogOut size={17} />
//             Log out
//           </button>
//         </div>
//       </main>
//     );
//   }

//   return (
//     <main className="dashboard-page">
//       <div className="dashboard-container">

//         {/* Welcome section */}
//         <section className="dashboard-welcome">
//           <div>
//             <span className="dashboard-eyebrow">
//               FOUNDER WORKSPACE
//             </span>

//             <h1>
//               Welcome back, {user?.name || "Founder"}!
//             </h1>

//             <p>
//               Turn your startup ideas into something real.
//               Here's an overview of your workspace.
//             </p>
//           </div>

//           <Link
//             to="/create-idea"
//             className="dashboard-button dashboard-button-primary"
//           >
//             <Plus size={19} />
//             Create an idea
//           </Link>
//         </section>

//         {/* Statistics */}
//         <section className="dashboard-stats">
//           <article className="dashboard-stat-card">
//             <div className="dashboard-stat-icon orange">
//               <Lightbulb size={22} />
//             </div>

//             <div>
//               <p>Total ideas</p>
//               <h2>{myIdeas.length}</h2>
//               <span>Your published ideas</span>
//             </div>
//           </article>

//           <article className="dashboard-stat-card">
//             <div className="dashboard-stat-icon purple">
//               <TrendingUp size={22} />
//             </div>

//             <div>
//               <p>Total upvotes</p>
//               <h2>{totalUpvotes}</h2>
//               <span>Across your ideas</span>
//             </div>
//           </article>

//           <article className="dashboard-stat-card">
//             <div className="dashboard-stat-icon green">
//               <Users size={22} />
//             </div>

//             <div>
//               <p>Team members</p>
//               <h2>{totalTeamMembers}</h2>
//               <span>Across your ideas</span>
//             </div>
//           </article>
//         </section>

//         {/* Quick actions */}
//         <section className="dashboard-section">
//           <div className="dashboard-section-heading">
//             <div>
//               <h2>Quick actions</h2>
//               <p>Pick up where you left off.</p>
//             </div>
//           </div>

//           <div className="dashboard-action-grid">
//             <Link
//               to="/create-idea"
//               className="dashboard-action-card"
//             >
//               <div className="dashboard-action-icon orange">
//                 <Plus size={22} />
//               </div>

//               <div>
//                 <h3>Post a new idea</h3>
//                 <p>Share your next startup concept.</p>
//               </div>

//               <ArrowRight size={18} className="action-arrow" />
//             </Link>

//             <Link
//               to="/ideas"
//               className="dashboard-action-card"
//             >
//               <div className="dashboard-action-icon purple">
//                 <Search size={22} />
//               </div>

//               <div>
//                 <h3>Explore the community</h3>
//                 <p>Discover other startup ideas.</p>
//               </div>

//               <ArrowRight size={18} className="action-arrow" />
//             </Link>

//             <Link
//               to="/profile"
//               className="dashboard-action-card"
//             >
//               <div className="dashboard-action-icon green">
//                 <Users size={22} />
//               </div>

//               <div>
//                 <h3>View your profile</h3>
//                 <p>Check your account information.</p>
//               </div>

//               <ArrowRight size={18} className="action-arrow" />
//             </Link>
//           </div>
//         </section>

//         {/* My ideas */}
//         <section className="dashboard-section">
//           <div className="dashboard-section-heading dashboard-ideas-heading">
//             <div>
//               <h2>My ideas</h2>
//               <p>
//                 Manage and keep track of your startup concepts.
//               </p>
//             </div>

//             <Link to="/ideas" className="dashboard-text-link">
//               Explore all ideas <ArrowRight size={16} />
//             </Link>
//           </div>

//           <div className="dashboard-search">
//             <Search size={18} />

//             <input
//               type="search"
//               placeholder="Search your ideas..."
//               value={search}
//               onChange={(event) => setSearch(event.target.value)}
//             />
//           </div>

//           {filteredIdeas.length === 0 ? (
//             <div className="dashboard-empty">
//               <div className="dashboard-empty-icon">
//                 <FolderOpen size={30} />
//               </div>

//               <h3>
//                 {myIdeas.length === 0
//                   ? "Your workspace is ready"
//                   : "No matching ideas"}
//               </h3>

//               <p>
//                 {myIdeas.length === 0
//                   ? "Create your first startup idea and start building your vision."
//                   : "Try another search term."}
//               </p>

//               {myIdeas.length === 0 && (
//                 <Link
//                   to="/create-idea"
//                   className="dashboard-button dashboard-button-primary"
//                 >
//                   <Plus size={18} />
//                   Create your first idea
//                 </Link>
//               )}
//             </div>
//           ) : (
//             <div className="dashboard-idea-grid">
//               {filteredIdeas.map((idea) => (
//                 <article
//                   className="dashboard-idea-card"
//                   key={idea._id}
//                 >
//                   <div className="dashboard-idea-top">
//                     <span className="dashboard-category">
//                       {idea.category || "Other"}
//                     </span>

//                     <span className="dashboard-stage">
//                       {idea.stage || "Idea"}
//                     </span>
//                   </div>

//                   <h3>{idea.title}</h3>

//                   <p className="dashboard-idea-description">
//                     {idea.description}
//                   </p>

//                   {idea.requiredSkills?.length > 0 && (
//                     <div className="dashboard-tags">
//                       {idea.requiredSkills
//                         .slice(0, 3)
//                         .map((skill, index) => (
//                           <span key={`${skill}-${index}`}>
//                             {skill}
//                           </span>
//                         ))}
//                     </div>
//                   )}

//                   <div className="dashboard-idea-meta">
//                     <span>
//                       <TrendingUp size={15} />
//                       {idea.upvotes?.length || 0} upvotes
//                     </span>

//                     <span>
//                       <Users size={15} />
//                       {idea.teamMembers?.length || 0} members
//                     </span>
//                   </div>

//                   <div className="dashboard-idea-footer">
//                     <span>
//                       {idea.createdAt
//                         ? new Date(idea.createdAt).toLocaleDateString()
//                         : "Recently created"}
//                     </span>

//                     <Link
//                       to={`/ideas/${idea._id}`}
//                       className="dashboard-view-link"
//                     >
//                       View idea <ArrowRight size={15} />
//                     </Link>
//                   </div>
//                 </article>
//               ))}
//             </div>
//           )}
//         </section>

//         {/* Founder checklist */}
//         <section className="dashboard-next-steps">
//           <div className="next-steps-icon">
//             <Rocket size={24} />
//           </div>

//           <div className="next-steps-content">
//             <h2>Your founder checklist</h2>
//             <p>
//               Small steps can move your idea closer to reality.
//             </p>

//             <ul>
//               <li>
//                 <CircleCheck size={17} />
//                 Write a clear problem statement and solution.
//               </li>
//               <li>
//                 <CircleCheck size={17} />
//                 Add the skills needed to build your idea.
//               </li>
//               <li>
//                 <CircleCheck size={17} />
//                 Share your idea and invite feedback.
//               </li>
//             </ul>
//           </div>
//         </section>

//       </div>
//     </main>
//   );
// };

// export default FounderDashboard;


import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Lightbulb,
  PlusCircle,
  FolderOpen,
  Users,
  ArrowRight,
  RefreshCw
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

const API_URL = "http://localhost:5000/api";

const FounderDashboard = () => {
  const { user } = useAuth();

  const [ideas, setIdeas] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadIdeas = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      const [response, requestsResponse] = await Promise.all([
        fetch(`${API_URL}/ideas`, { headers }),
        fetch(`${API_URL}/collaborations/my-requests`, { headers })
      ]);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load ideas.");
      }

      const allIdeas = Array.isArray(data.ideas)
        ? data.ideas
        : Array.isArray(data)
          ? data
          : [];

      const myIdeas = allIdeas.filter((idea) => {
        const authorId =
          typeof idea.author === "object"
            ? idea.author?._id || idea.author?.id
            : idea.author;

        return authorId?.toString() === user?.id?.toString()
          || authorId?.toString() === user?._id?.toString();
      });

      setIdeas(myIdeas);
      const requestData = await requestsResponse.json();
      if (requestsResponse.ok) setRequests(requestData.requests || []);
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadIdeas();
  }, [loadIdeas]);

  const recruitingIdeas = ideas.filter(
    (idea) =>
      ["idea", "planning", "development", "prototype"].includes(
        String(idea.stage || "").toLowerCase()
      )
  ).length;

  return (
    <main className="dashboard-page">
      <div className="dashboard-container">
        <section className="dashboard-welcome">
          <div>
            <p className="dashboard-eyebrow">FOUNDER WORKSPACE</p>

            <h1>
              Welcome, {user?.name || "Founder"}!
            </h1>

            <p>
              Manage your startup ideas and discover people
              who can help bring them to life.
            </p>
          </div>

          <Link to="/create-idea" className="btn btn-primary">
            <PlusCircle size={18} />
            Post New Idea
          </Link>
        </section>

        <section className="dashboard-stats">
          <article className="dashboard-stat-card">
            <div className="dashboard-stat-icon">
              <Lightbulb size={22} />
            </div>

            <div>
              <p>Total Ideas</p>
              <h2>{loading ? "—" : ideas.length}</h2>
            </div>
          </article>

          <article className="dashboard-stat-card">
            <div className="dashboard-stat-icon">
              <FolderOpen size={22} />
            </div>

            <div>
              <p>Ideas in Progress</p>
              <h2>{loading ? "—" : recruitingIdeas}</h2>
            </div>
          </article>

          <article className="dashboard-stat-card">
            <div className="dashboard-stat-icon">
              <Users size={22} />
            </div>

            <div>
              <p>Explore Community</p>
              <h2>
                <Link to="/ideas" className="dashboard-stat-link">
                  Browse
                </Link>
              </h2>
            </div>
          </article>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-header">
            <div>
              <h2>Collaboration requests</h2>
              <p>{requests.filter((request) => request.status === "pending").length} requests are waiting for your response.</p>
            </div>
          </div>
          {requests.filter((request) => request.status === "pending").length === 0 ? (
            <div className="dashboard-empty">New requests will appear here when people want to join your ideas.</div>
          ) : (
            <div className="dashboard-ideas-grid">
              {requests.filter((request) => request.status === "pending").map((request) => (
                <article className="dashboard-idea-card" key={request._id}>
                  <span className="badge">Awaiting your response</span>
                  <h3>{request.idea?.title || "Startup idea"}</h3>
                  <p><strong>{request.collaborator?.name || "Collaborator"}</strong> · {request.role || "Collaborator"}</p>
                  <p className="dashboard-idea-description">{request.message}</p>
                  <Link to={`/ideas/${request.idea?._id}`} className="dashboard-card-link">
                    Review request <ArrowRight size={16} />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-header">
            <div>
              <h2>Your Ideas</h2>
              <p>View and manage the ideas you have posted.</p>
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={loadIdeas}
              disabled={loading}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="form-message" role="alert">
              {error}
            </div>
          )}

          {loading ? (
            <div className="dashboard-empty">
              Loading your ideas...
            </div>
          ) : error ? (
            <div className="dashboard-empty">
              Check that your backend is running, then try Refresh.
            </div>
          ) : ideas.length === 0 ? (
            <div className="dashboard-empty">
              <Lightbulb size={35} />

              <h3>Your startup journey starts here</h3>

              <p>
                You haven't posted any ideas yet. Share your first
                idea and start finding collaborators.
              </p>

              <Link to="/create-idea" className="btn btn-primary">
                <PlusCircle size={17} />
                Create Your First Idea
              </Link>
            </div>
          ) : (
            <div className="dashboard-ideas-grid">
              {ideas.map((idea) => (
                <article className="dashboard-idea-card" key={idea._id}>
                  <div className="dashboard-idea-badges">
                    <span className="badge">
                      {idea.category}
                    </span>

                    <span className="badge badge-stage">
                      {idea.stage}
                    </span>
                  </div>

                  <h3>{idea.title}</h3>

                  <p className="dashboard-idea-description">
                    {idea.description}
                  </p>

                  <div className="dashboard-idea-meta">
                    <span>
                      <Users size={15} />
                      Team size: {idea.teamSize}
                    </span>
                  </div>

                  {Array.isArray(idea.requiredSkills) &&
                    idea.requiredSkills.length > 0 && (
                      <div className="dashboard-skills">
                        {idea.requiredSkills.slice(0, 4).map((skill) => (
                          <span key={skill} className="skill-tag">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                  <Link
                    to={`/ideas/${idea._id}`}
                    className="dashboard-card-link"
                  >
                    View and Manage
                    <ArrowRight size={16} />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-bottom-link">
          <div>
            <h3>Discover other startup ideas</h3>
            <p>
              Explore the community to learn from other founders
              and find potential collaborators.
            </p>
          </div>

          <Link to="/ideas" className="btn btn-secondary">
            Explore Ideas
            <ArrowRight size={16} />
          </Link>
        </section>
      </div>
    </main>
  );
};

export default FounderDashboard;

