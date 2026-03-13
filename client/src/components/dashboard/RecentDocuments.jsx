// NEW FILE — not in project structure
// Suggested location: client/src/components/dashboard/RecentDocuments.jsx

import { useState, useMemo } from 'react';
import DocumentCard from '../document/DocumentCard';
import Loader       from '../common/Loader';

const DOC_TYPES = ['All', 'cv', 'cover_letter', 'proposal'];

const RecentDocuments = ({ documents, loading, error, onDelete, onCreateNew }) => {
  const [search,  setSearch]  = useState('');
  const [typeFilter, setType] = useState('All');

  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = doc.title?.toLowerCase().includes(search.toLowerCase());
      const matchesType   = typeFilter === 'All' || doc.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [documents, search, typeFilter]);

  return (
    <section className="recent-docs">
      {/* Header row */}
      <div className="recent-docs__header">
        <h2 className="recent-docs__title">My Documents</h2>
        <button className="btn btn--primary" onClick={onCreateNew}>
          + New Document
        </button>
      </div>

      {/* Search + filter */}
      <div className="recent-docs__controls">
        <input
          className="recent-docs__search"
          type="text"
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="recent-docs__filters">
          {DOC_TYPES.map((t) => (
            <button
              key={t}
              className={`filter-btn ${typeFilter === t ? 'filter-btn--active' : ''}`}
              onClick={() => setType(t)}
            >
              {t === 'All' ? 'All' : t === 'cv' ? 'CV' : t === 'cover_letter' ? 'Cover Letter' : 'Proposal'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <Loader />
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : filtered.length > 0 ? (
        <div className="recent-docs__list">
          {filtered.map((doc) => (
            <DocumentCard key={doc._id} doc={doc} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>{search || typeFilter !== 'All' ? 'No documents match your search.' : 'No documents yet. Create your first!'}</p>
          {!search && typeFilter === 'All' && (
            <button className="btn btn--primary" onClick={onCreateNew}>
              Create New Document
            </button>
          )}
        </div>
      )}
    </section>
  );
};

export default RecentDocuments;