import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const History = () => {
  const { user, logout } = useAuth();

  const [chats, setChats] = useState([]);
  const [error, setError] = useState("");

  const fetchHistory = async () => {
    try {
      const res = await API.get("/chat/history/all");
      setChats(res.data.chats);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load chat history");
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const clearDocumentHistory = async (documentId) => {
    const confirmClear = window.confirm(
      "Clear chat history for this PDF?"
    );

    if (!confirmClear) return;

    try {
      await API.delete(`/chat/${documentId}`);
      fetchHistory();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to clear history");
    }
  };

  const groupedChats = chats.reduce((groups, chat) => {
    const documentId = chat.document_id;

    if (!groups[documentId]) {
      groups[documentId] = {
        documentId,
        documentName: chat.original_name,
        chats: [],
      };
    }

    groups[documentId].chats.push(chat);
    return groups;
  }, {});

  return (
    <div className="dashboard-page">
      <aside className="sidebar">
        <h2>AI PDF Assistant</h2>

        <nav>
  <Link className="nav-link" to="/dashboard">
    Dashboard
  </Link>

  <Link className="nav-link" to="/upload">
    Upload PDF
  </Link>

  <Link className="nav-link" to="/summarize">
  Summarize
</Link>

  <Link className="nav-link" to="/history">
    Chat History
  </Link>

  {user?.role === "admin" && (
    <Link className="nav-link" to="/admin">
      Admin Dashboard
    </Link>
  )}
</nav>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </aside>

      <main className="dashboard-main">
        <div className="top-card">
          <h1>Chat History</h1>
          <p>View previous questions and answers from uploaded PDFs.</p>
        </div>

        {error && <div className="error-box">{error}</div>}

        {chats.length === 0 ? (
          <div className="empty-history">
            <h2>No chat history yet</h2>
            <p>Ask questions from a PDF to see history here.</p>
            <Link to="/upload" className="card-link">
              Go to Upload PDF
            </Link>
          </div>
        ) : (
          <div className="history-list">
            {Object.values(groupedChats).map((group) => (
              <div className="history-document-card" key={group.documentId}>
                <div className="history-document-header">
                  <div>
                    <h2>{group.documentName}</h2>
                    <p>Total chats: {group.chats.length}</p>
                  </div>

                  <div className="history-actions">
                    <Link
                      className="chat-btn"
                      to={`/chat/${group.documentId}`}
                    >
                      Open Chat
                    </Link>

                    <button
                      className="delete-btn"
                      onClick={() => clearDocumentHistory(group.documentId)}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {group.chats.map((chat) => (
                  <div className="history-chat-card" key={chat.id}>
                    <div className="history-question">
                      <strong>Question</strong>
                      <p>{chat.question}</p>
                    </div>

                    <div className="history-answer">
                      <strong>Answer</strong>
                      <p>{chat.answer}</p>
                    </div>

                    <span className="history-date">
                      {chat.created_at}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;