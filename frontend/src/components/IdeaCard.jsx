import { Link } from "react-router-dom";
import { Calendar, MessageCircle, User, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const IdeaCard = ({ idea }) => {
  const { user } = useAuth();
  const authorId = idea.author?._id || idea.author;
  const isAuthor = authorId && String(authorId) === String(user?._id || user?.id);

  return (
    <article className="idea-card">
      <div className="idea-badges">
        <span className="badge">
          {idea.category}
        </span>

        <span className="badge badge-stage">
          {idea.stage}
        </span>
      </div>

      <Link to={`/ideas/${idea._id}`} className="idea-card-title"><h3>{idea.title}</h3></Link>

      <p>{idea.description}</p>

      {idea.requiredSkills?.length > 0 && (
        <div className="idea-skills">
          {idea.requiredSkills.map((skill) => (
            <span key={skill} className="skill-tag">
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="idea-card-footer">
        <span>
          <User size={14} />
          {idea.author?.name || "Founder"}
        </span>

        <span>
          <Users size={14} />
          {idea.teamSize}
        </span>

        <span>
          <Calendar size={14} />
          {new Date(idea.createdAt).toLocaleDateString()}
        </span>
      </div>
      <div className="idea-card-actions">
        <Link to={`/ideas/${idea._id}`} className="btn btn-secondary">View idea</Link>
        {user && !isAuthor && authorId && (
          <Link to={`/messages?user=${authorId}`} className="btn btn-primary">
            <MessageCircle size={15} /> Message founder
          </Link>
        )}
      </div>
    </article>
  );
};

export default IdeaCard;
