import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const ChatPDF = () => {
  const { documentId } = useParams();
  const { user, logout } = useAuth();

  const [document, setDocument] = useState(null);
  const [chats, setChats] = useState([]);
  const [question, setQuestion] = useState("");
  const [summary, setSummary] = useState("");
  const [summaryWords, setSummaryWords] = useState(200);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const fetchDocument = async () => {
    try {
      const res = await API.get(`/documents/${documentId}`);
      setDocument(res.data.document);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load document");
    }
  };

  const fetchChats = async () => {
    try {
      const res = await API.get(`/chat/${documentId}`);
      setChats(res.data.chats);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDocument();
    fetchChats();
  }, [documentId]);

  const handleSummarize = async () => {
    try {
      setSummaryLoading(true);
      setError("");

      const res = await API.post(`/documents/${documentId}/summarize`, {
        wordLimit: summaryWords,
      });

      setSummary(res.data.summary);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to generate summary");
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();

    if (!question.trim()) {
      setError("Please enter a question");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await API.post("/chat/ask", {
        documentId: Number(documentId),
        question,
      });

      setChats((prevChats) => [...prevChats, res.data.chat]);
      setQuestion("");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to generate answer");
    } finally {
      setLoading(false);
    }
  };

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

      <main className="chat-main">
        <div className="chat-header">
          <div>
            <h1>PDF Chat</h1>
            <p>{document?.original_name}</p>
            <p>Total Chunks: {document?.total_chunks}</p>
          </div>

          <div className="chat-header-actions">
            <select
              className="summary-select"
              value={summaryWords}
              onChange={(e) => setSummaryWords(Number(e.target.value))}
            >
              <option value={100}>100 words</option>
              <option value={200}>200 words</option>
              <option value={300}>300 words</option>
              <option value={500}>500 words</option>
            </select>

            <button className="summary-btn" onClick={handleSummarize}>
              {summaryLoading ? "Summarizing..." : "Summarize PDF"}
            </button>

            <Link to="/upload" className="back-link">
              Back to PDFs
            </Link>
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}

        {summary && (
          <div className="summary-box">
            <h2>PDF Summary</h2>
            <p>{summary}</p>
          </div>
        )}

        <div className="chat-box">
          {chats.length === 0 ? (
            <div className="empty-chat">
              <h2>No questions yet</h2>
              <p>Ask something from this PDF.</p>
            </div>
          ) : (
            chats.map((chat) => (
              <div className="chat-message-group" key={chat.id}>
                <div className="user-message">
                  <strong>Question:</strong>
                  <p>{chat.question}</p>
                </div>

                <div className="bot-message">
                  <strong>Answer:</strong>
                  <p>{chat.answer}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <form className="question-form" onSubmit={handleAskQuestion}>
          <input
            type="text"
            placeholder="Ask a question from this PDF..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Generating..." : "Ask"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default ChatPDF;