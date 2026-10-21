import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import { ArrowLeft, MessageCircle, Search, Send, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Messages.css";

const API_URL = "http://localhost:5000/api";

const getOtherPerson = (conversation, currentUserId) =>
  conversation?.participants?.find((person) => person._id !== currentUserId);

const formatTime = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const Messages = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedUserId = searchParams.get("user");
  const token = localStorage.getItem("token");
  const [tab, setTab] = useState("recent");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatReady, setChatReady] = useState(false);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [error, setError] = useState("");
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  const loadConversations = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load recent chats.");
      setConversations(data.conversations || []);
      return data.conversations || [];
    } catch (loadError) {
      setError(loadError.message);
      return [];
    }
  }, [token]);

  const loadUsers = useCallback(async (query = "") => {
    try {
      const response = await fetch(`${API_URL}/messages/users?search=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load users.");
      setUsers(data.users || []);
    } catch (loadError) { setError(loadError.message); }
  }, [token]);

  const startConversation = async (personId) => {
    setError("");
    try {
      const response = await fetch(`${API_URL}/messages/conversations/${personId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not start this chat.");
      setSelectedConversation(data.conversation);
      setMobileChatOpen(true);
      setConversations((current) => [
        data.conversation,
        ...current.filter((item) => item._id !== data.conversation._id)
      ]);
      setTab("recent");
    } catch (startError) { setError(startError.message); }
  };

  useEffect(() => {
    let active = true;
    const loadPage = async () => {
      setLoading(true);
      const [recent] = await Promise.all([loadConversations(), loadUsers("")]);
      if (!active) return;
      if (requestedUserId) {
        try {
          const response = await fetch(`${API_URL}/messages/conversations/${requestedUserId}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || "Could not start this chat.");
          if (active) {
            setSelectedConversation(data.conversation);
            setMobileChatOpen(true);
            setConversations((items) => [data.conversation, ...items.filter((item) => item._id !== data.conversation._id)]);
          }
        } catch (openError) { if (active) setError(openError.message); }
      } else if (recent.length > 0 && active) {
        setSelectedConversation(recent[0]);
        setMobileChatOpen(true);
      }
      if (active) setLoading(false);
    };
    loadPage();
    return () => { active = false; };
  }, [loadConversations, loadUsers, requestedUserId, token]);

  useEffect(() => {
    const timer = window.setTimeout(() => loadUsers(search), 250);
    return () => window.clearTimeout(timer);
  }, [loadUsers, search]);

  const conversationId = selectedConversation?._id;
  useEffect(() => {
    if (!conversationId || !token) return undefined;
    setChatReady(false);
    const socket = io("http://localhost:5000", { auth: { token } });
    socketRef.current = socket;
    socket.on("connect", () => socket.emit("direct:join", { conversationId }, (result) => {
      if (result?.error) setError(result.error);
      else setChatReady(true);
    }));
    socket.on("direct:history", setMessages);
    socket.on("direct:message", (message) => {
      setMessages((current) => [...current, message]);
      setConversations((current) => current.map((conversation) => conversation._id === conversationId
        ? { ...conversation, messages: [...(conversation.messages || []), message] }
        : conversation));
    });
    socket.on("connect_error", (socketError) => setError(socketError.message || "Chat connection failed."));
    return () => {
      socket.disconnect();
      socketRef.current = null;
      setChatReady(false);
    };
  }, [conversationId, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !selectedConversation) return;
    if (!socketRef.current?.connected || !chatReady) {
      setError("Chat is reconnecting. Try sending again in a moment.");
      return;
    }
    socketRef.current.emit("direct:send", { conversationId: selectedConversation._id, text }, (result) => {
      if (result?.error) setError(result.error);
      else {
        setDraft("");
        setError("");
      }
    });
  };

  const selectedPerson = getOtherPerson(selectedConversation, user?._id);
  const visibleUsers = users.filter((person) => person._id !== user?._id);

  return (
    <main className="messages-page">
      <section className={`messages-window ${mobileChatOpen ? "mobile-chat-open" : ""}`} aria-label="Messages">
        <aside className="messages-sidebar">
          <h1>Messages</h1>
          <label className="messages-search">
            <Search size={16} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search people..." aria-label="Search people" />
          </label>
          <div className="messages-tabs">
            <button className={tab === "recent" ? "active" : ""} onClick={() => setTab("recent")} type="button">Recent</button>
            <button className={tab === "users" ? "active" : ""} onClick={() => setTab("users")} type="button">All Users</button>
          </div>

          <div className="messages-people-list">
            {tab === "recent" ? conversations
              .filter((conversation) => getOtherPerson(conversation, user?._id)?.name?.toLowerCase().includes(search.toLowerCase()))
              .map((conversation) => {
                const person = getOtherPerson(conversation, user?._id);
                const latestMessage = conversation.messages?.[conversation.messages.length - 1];
                return (
                  <button key={conversation._id} type="button" className={`messages-person ${selectedConversation?._id === conversation._id ? "selected" : ""}`} onClick={() => { setSelectedConversation(conversation); setMobileChatOpen(true); }}>
                    <span className="messages-avatar">{person?.name?.charAt(0)?.toUpperCase() || "?"}</span>
                    <span className="messages-person-copy"><strong>{person?.name || "User"}</strong><small>{latestMessage?.text || "Start a conversation"}</small></span>
                  </button>
                );
              }) : visibleUsers.map((person) => (
                <div className="messages-user-row" key={person._id}>
                  <button type="button" className="messages-person" onClick={() => startConversation(person._id)}>
                    <span className="messages-avatar">{person.name?.charAt(0)?.toUpperCase() || "?"}</span>
                    <span className="messages-person-copy"><strong>{person.name}</strong><small>{person.headline || person.role || "VicharManthan member"}</small></span>
                  </button>
                  <Link to={`/profile/${person._id}`} className="messages-profile-link" aria-label={`View ${person.name}'s profile`} title="View profile"><UserRound size={16} /></Link>
                </div>
              ))}
            {tab === "recent" && conversations.length === 0 && <p className="messages-empty-list">No chats yet. Choose All Users to start one.</p>}
            {tab === "users" && visibleUsers.length === 0 && <p className="messages-empty-list">No users match your search.</p>}
          </div>
        </aside>

        <section className="messages-chat-panel">
          {selectedConversation && selectedPerson ? (
            <>
              <header className="messages-chat-header">
                <button type="button" className="messages-mobile-back" onClick={() => setMobileChatOpen(false)} aria-label="Back to chats"><ArrowLeft size={18} /></button>
                <span className="messages-avatar">{selectedPerson.name?.charAt(0)?.toUpperCase() || "?"}</span>
                <div><strong>{selectedPerson.name}</strong><small>{selectedPerson.headline || selectedPerson.role || "VicharManthan member"}</small></div>
                <Link to={`/profile/${selectedPerson._id}`} className="messages-view-profile">View profile</Link>
              </header>
              <div className="messages-history" aria-live="polite">
                {messages.map((message) => (
                  <div key={message._id} className={`messages-bubble-row ${message.sender?._id === user?._id ? "mine" : ""}`}>
                    <div className="messages-bubble"><p>{message.text}</p><small>{formatTime(message.createdAt)}</small></div>
                  </div>
                ))}
                {messages.length === 0 && <div className="messages-first-note"><MessageCircle size={24} /><p>Say hello to {selectedPerson.name}.</p></div>}
                <div ref={bottomRef} />
              </div>
              {error && <p className="messages-error" role="alert">{error}</p>}
              <form className="messages-compose" onSubmit={sendMessage}>
                <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Type a message..." aria-label="Type a message" maxLength={2000} />
                <button type="submit" aria-label="Send message" disabled={!chatReady}><Send size={17} /><span>Send</span></button>
              </form>
            </>
          ) : (
            <div className="messages-welcome"><MessageCircle size={40} /><h2>{loading ? "Loading messages..." : "Your conversations"}</h2><p>Choose a recent chat or open All Users to message someone.</p>{error && <p className="messages-error">{error}</p>}</div>
          )}
        </section>
      </section>
      <Link to="/" className="messages-back-home"><ArrowLeft size={15} /> Home</Link>
    </main>
  );
};

export default Messages;
