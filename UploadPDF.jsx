import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const UploadPDF = () => {
  const { user, logout } = useAuth();

  const [pdfFile, setPdfFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchDocuments = async () => {
    try {
      const res = await API.get("/documents/my-documents");
      setDocuments(res.data.documents);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
    setMessage("");
    setError("");
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!pdfFile) {
      setError("Please select a PDF file");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", pdfFile);

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const res = await API.post("/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(res.data.message);
      setPdfFile(null);
      e.target.reset();

      fetchDocuments();
    } catch (error) {
      setError(error.response?.data?.message || "PDF upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId) => {
    const confirmDelete = window.confirm("Delete this PDF?");

    if (!confirmDelete) return;

    try {
      await API.delete(`/documents/${documentId}`);
      fetchDocuments();
    } catch (error) {
      setError(error.response?.data?.message || "Delete failed");
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

      <main className="dashboard-main">
        <div className="top-card">
          <h1>Upload PDF</h1>
          <p>Logged in as: {user?.email}</p>
        </div>

        <div className="upload-card">
          <h2>Select PDF File</h2>

          {message && <div className="success-box">{message}</div>}
          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleUpload}>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
            />

            <button type="submit" disabled={loading}>
              {loading ? "Uploading and extracting text..." : "Upload PDF"}
            </button>
          </form>
        </div>

        <div className="documents-section">
          <h2>Uploaded PDFs</h2>

          {documents.length === 0 ? (
            <p className="empty-text">No PDFs uploaded yet.</p>
          ) : (
            <div className="document-list">
              {documents.map((doc) => (
                <div className="document-card" key={doc.id}>
                  <div>
                    <h3>{doc.original_name}</h3>
                    <p>{doc.text_preview || "No preview available"}</p>
                    <span>Total Chunks: {doc.total_chunks}</span>
                  </div>

                  <div className="document-actions">
  <Link className="chat-btn" to={`/chat/${doc.id}`}>
    Chat
  </Link>

  <button
    className="delete-btn"
    onClick={() => handleDelete(doc.id)}
  >
    Delete
  </button>
</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UploadPDF;