import React from "react";
import { Link } from "react-router-dom";
import { X, Users } from "lucide-react";
import UserAvatar from "./UserAvatar";

const FollowersModal = ({ title, list = [], onClose }) => {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <Users size={18} /> {title} ({list.length})
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {list.length === 0 ? (
            <p className="modal-empty-text">No users found.</p>
          ) : (
            <div className="modal-user-list">
              {list.map((u) => {
                const userId = typeof u === "object" ? u._id : u;
                const userName = typeof u === "object" ? u.name : "User";
                const userEmail = typeof u === "object" ? u.email : "";

                return (
                  <Link
                    key={userId}
                    to={`/users/${userId}`}
                    className="modal-user-item"
                    onClick={onClose}
                  >
                    <UserAvatar user={typeof u === "object" ? u : { name: userName }} size="sm" />
                    <div className="modal-user-info">
                      <span className="modal-user-name">{userName}</span>
                      {userEmail && <span className="modal-user-email">{userEmail}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowersModal;
