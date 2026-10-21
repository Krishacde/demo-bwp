import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  MapPin,
  Globe,
  FileText,
  Upload,
  ArrowLeft,
  Save,
  CheckCircle,
  Code
} from "lucide-react";
import UserAvatar from "../components/UserAvatar";
import { getAuthUser, updateProfile } from "../api/userApi";

const GithubIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const EditProfile = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    bio: "",
    skills: "",
    avatar: "",
    location: "",
    website: "",
    github: "",
    linkedin: ""
  });

  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setInitialLoading(true);
        const user = await getAuthUser();
        if (user) {
          setForm({
            name: user.name || "",
            bio: user.bio || "",
            skills: Array.isArray(user.skills) ? user.skills.join(", ") : "",
            avatar: user.avatar || "",
            location: user.location || "",
            website: user.website || "",
            github: user.github || "",
            linkedin: user.linkedin || ""
          });
        }
      } catch (err) {
        setError(err.message || "Failed to load user profile");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Avatar image size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        avatar: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }

    setSaving(true);

    try {
      const skillsArray = form.skills
        ? form.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      const payload = {
        name: form.name.trim(),
        bio: form.bio.trim(),
        skills: skillsArray,
        avatar: form.avatar.trim(),
        location: form.location.trim(),
        website: form.website.trim(),
        github: form.github.trim(),
        linkedin: form.linkedin.trim()
      };

      await updateProfile(payload);
      setSuccess("Profile updated successfully!");

      setTimeout(() => {
        navigate("/profile");
      }, 1000);
    } catch (err) {
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <main className="profile-page">
        <div className="profile-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading profile editor...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-container">
        <div className="profile-card">
          <div className="edit-header">
            <Link to="/profile" className="back-link">
              <ArrowLeft size={18} /> Back to Profile
            </Link>
            <h1>Edit Profile</h1>
            <p className="edit-subtitle">
              Update your public profile, skills, and links visible to co-founders and collaborators.
            </p>
          </div>

          {error && <div className="form-message form-message-error">{error}</div>}
          {success && (
            <div className="form-message form-message-success">
              <CheckCircle size={16} /> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="edit-form">
            {/* AVATAR PREVIEW & UPLOAD */}
            <div className="avatar-edit-section">
              <UserAvatar user={{ name: form.name, avatar: form.avatar }} size="xl" />
              <div className="avatar-input-group">
                <label className="form-label">Profile Avatar</label>
                <div className="avatar-actions">
                  <input
                    type="url"
                    name="avatar"
                    className="form-input"
                    placeholder="Paste image URL (e.g. https://...)"
                    value={form.avatar}
                    onChange={handleChange}
                  />
                  <label className="btn btn-secondary btn-upload">
                    <Upload size={16} /> Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
                <small className="form-hint">
                  Enter an image link or upload a local image (max 2MB).
                </small>
              </div>
            </div>

            {/* NAME & LOCATION */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">
                  <User size={15} /> Full Name <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <MapPin size={15} /> Location
                </label>
                <input
                  type="text"
                  name="location"
                  className="form-input"
                  placeholder="e.g. Mumbai, India or Remote"
                  value={form.location}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* BIO */}
            <div className="form-group">
              <label className="form-label">
                <FileText size={15} /> Bio
              </label>
              <textarea
                name="bio"
                className="form-input form-textarea"
                rows={4}
                placeholder="Tell co-founders about yourself, your startup goals, and background..."
                value={form.bio}
                onChange={handleChange}
              />
            </div>

            {/* SKILLS */}
            <div className="form-group">
              <label className="form-label">
                <Code size={15} /> Skills (comma-separated)
              </label>
              <input
                type="text"
                name="skills"
                className="form-input"
                placeholder="e.g. React, Node.js, Python, Product Design, Marketing"
                value={form.skills}
                onChange={handleChange}
              />
              <small className="form-hint">Separate skills with commas.</small>
            </div>

            {/* WEBSITE & SOCIAL LINKS */}
            <div className="form-section-title">Web & Social Links</div>

            <div className="form-group">
              <label className="form-label">
                <Globe size={15} /> Personal / Portfolio Website
              </label>
              <input
                type="url"
                name="website"
                className="form-input"
                placeholder="https://yourwebsite.com"
                value={form.website}
                onChange={handleChange}
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">
                  <GithubIcon size={15} /> GitHub Profile / Username
                </label>
                <input
                  type="text"
                  name="github"
                  className="form-input"
                  placeholder="e.g. octocat or https://github.com/octocat"
                  value={form.github}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <LinkedinIcon size={15} /> LinkedIn Profile / Username
                </label>
                <input
                  type="text"
                  name="linkedin"
                  className="form-input"
                  placeholder="e.g. username or https://linkedin.com/in/username"
                  value={form.linkedin}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* SUBMIT ACTIONS */}
            <div className="form-actions-row">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? (
                  <>
                    <div className="spinner-sm"></div> Saving profile...
                  </>
                ) : (
                  <>
                    <Save size={16} /> Save Changes
                  </>
                )}
              </button>

              <Link to="/profile" className="btn btn-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default EditProfile;
