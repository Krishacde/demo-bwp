import { useEffect, useState, useCallback } from "react";
import { Search, Filter, Users as UsersIcon, X, Sparkles } from "lucide-react";
import UserCard from "../components/UserCard";
import SkillTag from "../components/SkillTag";
import { getUsers, getAuthUser } from "../api/userApi";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Popular skills list for quick filtering
  const [allSkills, setAllSkills] = useState([]);

  // Fetch current user ID if logged in
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const user = await getAuthUser();
        if (user) {
          setCurrentUserId(user._id || user.id);
        }
      } catch (err) {
        // Guest user
        setCurrentUserId(null);
      }
    };
    fetchMe();
  }, []);

  const fetchUsersData = useCallback(async (search, skill) => {
    try {
      setLoading(true);
      setError("");
      const data = await getUsers(search, skill);
      setUsers(data);

      // Extract skills for filter pills
      const skillsSet = new Set();
      data.forEach((u) => {
        if (Array.isArray(u.skills)) {
          u.skills.forEach((s) => skillsSet.add(s.trim()));
        }
      });
      setAllSkills(Array.from(skillsSet).slice(0, 10));
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsersData(searchTerm, selectedSkill);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedSkill, fetchUsersData]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsersData(searchTerm, selectedSkill);
  };

  const handleSkillSelect = (skill) => {
    if (selectedSkill === skill) {
      setSelectedSkill("");
    } else {
      setSelectedSkill(skill);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSkill("");
  };

  return (
    <main className="users-page">
      <div className="users-container">
        {/* PAGE HERO / HEADER */}
        <div className="users-header">
          <div className="users-badge">
            <Sparkles size={14} /> Community Discovery
          </div>
          <h1>Find Collaborators & Innovators</h1>
          <p>
            Explore profiles, discover talented builders, filter by skills, and connect with potential project partners.
          </p>

          {/* SEARCH & FILTERS BAR */}
          <form className="search-bar-wrapper" onSubmit={handleSearchSubmit}>
            <div className="search-input-container">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                className="search-input"
                placeholder="Search users by name, bio, location or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchTerm("")}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <button type="submit" className="btn btn-primary search-btn">
              Search
            </button>
          </form>

          {/* SKILL FILTER PILLS */}
          {allSkills.length > 0 && (
            <div className="skill-filters-row">
              <span className="filter-label">
                <Filter size={14} /> Filter by skill:
              </span>
              <div className="skill-pills">
                {allSkills.map((skill, idx) => (
                  <SkillTag
                    key={idx}
                    skill={skill}
                    active={selectedSkill === skill}
                    onClick={() => handleSkillSelect(skill)}
                  />
                ))}
              </div>

              {(selectedSkill || searchTerm) && (
                <button className="btn-clear-filters" onClick={clearFilters}>
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* CONTENT STATES */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Searching for innovators...</p>
          </div>
        ) : error ? (
          <div className="form-message form-message-error">{error}</div>
        ) : users.length === 0 ? (
          <div className="empty-users-card">
            <div className="empty-icon">
              <UsersIcon size={32} />
            </div>
            <h3>No users found</h3>
            <p>
              {searchTerm || selectedSkill
                ? "No builders match your search criteria. Try clearing filters or searching for something else."
                : "No registered users in the community yet."}
            </p>
            {(searchTerm || selectedSkill) && (
              <button className="btn btn-secondary" onClick={clearFilters}>
                Reset Search
              </button>
            )}
          </div>
        ) : (
          <div className="users-grid">
            {users.map((user) => (
              <UserCard
                key={user._id || user.id}
                user={user}
                currentUserId={currentUserId}
                onSkillClick={handleSkillSelect}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Users;
