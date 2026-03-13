// client/src/pages/dashboard/DashboardPage.jsx
// Main dashboard page component.// client/src/pages/dashboard/DashboardPage.jsx
import { useNavigate }      from 'react-router-dom';
import { useAuth }          from '../../context/AuthContext';
import useDocument          from '../../hooks/useDocument';
import StatsCard            from '../../components/dashboard/StatsCard';
import RecentDocuments      from '../../components/dashboard/RecentDocuments';
import './Dashboard.css';

const DashboardPage = () => {
  const { user }                                    = useAuth();
  const navigate                                    = useNavigate();
  const { documents, stats, loading, error, removeDocument } = useDocument();

  const STATS = [
    { label: 'Total Docs', value: stats.total,   icon: '📄' },
    { label: 'Exports',    value: stats.exports,  icon: '⬇' },
    { label: 'Drafts',     value: stats.drafts,   icon: '✏' },
  ];

  return (
    <div className="dashboard-page">
      {/* Welcome banner */}
      <div className="dashboard-page__banner">
        <div>
          <h1 className="dashboard-page__heading">Dashboard</h1>
          <p className="dashboard-page__subheading">
            Welcome back, <strong>{user?.name || 'there'}</strong>! Here's what's going on.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="dashboard-page__stats">
        {STATS.map((s) => (
          <StatsCard key={s.label} {...s} />
        ))}
      </div>

      {/* Recent documents */}
      <RecentDocuments
        documents={documents}
        loading={loading}
        error={error}
        onDelete={removeDocument}
        onCreateNew={() => navigate('/document/new')}
      />
    </div>
  );
};

export default DashboardPage;
