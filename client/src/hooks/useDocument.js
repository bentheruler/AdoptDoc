import { useState, useEffect, useCallback } from 'react';
import {
  fetchDocuments,
  fetchStats,
  deleteDocument,
} from '../services/documentService';

const useDocument = () => {
  const [documents, setDocuments] = useState([]);
  const [stats,     setStats]     = useState({ total: 0, exports: 0, drafts: 0 });
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [docsRes, statsRes] = await Promise.all([
        fetchDocuments(),
        fetchStats(),
      ]);
      setDocuments(docsRes.data || []);
      setStats(statsRes.data || { total: 0, exports: 0, drafts: 0 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load documents.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const removeDocument = async (id) => {
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d._id !== id));
      setStats((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete document.');
    }
  };

  return { documents, stats, loading, error, reload: loadAll, removeDocument };
};

export default useDocument;