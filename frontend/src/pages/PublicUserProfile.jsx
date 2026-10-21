import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MessageCircle, UserRound } from "lucide-react";

const PublicUserProfile = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/auth/users/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Could not load this profile.");
        setProfile(data.user);
      } catch (loadError) { setError(loadError.message); }
    };
    loadProfile();
  }, [userId]);

  if (error) return <main className="profile-page"><div className="profile-container"><p className="form-message">{error}</p><Link to="/messages">Back to messages</Link></div></main>;
  if (!profile) return <main className="profile-page"><div className="profile-container">Loading profile...</div></main>;

  return (
    <main className="profile-page">
      <div className="profile-container">
        <Link to="/messages" className="back-link"><ArrowLeft size={16} /> Back to messages</Link>
        <section className="profile-card public-profile-card">
          <header className="profile-header">
            <div className="profile-avatar"><UserRound size={30} /></div>
            <div><h1>{profile.name}</h1><p>{profile.headline || `VicharManthan ${profile.role}`}</p></div>
          </header>
          <div className="profile-info">
            <div className="info-box"><small>Role</small><strong>{profile.role}</strong></div>
            <div className="info-box"><small>Member since</small><strong>{new Date(profile.createdAt).toLocaleDateString()}</strong></div>
            {profile.bio && <div className="info-box public-profile-about"><small>About</small><strong>{profile.bio}</strong></div>}
            {profile.skills?.length > 0 && <div className="info-box public-profile-about"><small>Skills</small><strong>{profile.skills.join(" · ")}</strong></div>}
          </div>
          <Link className="btn btn-primary" to={`/messages?user=${profile._id}`}><MessageCircle size={17} /> Message {profile.name}</Link>
        </section>
      </div>
    </main>
  );
};

export default PublicUserProfile;
