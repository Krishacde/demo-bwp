import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Pencil,
  Trash2,
  MessageCircle,
  User,
  Users
} from "lucide-react";

import "./Ideas.css";

const IdeaDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [idea, setIdea] = useState(null);
  const [userId, setUserId] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [requests, setRequests] = useState([]);
  const [requestText, setRequestText] = useState("");
  const [requestRole, setRequestRole] = useState("");
  const token = localStorage.getItem("token");

  const loadRequests = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch("http://localhost:5000/api/collaborations/my-requests", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setRequests((data.requests || []).filter((item) => item.idea?._id === id));
    } catch {
      setMessage("Could not load collaboration requests.");
    }
  }, [id, token]);

  useEffect(() => {
    const getIdea = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/ideas/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Could not load idea");
          return;
        }

        setIdea(data.idea);

      } catch {
        setError(
          "Unable to connect to the server"
        );
      }
    };

    // logged-in user, to show edit/delete to the author
    const getUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) return;

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

        if (response.ok) {
          setUserId(data.user._id);
        }

      } catch {
        setUserId("");
      }
    };

    getIdea();
    getUser();
    loadRequests();
  }, [id, loadRequests]);

  const currentRequest = requests.find((item) => item.collaborator?._id === userId);

  const submitRequest = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      const response = await fetch(`http://localhost:5000/api/collaborations/ideas/${id}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: requestText, role: requestRole })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not send request.");
      setRequestText("");
      setMessage("");
      await loadRequests();
    } catch (error) { setMessage(error.message); }
  };

  const respondToRequest = async (requestId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/collaborations/${requestId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not update request.");
      setMessage("");
      await loadRequests();
      if (status === "accepted") {
        const ideaResponse = await fetch(`http://localhost:5000/api/ideas/${id}`);
        const ideaData = await ideaResponse.json();
        if (ideaResponse.ok) setIdea(ideaData.idea);
      }
    } catch (error) { setMessage(error.message); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this idea?")) return;

    setMessage("");
    setDeleting(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/ideas/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Could not delete idea");
        return;
      }

      navigate("/ideas");

    } catch {
      setMessage(
        "Unable to connect to the server"
      );
    } finally {
      setDeleting(false);
    }
  };

  if (error) {
    return (
      <main className="ideas-page">
        <div className="ideas-container idea-details">
          <Link to="/ideas" className="back-link">
            <ArrowLeft size={16} />
            Back to ideas
          </Link>

          <div className="form-message">
            {error}
          </div>
        </div>
      </main>
    );
  }

  if (!idea) {
    return (
      <main className="ideas-page">
        <div className="ideas-status">
          Loading idea...
        </div>
      </main>
    );
  }

  const isAuthor = idea.author && idea.author._id === userId;

  return (
    <main className="ideas-page">

      <div className="ideas-container idea-details">

        <Link to="/ideas" className="back-link">
          <ArrowLeft size={16} />
          Back to ideas
        </Link>


        <div className="idea-details-card">

          <div className="idea-badges">
            <span className="badge">
              {idea.category}
            </span>

            <span className="badge badge-stage">
              {idea.stage}
            </span>
          </div>

          <h1>{idea.title}</h1>

          <div className="idea-meta">
            <span>
              <User size={15} />
              {idea.author ? <Link className="idea-author-link" to={`/profile/${idea.author._id}`}>{idea.author.name}</Link> : "Unknown"}
            </span>

            <span>
              <Users size={15} />
              Team of {idea.teamSize}
            </span>

            <span>
              <Calendar size={15} />
              {new Date(idea.createdAt).toLocaleDateString()}
            </span>
          </div>

          {userId && !isAuthor && idea.author && (
            <Link className="btn btn-secondary idea-direct-message" to={`/messages?user=${idea.author._id}`}>
              <MessageCircle size={16} /> Message founder
            </Link>
          )}

          <p className="idea-description">
            {idea.description}
          </p>

          {idea.problem && <div className="idea-section"><h4>Problem</h4><p className="idea-description">{idea.problem}</p></div>}
          {idea.solution && <div className="idea-section"><h4>Proposed solution</h4><p className="idea-description">{idea.solution}</p></div>}
          {idea.lookingFor && <div className="idea-section"><h4>Who the team needs</h4><p className="idea-description">{idea.lookingFor}</p></div>}


          {idea.requiredSkills.length > 0 && (
            <div className="idea-section">
              <h4>Required Skills</h4>

              <div className="idea-skills">
                {idea.requiredSkills.map((skill) => (
                  <span key={skill} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}


          {idea.tags.length > 0 && (
            <div className="idea-section">
              <h4>Tags</h4>

              <div className="idea-skills">
                {idea.tags.map((tag) => (
                  <span key={tag} className="skill-tag">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {idea.teamMembers?.length > 0 && (
            <section className="idea-section idea-team-section">
              <h4>Connect with the team</h4>
              <div className="idea-team-list">
                {idea.teamMembers.map((member) => (
                  <article className="idea-team-member" key={member._id}>
                    <Link to={`/profile/${member._id}`} className="idea-team-name">{member.name}</Link>
                    <span>{member.headline || member.role}</span>
                    {userId && member._id !== userId && <Link to={`/messages?user=${member._id}`} className="idea-team-message"><MessageCircle size={14} /> Chat</Link>}
                  </article>
                ))}
              </div>
            </section>
          )}


          {message && (
            <div className="form-message">
              {message}
            </div>
          )}

          {userId && !isAuthor && !currentRequest && (
            <form className="idea-collaboration-form" onSubmit={submitRequest}>
              <h3>Work on this idea</h3>
              <p>Introduce yourself and tell the founder how you can contribute. Chat opens after approval.</p>
              <input className="form-input" value={requestRole} onChange={(event) => setRequestRole(event.target.value)} placeholder="Role you are interested in (optional)" maxLength={80} />
              <textarea className="form-input" value={requestText} onChange={(event) => setRequestText(event.target.value)} placeholder="Your introduction and relevant skills" required maxLength={2000} />
              <button className="btn btn-primary" type="submit">Request to collaborate</button>
            </form>
          )}

          {isAuthor && requests.length > 0 && (
            <section className="idea-collaboration-panel">
              <h3>Collaboration requests ({requests.filter((item) => item.status === "pending").length} awaiting response)</h3>
              {requests.map((request) => (
                <article className="idea-request-card" key={request._id}>
                  <p><strong>{request.collaborator?.name || "Collaborator"}</strong> · {request.role || "Collaborator"} · <span className={`request-status request-status-${request.status}`}>{request.status}</span></p>
                  <p>{request.message}</p>
                  {request.collaborator?._id && <Link className="idea-team-message" to={`/profile/${request.collaborator._id}`}>View profile</Link>}
                  {request.status === "pending" && (
                    <div className="idea-actions">
                      <button className="btn btn-primary" onClick={() => respondToRequest(request._id, "accepted")}>Accept request</button>
                      <button className="btn btn-secondary" onClick={() => respondToRequest(request._id, "rejected")}>Decline</button>
                    </div>
                  )}
                  {request.status === "accepted" && (
                    <Link className="btn btn-primary idea-open-messages" to={`/messages?user=${request.collaborator?._id}`}><MessageCircle size={15} /> Message collaborator</Link>
                  )}
                </article>
              ))}
            </section>
          )}

          {currentRequest && !isAuthor && (
            <section className="idea-collaboration-panel">
              <h3>Your collaboration request</h3>
              <p><strong>Status:</strong> <span className={`request-status request-status-${currentRequest.status}`}>{currentRequest.status}</span></p>
              <p><strong>Role:</strong> {currentRequest.role || "Collaborator"}</p>
              <p>{currentRequest.message}</p>
              {currentRequest.status === "pending" && <p className="idea-next-step">The founder is reviewing your request. You can still message them directly from this page.</p>}
              {currentRequest.status === "accepted" && <p className="idea-next-step">You’re part of this team. Continue the conversation in Messages.</p>}
              {currentRequest.status === "rejected" && <p className="idea-next-step">This request was declined. You can still explore other ideas and teams.</p>}
              {currentRequest.status === "accepted" && idea.author?._id && (
                <Link className="btn btn-primary idea-open-messages" to={`/messages?user=${idea.author._id}`}><MessageCircle size={15} /> Message founder</Link>
              )}
            </section>
          )}


          {isAuthor && (
            <div className="idea-actions">
              <Link
                to={`/ideas/${idea._id}/edit`}
                className="btn btn-secondary"
              >
                <Pencil size={16} />
                Edit
              </Link>

              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 size={16} />
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}

        </div>

      </div>

    </main>
  );
};

export default IdeaDetails;
