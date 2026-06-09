import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-page">
      <aside className="sidebar">
        <h2>AI PDF Assistant</h2>

        <nav>
          <Link className="nav-link active" to="/dashboard">
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
          <h1>Welcome, {user?.name}</h1>
          <p>Email: {user?.email}</p>
          <p>Role: {user?.role}</p>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <h3>Upload PDF</h3>
            <p>Upload lecture notes, books, assignments, or research papers.</p>

            <Link to="/upload" className="card-link">
              Go to Upload
            </Link>
          </div>

          <div className="feature-card">
            <h3>Ask Questions</h3>
            <p>Ask questions based on uploaded PDF content.</p>

            <Link to="/upload" className="card-link">
              Select PDF to Chat
            </Link>
          </div>

          <div className="feature-card">
            <h3>Summarize PDF</h3>
            <p>Generate structured summaries with selected word count.</p>

            <Link to="/summarize" className="card-link">
              Open Summarize
            </Link>
          </div>

          <div className="feature-card">
            <h3>Chat History</h3>
            <p>Saved conversations will appear here.</p>

            <Link to="/history" className="card-link">
              View History
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;