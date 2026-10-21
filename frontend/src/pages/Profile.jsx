import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LogOut,
  Edit,
  MapPin,
  Globe,
  Users,
  Lightbulb,
  Sparkles,
  Calendar
} from "lucide-react";
import UserAvatar from "../components/UserAvatar";
import SkillTag from "../components/SkillTag";
import FollowersModal from "../components/FollowersModal";
import { getAuthUser } from "../api/userApi";

const GithubIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalType, setModalType] = useState(null); // 'followers' | 'following' | null

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const userData = await getAuthUser();
        setUser(userData);
      } catch (err) {
        setError(err.message || "Failed to load profile");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your profile...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="profile-page">
        <div className="profile-container">
          <div className="form-message">{error}</div>
        </div>
      </main>
    );
  }

  if (!user) return null;

  const followersList = user.followers || [];
  const followingList = user.following || [];

  return (
    <main className="profile-page">
      <div className="profile-container">
        {/* PROFILE CARD */}
        <div className="profile-card">
          <div className="profile-header-wrapper">
            <div className="profile-header-left">
              <UserAvatar user={user} size="xl" />

              <div className="profile-header-info">
                <div className="profile-title-badge">
                  <h1>{user.name}</h1>
                  <span className="badge-role">
                    <Sparkles size={13} /> Innovator
                  </span>
                </div>

                <p className="profile-email">{user.email}</p>

                {user.location && (
                  <div className="profile-meta-item">
                    <MapPin size={15} /> {user.location}
                  </div>
                )}
              </div>
            </div>

            <div className="profile-header-actions">
              <Link to="/profile/edit" className="btn btn-primary">
                <Edit size={16} /> Edit Profile
              </Link>

              <button className="btn btn-secondary btn-danger-soft" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>

          {/* BIO */}
          <div className="profile-section">
            <h3 className="section-subtitle">About Me</h3>
            <p className="profile-bio">
              {user.bio ? (
                user.bio
              ) : (
                <span className="text-muted-italic">
                  No bio added yet. Click "Edit Profile" to share your background and vision!
                </span>
              )}
            </p>
          </div>

          {/* SKILLS */}
          <div className="profile-section">
            <h3 className="section-subtitle">Skills & Expertise</h3>
            {user.skills && user.skills.length > 0 ? (
              <div className="skills-grid">
                {user.skills.map((skill, idx) => (
                  <SkillTag key={idx} skill={skill} />
                ))}
              </div>
            ) : (
              <p className="text-muted-italic">No skills listed yet.</p>
            )}
          </div>

          {/* SOCIAL & WEBSITE LINKS */}
          {(user.website || user.github || user.linkedin) && (
            <div className="profile-section">
              <h3 className="section-subtitle">Links & Presence</h3>
              <div className="links-row">
                {user.website && (
                  <a
                    href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link-btn"
                  >
                    <Globe size={16} /> {user.website.replace(/^https?:\/\//, "")}
                  </a>
                )}

                {user.github && (
                  <a
                    href={user.github.startsWith("http") ? user.github : `https://github.com/${user.github.replace(/^@/, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link-btn"
                  >
                    <GithubIcon size={16} /> GitHub
                  </a>
                )}

                {user.linkedin && (
                  <a
                    href={user.linkedin.startsWith("http") ? user.linkedin : `https://linkedin.com/in/${user.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link-btn"
                  >
                    <LinkedinIcon size={16} /> LinkedIn
                  </a>
                )}
              </div>
            </div>
          )}

          {/* STATS ROW */}
          <div className="profile-stats-grid">
            <div
              className="stat-card stat-card-interactive"
              onClick={() => setModalType("followers")}
              title="Click to view followers"
            >
              <div className="stat-icon">
                <Users size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{followersList.length}</span>
                <span className="stat-label">Followers</span>
              </div>
            </div>

            <div
              className="stat-card stat-card-interactive"
              onClick={() => setModalType("following")}
              title="Click to view following"
            >
              <div className="stat-icon">
                <Users size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{followingList.length}</span>
                <span className="stat-label">Following</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Calendar size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-value">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Member"}
                </span>
                <span className="stat-label">Joined</span>
              </div>
            </div>
          </div>

          {/* IDEAS SECTION */}
          <div className="profile-section profile-ideas-section">
            <div className="section-header-row">
              <h3 className="section-subtitle">
                <Lightbulb size={18} /> Ideas & Projects
              </h3>
            </div>

            <div className="ideas-empty-card">
              <div className="ideas-empty-icon">
                <Lightbulb size={28} />
              </div>
              <h4>No ideas published yet</h4>
              <p>
                Sharing startup ideas helps connect you with potential co-founders, advisors, and team members.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FOLLOWERS / FOLLOWING MODAL */}
      {modalType === "followers" && (
        <FollowersModal
          title="Followers"
          list={followersList}
          onClose={() => setModalType(null)}
        />
      )}

      {modalType === "following" && (
        <FollowersModal
          title="Following"
          list={followingList}
          onClose={() => setModalType(null)}
        />
      )}
    </main>
  );
};

export default Profile;