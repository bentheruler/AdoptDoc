import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const fetchDocuments  = ()        => API.get('/documents');
export const fetchDocument   = (id)      => API.get(`/documents/${id}`);
export const createDocument  = (payload) => API.post('/documents', payload);
export const updateDocument  = (id, payload) => API.put(`/documents/${id}`, payload);
export const deleteDocument  = (id)      => API.delete(`/documents/${id}`);
export const fetchStats      = ()        => API.get('/documents/stats');