
// import { useEffect, useMemo, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   Search,
//   Lightbulb,
//   Users,
//   ArrowRight,
//   RefreshCw,
//   Compass,
//   TrendingUp,
//   Sparkles,
//   LogOut
// } from "lucide-react";

// import "./Dashboard.css";

// const API_URL = "http://localhost:5000/api";

// const CollaboratorDashboard = () => {
//   const navigate = useNavigate();

//   const [user, setUser] = useState(null);
//   const [ideas, setIdeas] = useState([]);
//   const [search, setSearch] = useState("");
//   const [category, setCategory] = useState("All");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

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

//       if (currentUser.role !== "collaborator") {
//         navigate("/founder/dashboard", { replace: true });
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

//   const categories = useMemo(() => {
//     const uniqueCategories = [
//       ...new Set(
//         ideas
//           .map((idea) => idea.category)
//           .filter(Boolean)
//       )
//     ];

//     return ["All", ...uniqueCategories.sort()];
//   }, [ideas]);

//   const filteredIdeas = useMemo(() => {
//     const query = search.trim().toLowerCase();

//     return ideas.filter((idea) => {
//       const matchesCategory =
//         category === "All" || idea.category === category;

//       const skills = Array.isArray(idea.requiredSkills)
//         ? idea.requiredSkills.join(" ")
//         : idea.requiredSkills || "";

//       const tags = Array.isArray(idea.tags)
//         ? idea.tags.join(" ")
//         : "";

//       const searchableText = [
//         idea.title || "",
//         idea.description || "",
//         idea.category || "",
//         idea.stage || "",
//         skills,
//         tags
//       ]
//         .join(" ")
//         .toLowerCase();

//       const matchesSearch =
//         query === "" || searchableText.includes(query);

//       return matchesCategory && matchesSearch;
//     });
//   }, [ideas, search, category]);

//   const totalUpvotes = ideas.reduce(
//     (total, idea) => total + (idea.upvotes?.length || 0),
//     0
//   );

//   const totalTeamMembers = ideas.reduce(
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
//           <p>Finding ideas for you...</p>
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
//         <section className="collaborator-hero">
//           <div className="collaborator-hero-content">
//             <span className="dashboard-eyebrow">
//               COLLABORATOR WORKSPACE
//             </span>

//             <h1>
//               Discover your next big opportunity,{" "}
//               {user?.name || "Collaborator"}.
//             </h1>

//             <p>
//               Find founders who share your interests, explore
//               startup ideas, and discover where your skills
//               could make a difference.
//             </p>

//             <a
//               href="#explore-ideas"
//               className="dashboard-button dashboard-button-light"
//             >
//               <Compass size={18} />
//               Explore ideas
//             </a>
//           </div>

//           <div className="collaborator-hero-art">
//             <div className="hero-art-circle">
//               <Lightbulb size={48} />
//             </div>
//             <Sparkles className="hero-art-sparkle sparkle-one" size={24} />
//             <Sparkles className="hero-art-sparkle sparkle-two" size={17} />
//           </div>
//         </section>

//         {/* Community overview */}
//         <section className="dashboard-stats">
//           <article className="dashboard-stat-card">
//             <div className="dashboard-stat-icon orange">
//               <Lightbulb size={22} />
//             </div>

//             <div>
//               <p>Ideas to explore</p>
//               <h2>{ideas.length}</h2>
//               <span>Across the community</span>
//             </div>
//           </article>

//           <article className="dashboard-stat-card">
//             <div className="dashboard-stat-icon purple">
//               <TrendingUp size={22} />
//             </div>

//             <div>
//               <p>Community upvotes</p>
//               <h2>{totalUpvotes}</h2>
//               <span>Across all ideas</span>
//             </div>
//           </article>

//           <article className="dashboard-stat-card">
//             <div className="dashboard-stat-icon green">
//               <Users size={22} />
//             </div>

//             <div>
//               <p>Team members</p>
//               <h2>{totalTeamMembers}</h2>
//               <span>Across listed ideas</span>
//             </div>
//           </article>
//         </section>

//         {/* Search and discovery */}
//         <section
//           className="dashboard-section"
//           id="explore-ideas"
//         >
//           <div className="dashboard-section-heading">
//             <div>
//               <h2>Explore startup ideas</h2>
//               <p>
//                 Search for problems worth solving and teams
//                 worth joining.
//               </p>
//             </div>
//           </div>

//           <div className="collaborator-filters">
//             <div className="dashboard-search">
//               <Search size={18} />

//               <input
//                 type="search"
//                 placeholder="Search ideas, skills, or technologies..."
//                 value={search}
//                 onChange={(event) => setSearch(event.target.value)}
//               />
//             </div>

//             <select
//               className="dashboard-category-select"
//               value={category}
//               onChange={(event) => setCategory(event.target.value)}
//               aria-label="Filter by category"
//             >
//               {categories.map((item) => (
//                 <option key={item} value={item}>
//                   {item === "All" ? "All categories" : item}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="dashboard-results-line">
//             <span>
//               <strong>{filteredIdeas.length}</strong>{" "}
//               {filteredIdeas.length === 1 ? "idea" : "ideas"} found
//             </span>

//             {(search || category !== "All") && (
//               <button
//                 type="button"
//                 className="dashboard-clear-filter"
//                 onClick={() => {
//                   setSearch("");
//                   setCategory("All");
//                 }}
//               >
//                 Clear filters
//               </button>
//             )}
//           </div>

//           {filteredIdeas.length === 0 ? (
//             <div className="dashboard-empty">
//               <div className="dashboard-empty-icon">
//                 <Search size={30} />
//               </div>

//               <h3>No ideas found</h3>

//               <p>
//                 Try another keyword or choose a different category.
//               </p>

//               <button
//                 type="button"
//                 className="dashboard-button dashboard-button-secondary"
//                 onClick={() => {
//                   setSearch("");
//                   setCategory("All");
//                 }}
//               >
//                 Reset filters
//               </button>
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
//                         .slice(0, 4)
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
//                     <span className="idea-author">
//                       By{" "}
//                       {typeof idea.author === "object"
//                         ? idea.author?.name || "Founder"
//                         : "Founder"}
//                     </span>

//                     <Link
//                       to={`/ideas/${idea._id}`}
//                       className="dashboard-view-link"
//                     >
//                       View details <ArrowRight size={15} />
//                     </Link>
//                   </div>
//                 </article>
//               ))}
//             </div>
//           )}
//         </section>

//         {/* Helpful next steps */}
//         <section className="dashboard-next-steps">
//           <div className="next-steps-icon">
//             <Users size={24} />
//           </div>

//           <div className="next-steps-content">
//             <h2>Make your skills count</h2>
//             <p>
//               Use these steps to find a meaningful collaboration.
//             </p>

//             <ul>
//               <li>
//                 <Search size={17} />
//                 Search for ideas using your skills and interests.
//               </li>
//               <li>
//                 <Lightbulb size={17} />
//                 Read the problem, solution, and project stage.
//               </li>
//               <li>
//                 <ArrowRight size={17} />
//                 Open an idea to review its details and available options.
//               </li>
//             </ul>
//           </div>
//         </section>

//       </div>
//     </main>
//   );
// };

// export default CollaboratorDashboard;


import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Lightbulb,
  Users,
  ArrowRight,
  RefreshCw
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";
import "./Dashboard.css";

const API_URL = `${API_BASE_URL}/api`;

const CollaboratorDashboard = () => {
  const { user } = useAuth();

  const [ideas, setIdeas] = useState([]);
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
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

      setIdeas(allIdeas);
      const requestData = await requestsResponse.json();
      if (requestsResponse.ok) setRequests(requestData.requests || []);
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIdeas();
  }, [loadIdeas]);

  const filteredIdeas = ideas.filter((idea) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    const searchableText = [
      idea.title,
      idea.description,
      idea.category,
      idea.stage,
      ...(Array.isArray(idea.requiredSkills) ? idea.requiredSkills : []),
      ...(Array.isArray(idea.tags) ? idea.tags : [])
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(query);
  });

  return (
    <main className="dashboard-page">
      <div className="dashboard-container">
        <section className="dashboard-welcome">
          <div>
            <p className="dashboard-eyebrow">
              COLLABORATOR WORKSPACE
            </p>

            <h1>
              Welcome, {user?.name || "Collaborator"}!
            </h1>

            <p>
              Discover exciting startup ideas, explore required
              skills, and find projects that match your interests.
            </p>
          </div>

          <Link to="/ideas" className="btn btn-primary">
            Explore All Ideas
            <ArrowRight size={18} />
          </Link>
        </section>

        <section className="dashboard-stats">
          <article className="dashboard-stat-card">
            <div className="dashboard-stat-icon">
              <Lightbulb size={22} />
            </div>

            <div>
              <p>Available Ideas</p>
              <h2>{loading ? "—" : ideas.length}</h2>
            </div>
          </article>

          <article className="dashboard-stat-card">
            <div className="dashboard-stat-icon">
              <Search size={22} />
            </div>

            <div>
              <p>Matching Ideas</p>
              <h2>{loading ? "—" : filteredIdeas.length}</h2>
            </div>
          </article>

          <article className="dashboard-stat-card">
            <div className="dashboard-stat-icon">
              <Users size={22} />
            </div>

            <div>
              <p>Your Role</p>
              <h2>Collaborator</h2>
            </div>
          </article>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-header">
            <div>
              <h2>Your collaboration requests</h2>
              <p>Check whether founders have responded to your requests.</p>
            </div>
          </div>
          {requests.length === 0 ? (
            <div className="dashboard-empty">When you request to join an idea, its status will appear here.</div>
          ) : (
            <div className="dashboard-ideas-grid">
              {requests.map((request) => (
                <article className="dashboard-idea-card" key={request._id}>
                  <span className="badge">{request.status}</span>
                  <h3>{request.idea?.title || "Startup idea"}</h3>
                  <p>Founder: {request.founder?.name || "Founder"}</p>
                  <p className="dashboard-idea-description">{request.status === "accepted" ? "You can now open the idea to chat with the founder." : request.status === "rejected" ? "The founder has declined this request." : "Waiting for the founder to review your request."}</p>
                  <Link to={`/ideas/${request.idea?._id}`} className="dashboard-card-link">View status <ArrowRight size={16} /></Link>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-header">
            <div>
              <h2>Discover Startup Ideas</h2>
              <p>
                Search by idea name, category, technology, or skill.
              </p>
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

          <div className="dashboard-search">
            <Search size={19} />

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Try React, AI, healthcare, education..."
              aria-label="Search startup ideas"
            />

            {search && (
              <button
                type="button"
                className="dashboard-clear-search"
                onClick={() => setSearch("")}
              >
                Clear
              </button>
            )}
          </div>

          {error && (
            <div className="form-message" role="alert">
              {error}
            </div>
          )}

          {loading ? (
            <div className="dashboard-empty">
              Discovering ideas...
            </div>
          ) : error ? (
            <div className="dashboard-empty">
              Check that your backend is running, then try Refresh.
            </div>
          ) : filteredIdeas.length === 0 ? (
            <div className="dashboard-empty">
              <Search size={35} />

              <h3>
                {search ? "No matching ideas found" : "No ideas available yet"}
              </h3>

              <p>
                {search
                  ? "Try another keyword or search for a different skill."
                  : "Check back later as founders share their startup ideas."}
              </p>

              {search && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSearch("")}
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="dashboard-ideas-grid">
              {filteredIdeas.map((idea) => (
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
                        <strong>Skills:</strong>

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
                    View Idea
                    <ArrowRight size={16} />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-bottom-link">
          <div>
            <h3>Found an interesting idea?</h3>
            <p>
              Open its details to learn more about the project and
              the skills the founder is looking for.
            </p>
          </div>

          <Link to="/ideas" className="btn btn-secondary">
            Browse All Ideas
          </Link>
        </section>
      </div>
    </main>
  );
};

export default CollaboratorDashboard;

