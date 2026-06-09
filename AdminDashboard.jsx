import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState("");

  const fetchAdminData = async () => {
    try {
      const statsRes = await API.get("/admin/stats");
      const usersRes = await API.get("/admin/users");
      const docsRes = await API.get("/admin/documents");

      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setDocuments(docsRes.data.documents);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load admin data");
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await API.delete(`/admin/users/${id}`);
      fetchAdminData();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete user");
    }
  };

  const deleteDocument = async (id) => {
    if (!window.confirm("Delete this document?")) return;

    try {
      await API.delete(`/admin/documents/${id}`);
      fetchAdminData();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete document");
    }
  };

  return (
    <div className="dashboard-page">
      <aside className="sidebar">
        <h2>AI PDF Assistant</h2>

        <nav>
          <Link className="nav-link" to="/dashboard">Dashboard</Link>
          <Link className="nav-link" to="/upload">Upload PDF</Link>
          <Link className="nav-link" to="/history">Chat History</Link>
          <Link className="nav-link active" to="/admin">Admin Dashboard</Link>
        </nav>

        <button className="logout-btn" onClick={logout}>Logout</button>
      </aside>

      <main className="dashboard-main">
        <div className="top-card">
          <h1>Admin Dashboard</h1>
          <p>Logged in as: {user?.email}</p>
        </div>

        {error && <div className="error-box">{error}</div>}

        {stats && (
          <div className="admin-stats">
            <div className="admin-stat-card">
              <h3>Total Users</h3>
              <p>{stats.totalUsers}</p>
            </div>

            <div className="admin-stat-card">
              <h3>Total PDFs</h3>
              <p>{stats.totalDocuments}</p>
            </div>

            <div className="admin-stat-card">
              <h3>Total Chats</h3>
              <p>{stats.totalChats}</p>
            </div>
          </div>
        )}

        <div className="admin-section">
          <h2>Users</h2>

          <div className="admin-table">
            {users.map((item) => (
              <div className="admin-row" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.email}</p>
                  <span>{item.role}</span>
                </div>

                {item.role !== "admin" && (
                  <button className="delete-btn" onClick={() => deleteUser(item.id)}>
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="admin-section">
          <h2>Documents</h2>

          <div className="admin-table">
            {documents.map((doc) => (
              <div className="admin-row" key={doc.id}>
                <div>
                  <strong>{doc.original_name}</strong>
                  <p>{doc.user_email}</p>
                  <span>Total Chunks: {doc.total_chunks}</span>
                </div>

                <button className="delete-btn" onClick={() => deleteDocument(doc.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;