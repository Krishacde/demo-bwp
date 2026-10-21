import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", headline: "", bio: "", skills: "" });

  useEffect(() => {
    const getProfile = async () => {
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

    getProfile();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

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
      <main className="auth-page">
        <div className="auth-card">
          <div className="form-message">
            {error}
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="auth-page">
        <p>Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="profile-page">

      <div className="profile-container">

        <div className="profile-card">

          <div className="profile-header">

            <div className="profile-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h1>{user.name}</h1>

              <p>
                {user.headline || `VicharManthan ${user.role}`}
              </p>
            </div>

          </div>


          <div className="profile-info">

            <div className="info-box">
              <small>Name</small>
              <strong>{user.name}</strong>
            </div>

            {user.bio && <div className="info-box"><small>About</small><strong>{user.bio}</strong></div>}
            {user.skills?.length > 0 && <div className="info-box"><small>Skills</small><strong>{user.skills.join(" · ")}</strong></div>}

            <div className="info-box">
              <small>Email</small>
              <strong>{user.email}</strong>
            </div>

            <div className="info-box">
              <small>Account ID</small>
              <strong>{user._id}</strong>
            </div>

            <div className="info-box">
              <small>Account Created</small>
              <strong>
                {new Date(
                  user.createdAt
                ).toLocaleDateString()}
              </strong>
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


          <button
            className="btn btn-danger"
            onClick={logout}
          >
            <LogOut size={17} />
            Logout
          </button>

        </div>

      </div>

    </main>
  );
};

export default Profile;
