import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, UserPlus, UserCheck, ArrowRight } from "lucide-react";
import UserAvatar from "./UserAvatar";
import SkillTag from "./SkillTag";
import { followUser, unfollowUser } from "../api/userApi";

const UserCard = ({ user, currentUserId, onSkillClick }) => {
  const [followers, setFollowers] = useState(user.followers || []);
  const [following, setFollowing] = useState(user.following || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isOwnCard = currentUserId && (currentUserId === user._id || currentUserId === user.id);

  const isFollowing = currentUserId
    ? followers.some((f) => (typeof f === "object" ? f._id === currentUserId : f === currentUserId))
    : false;

  const handleFollowToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUserId) {
      window.location.href = "/login";
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isFollowing) {
        const updatedUser = await unfollowUser(user._id);
        setFollowers(updatedUser.followers || []);
        setFollowing(updatedUser.following || []);
      } else {
        const updatedUser = await followUser(user._id);
        setFollowers(updatedUser.followers || []);
        setFollowing(updatedUser.following || []);
      }
    } catch (err) {
      setError(err.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-card">
      <div className="user-card-header">
        <UserAvatar user={user} size="lg" />
        <div className="user-card-meta">
          <Link to={`/users/${user._id}`} className="user-card-name">
            {user.name}
          </Link>

          {user.location && (
            <span className="user-card-location">
              <MapPin size={13} /> {user.location}
            </span>
          )}
        </div>
      </div>

      <p className="user-card-bio">
        {user.bio ? (
          user.bio.length > 110 ? `${user.bio.substring(0, 110)}...` : user.bio
        ) : (
          <em style={{ opacity: 0.6 }}>No bio provided.</em>
        )}
      </p>

      {user.skills && user.skills.length > 0 && (
        <div className="user-card-skills">
          {user.skills.slice(0, 5).map((skill, idx) => (
            <SkillTag key={idx} skill={skill} onClick={onSkillClick} />
          ))}
          {user.skills.length > 5 && (
            <span className="skills-more-badge">+{user.skills.length - 5} more</span>
          )}
        </div>
      )}

      <div className="user-card-footer">
        <div className="user-card-stats">
          <span><strong>{followers.length}</strong> Followers</span>
          <span>•</span>
          <span><strong>{following.length}</strong> Following</span>
        </div>

        <div className="user-card-actions">
          {!isOwnCard && currentUserId && (
            <button
              className={`btn btn-sm ${isFollowing ? "btn-secondary" : "btn-primary"}`}
              onClick={handleFollowToggle}
              disabled={loading}
            >
              {isFollowing ? (
                <>
                  <UserCheck size={14} /> Following
                </>
              ) : (
                <>
                  <UserPlus size={14} /> Follow
                </>
              )}
            </button>
          )}

          <Link to={`/users/${user._id}`} className="btn btn-secondary btn-sm">
            View Profile <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {error && <div className="user-card-error">{error}</div>}
    </div>
  );
};

export default UserCard;
