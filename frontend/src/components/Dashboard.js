import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getDocuments } from '../utils/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch documents on component mount
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await getDocuments();
        setDocuments(response.data);
      } catch (err) {
        console.error('Failed to fetch documents:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Handle logout
  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <h1>AdoptDoc</h1>
        <div className="user-info">
          <span>Welcome, {user?.name || 'User'}</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <nav>
            <ul>
              <li className="active">My Documents</li>
              <li>Create New</li>
              <li>Templates</li>
              <li>Settings</li>
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="main-content">
          <h2>My Documents</h2>
          
          {loading ? (
            <p>Loading documents...</p>
          ) : documents.length > 0 ? (
            <div className="documents-list">
              {documents.map((doc) => (
                <div key={doc.id} className="document-card">
                  <h3>{doc.title || 'Untitled'}</h3>
                  <p>Last modified: {new Date(doc.updatedAt).toLocaleDateString()}</p>
                  <span className="doc-type">{doc.type}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No documents yet. Create your first document!</p>
              <button className="create-btn">Create New Document</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;