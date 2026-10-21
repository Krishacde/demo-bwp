import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, CheckCheck, MessageCircle, Users } from "lucide-react";
import "./Notifications.css";

const getNotificationText = (notification) => {
  const name = notification.actor?.name || "Someone";
  if (notification.type === "direct_message") return `${name} sent you a message`;
  if (notification.type === "idea_message") return `${name} sent a message in your collaboration chat`;
  if (notification.type === "collaboration_request") return `${name} wants to join your idea`;
  if (notification.type === "collaboration_accepted") return `${name} accepted your collaboration request`;
  if (notification.type === "collaboration_rejected") return `${name} declined your collaboration request`;
  return "You have a new notification";
};

const getNotificationLink = (notification) => {
  if (["direct_message", "collaboration_accepted"].includes(notification.type)) {
    return `/messages?user=${notification.actor?._id || ""}`;
  }
  if (notification.idea?._id) return `/ideas/${notification.idea._id}`;
  return "/messages";
};

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load notifications.");
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (loadError) { setError(loadError.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const openNotification = async (notification) => {
    if (!notification.isRead) {
      try {
        await fetch(`http://localhost:5000/api/notifications/${notification._id}/read`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
      } catch { /* Navigation still works if marking read fails. */ }
    }
    navigate(getNotificationLink(notification));
  };

  const markAllRead = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/notifications/read-all", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (!response.ok) throw new Error("Could not update notifications.");
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (updateError) { setError(updateError.message); }
  };

  return (
    <main className="notifications-page">
      <div className="notifications-container">
        <header className="notifications-header">
          <div className="notifications-title-icon"><Bell size={22} /></div>
          <div><p className="notifications-eyebrow">YOUR ACTIVITY</p><h1>Notifications</h1><p>{unreadCount ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}` : "You are all caught up."}</p></div>
          {unreadCount > 0 && <button type="button" className="btn btn-secondary" onClick={markAllRead}><CheckCheck size={17} /> Mark all read</button>}
        </header>

        {error && <div className="form-message" role="alert">{error}</div>}
        {loading ? <div className="notifications-empty">Loading notifications...</div> : notifications.length === 0 ? (
          <div className="notifications-empty"><Bell size={30} /><h2>No notifications yet</h2><p>Messages and collaboration requests will appear here.</p></div>
        ) : (
          <section className="notifications-list" aria-label="Your notifications">
            {notifications.map((notification) => (
              <article className={`notification-card ${notification.isRead ? "read" : "unread"}`} key={notification._id}>
                <span className="notification-icon">{notification.type.includes("collaboration") ? <Users size={18} /> : <MessageCircle size={18} />}</span>
                <button type="button" className="notification-content" onClick={() => openNotification(notification)}>
                  <strong>{getNotificationText(notification)}</strong>
                  {notification.idea?.title && <span>Idea: {notification.idea.title}</span>}
                  {notification.preview && <span className="notification-preview">{notification.preview}</span>}
                  <time dateTime={notification.createdAt}>{new Date(notification.createdAt).toLocaleString()}</time>
                </button>
                {notification.actor?._id && <Link to={`/profile/${notification.actor._id}`} className="notification-profile-link">View profile</Link>}
                {!notification.isRead && <span className="notification-unread-dot" aria-label="Unread" />}
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
};

export default Notifications;
