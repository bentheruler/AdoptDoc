// client/src/services/documentService.js
// Axios service functions for document operations.
import axios from "axios";

const API = "http://localhost:5000/api";

const authHeaders = () => {
  const token =
    localStorage.getItem("accessToken") || localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const createDocument = async (data) => {
  const res = await axios.post(`${API}/documents`, data, authHeaders());
  return res.data;
};

export const getDocuments = async () => {
  const res = await axios.get(`${API}/documents`, authHeaders());
  return res.data;
};

export const updateDocument = async (id, data) => {
  const res = await axios.put(`${API}/documents/${id}`, data, authHeaders());
  return res.data;
};

export const deleteDocument = async (id) => {
  const res = await axios.delete(`${API}/documents/${id}`, authHeaders());
  return res.data;
};