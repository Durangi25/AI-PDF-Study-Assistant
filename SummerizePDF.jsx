import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const SummerizePDF = () => {
  const { user, logout } = useAuth();

  const [documents, setDocuments] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [wordLimit, setWordLimit] = useState(200);
  const [latestSummary, setLatestSummary] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchDocuments = async () => {
    try {
      const res = await API.get("/documents/my-documents");
      setDocuments(res.data.documents);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load documents");
    }
  };

  const fetchSummaries = async () => {
    try {
      const res = await API.get("/documents/summaries/history");
      setSummaries(res.data.summaries);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load summaries");
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchSummaries();
  }, []);

  const handleSummarize = async (e) => {
    e.preventDefault();

    if (!selectedDocumentId) {
      setError("Please select a PDF document");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");
      setLatestSummary("");

      const res = await API.post(`/documents/${selectedDocumentId}/summarize`, {
        wordLimit,
      });

      setLatestSummary(res.data.summary);
      setMessage("Summary generated successfully");
      fetchSummaries();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSummary = async (summaryId) => {
    const confirmDelete = window.confirm("Delete this summary?");

    if (!confirmDelete) return;

    try {
      await API.delete(`/documents/summaries/${summaryId}`);
      fetchSummaries();
      setMessage("Summary deleted successfully");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete summary");
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

          <Link className="nav-link active" to="/summarize">
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
          <h1>Summarize PDF</h1>
          <p>
            Select an uploaded PDF, choose summary length, and generate a
            structured summary.
          </p>
        </div>

        {message && <div className="success-box">{message}</div>}
        {error && <div className="error-box">{error}</div>}

        <div className="summary-tool-card">
          <h2>Generate Summary</h2>

          <form onSubmit={handleSummarize} className="summary-form">
            <div className="form-group">
              <label>Select PDF</label>
              <select
                value={selectedDocumentId}
                onChange={(e) => setSelectedDocumentId(e.target.value)}
              >
                <option value="">Choose a PDF</option>
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.original_name} - {doc.total_chunks} chunks
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Summary Length</label>
              <select
                value={wordLimit}
                onChange={(e) => setWordLimit(Number(e.target.value))}
              >
                <option value={100}>100 words</option>
                <option value={200}>200 words</option>
                <option value={300}>300 words</option>
                <option value={500}>500 words</option>
              </select>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Summarizing..." : "Summarize"}
            </button>
          </form>
        </div>

        {latestSummary && (
          <div className="summary-result-card">
            <h2>Latest Summary</h2>
            <p>{latestSummary}</p>
          </div>
        )}

        <div className="summary-history-section">
          <h2>Summary History</h2>

          {summaries.length === 0 ? (
            <p className="empty-text">No summaries generated yet.</p>
          ) : (
            <div className="summary-history-list">
              {summaries.map((item) => (
                <div className="summary-history-card" key={item.id}>
                  <div className="summary-history-header">
                    <div>
                      <h3>{item.original_name}</h3>
                      <span>
                        {item.word_limit} words • {item.created_at}
                      </span>
                    </div>

                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteSummary(item.id)}
                    >
                      Delete
                    </button>
                  </div>

                  <p>{item.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SummerizePDF;