import React from "react";

const getAvatarColor = (name = "") => {
  const colors = [
    "linear-gradient(135deg, #f36b21, #ff8d4b)",
    "linear-gradient(135deg, #2563eb, #3b82f6)",
    "linear-gradient(135deg, #059669, #10b981)",
    "linear-gradient(135deg, #7c3aed, #8b5cf6)",
    "linear-gradient(135deg, #db2777, #ec4899)",
    "linear-gradient(135deg, #d97706, #f59e0b)"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const UserAvatar = ({ user, size = "md", className = "" }) => {
  const name = user?.name || "User";
  const initial = name.charAt(0).toUpperCase();
  const avatarUrl = user?.avatar;

  const sizeClasses = {
    sm: "avatar-sm",
    md: "avatar-md",
    lg: "avatar-lg",
    xl: "avatar-xl"
  };

  const currentSizeClass = sizeClasses[size] || "avatar-md";

  if (avatarUrl && avatarUrl.trim() !== "") {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`user-avatar-img ${currentSizeClass} ${className}`}
        onError={(e) => {
          e.target.style.display = "none";
          const sibling = e.target.nextElementSibling;
          if (sibling) sibling.style.display = "grid";
        }}
      />
    );
  }

  return (
    <div
      className={`user-avatar-badge ${currentSizeClass} ${className}`}
      style={{ background: getAvatarColor(name) }}
    >
      {initial}
    </div>
  );
};

export default UserAvatar;
