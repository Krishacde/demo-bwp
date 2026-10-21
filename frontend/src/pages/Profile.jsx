import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", headline: "", bio: "", skills: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          localStorage.removeItem("token");

          setError(data.message);

          setTimeout(() => {
            navigate("/login");
          }, 1200);

          return;
        }

        setUser(data.user);
        setProfileForm({
          name: data.user.name || "",
          headline: data.user.headline || "",
          bio: data.user.bio || "",
          skills: (data.user.skills || []).join(", ")
        });

      } catch {
        setError(
          "Unable to connect to the server"
        );
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    try {
      const response = await fetch("http://localhost:5000/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ ...profileForm, skills: profileForm.skills.split(",").map((skill) => skill.trim()).filter(Boolean) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not save your profile.");
      setUser(data.user);
      setNotice("Profile saved.");
    } catch (saveError) { setNotice(saveError.message); }
    finally { setSaving(false); }
  };

  if (error) {
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

              <p>
                {user.headline || `VicharManthan ${user.role}`}
              </p>
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

            {user.bio && <div className="info-box"><small>About</small><strong>{user.bio}</strong></div>}
            {user.skills?.length > 0 && <div className="info-box"><small>Skills</small><strong>{user.skills.join(" · ")}</strong></div>}

            <div className="info-box">
              <small>Email</small>
              <strong>{user.email}</strong>
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

          <form className="profile-edit-form" onSubmit={saveProfile}>
            <h2>Edit your profile</h2>
            {notice && <p role="status">{notice}</p>}
            <label className="form-label" htmlFor="profile-name">Name</label>
            <input id="profile-name" className="form-input" value={profileForm.name} onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })} required maxLength={80} />
            <label className="form-label" htmlFor="profile-headline">Headline</label>
            <input id="profile-headline" className="form-input" placeholder="Founder building in climate tech" value={profileForm.headline} onChange={(event) => setProfileForm({ ...profileForm, headline: event.target.value })} maxLength={100} />
            <label className="form-label" htmlFor="profile-bio">About you</label>
            <textarea id="profile-bio" className="form-input" placeholder="What are you interested in building?" value={profileForm.bio} onChange={(event) => setProfileForm({ ...profileForm, bio: event.target.value })} maxLength={1000} />
            <label className="form-label" htmlFor="profile-skills">Skills</label>
            <input id="profile-skills" className="form-input" placeholder="React, product design, research" value={profileForm.skills} onChange={(event) => setProfileForm({ ...profileForm, skills: event.target.value })} />
            <small>Separate skills with commas.</small>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? "Saving..." : "Save profile"}</button>
          </form>


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
