// client/src/services/documentService.js
// Document operations with localStorage fallback for MVP

import api from '../utils/api';

const STORAGE_KEY = 'adaptdoc_documents';

// Get all user documents
export const getDocuments = async () => {
  try {
    return await api.get('/documents');
  } catch (err) {
    // Fallback to localStorage
    const docs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return { data: docs };
  }
};

// Get single document by ID
export const getDocument = async (id) => {
  try {
    return await api.get(`/documents/${id}`);
  } catch (err) {
    const docs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const doc = docs.find(d => d.id === id);
    if (!doc) {
      throw new Error('Document not found');
    }
    return { data: doc };
  }
};

// Create new document
export const createDocument = async (docData) => {
  try {
    return await api.post('/documents', docData);
  } catch (err) {
    // Fallback to localStorage
    const docs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const newDoc = {
      id: Date.now().toString(),
      ...docData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    docs.unshift(newDoc);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
    return { data: newDoc };
  }
};

// Update document
export const updateDocument = async (id, updates) => {
  try {
    return await api.put(`/documents/${id}`, updates);
  } catch (err) {
    // Fallback to localStorage
    const docs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const index = docs.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error('Document not found');
    }
    docs[index] = {
      ...docs[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
    return { data: docs[index] };
  }
};

// Delete document
export const deleteDocument = async (id) => {
  try {
    return await api.delete(`/documents/${id}`);
  } catch (err) {
    // Fallback to localStorage
    const docs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const filtered = docs.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return { data: { success: true } };
  }
};

// Export document as PDF/Word (handled on client-side in this MVP)
export const downloadDocument = (docData, format = 'pdf') => {
  // PDF/Word export is handled in DashboardPage.jsx
  return Promise.resolve({ data: { success: true } });
};

export default {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  downloadDocument,
};
