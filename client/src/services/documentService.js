// client/src/services/documentService.js
// Axios service functions for document operations.[05:16, 3/4/2026] Sir Gabriel: import axios from "axios";

// ── Axios instance ────────────────────────────────────────────────────────────

const createApiClient = () => {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000",
    timeout: 30000,
    headers: { "Content-Type": "application/json" },
  });

  // Attach JWT on every request automatically
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = Bearer ${token};
    }
    return config;
  });

  // Normalize error shape
  client.interceptors.response.use(
    (res) => res,
    (err) => {
      const apiErr = {
        message: err.response?.data?.message ?? err.message ?? "Unknown error",
        status: err.response?.status ?? 0,
        code: err.response?.data?.code ?? "NETWORK_ERROR",
      };
      return Promise.reject(apiErr);
    }
  );

  return client;
};

const api = createApiClient();

// ── Helper ────────────────────────────────────────────────────────────────────

async function request(config) {
  const res = await api.request(config);
  return res.data.data;
}

// ── Document Service ──────────────────────────────────────────────────────────

export const documentService = {
  generate: (payload) =>
    request({
      method: "POST",
      url: "/api/documents/generate",
      data: payload,
    }),

  getById: (id) =>
    request({
      method: "GET",
      url: /api/documents/${id},
    }),

  list: () =>
    request({
      method: "GET",
      url: "/api/documents",
    }),

  update: (id, payload) =>
    request({
      method: "PUT",
      url: /api/documents/${id},
      data: payload,
    }),

  delete: (id) =>
    request({
      method: "DELETE",
      url: /api/documents/${id},
    }),
};

// ── Auth Service ──────────────────────────────────────────────────────────────

export const authService = {
  login: async (email, password) => {
    const res = await api.post("/api/auth/login", {
      email,
      password,
    });
    localStorage.setItem("token", res.data.data.token);
  },

  logout: () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  },

  isAuthenticated: () => Boolean(localStorage.getItem("token")),
};

export default api;
[05:18, 3/4/2026] Sir Gabriel: import { useState, useRef, useCallback, useEffect } from "react";
import { documentService } from "../api/document.service";
import {
  DocType,
  DocLength,
  Tone,
  SaveStatus,
} from "../types/document.types";

// ── Default form state 
