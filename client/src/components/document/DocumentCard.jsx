// client/src/components/document/DocumentCard.jsx
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/formatDate';

const TYPE_LABELS = {
  cv:           'CV',
  cover_letter: 'Cover Letter',
  proposal:     'Proposal',
};

const DocumentCard = ({ doc, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="document-card">
      <div className="document-card__info">
        <span className={`document-card__badge document-card__badge--${doc.type}`}>
          {TYPE_LABELS[doc.type] || doc.type}
        </span>
        <h3 className="document-card__title">{doc.title || 'Untitled'}</h3>
        <p className="document-card__meta">
          {doc.theme && <span>Theme: {doc.theme} · </span>}
          Last modified: {formatDate(doc.updatedAt)}
        </p>
      </div>

      <div className="document-card__actions">
        <button
          className="btn btn--ghost btn--sm"
          onClick={() => navigate(`/document/${doc._id}/edit`)}
        >
          Edit
        </button>
        <button
          className="btn btn--danger btn--sm"
          onClick={() => onDelete(doc._id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default DocumentCard;