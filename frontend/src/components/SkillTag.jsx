import React from "react";

const SkillTag = ({ skill, onClick, active = false }) => {
  if (!skill) return null;

  return (
    <span
      className={`skill-tag ${active ? "skill-tag-active" : ""}`}
      onClick={onClick ? () => onClick(skill) : undefined}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      #{skill}
    </span>
  );
};

export default SkillTag;
