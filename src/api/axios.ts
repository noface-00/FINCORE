// src/api/axios.ts
import axios from "axios";

/**
 * In development: requests go to /ords/* → Vite proxy → Oracle ORDS server.
 * This eliminates ALL CORS issues (browser only sees localhost).
 *
 * In production: use VITE_ORDS_BASE_URL to point to the real server
 * (must be behind a reverse proxy with proper CORS headers configured).
 */
const ORDS_BASE_URL = import.meta.env.DEV
  ? "" // Force proxy in development
  : import.meta.env.VITE_ORDS_BASE_URL || "http://100.100.129.101:8080";

const api = axios.create({
  baseURL: `${ORDS_BASE_URL}/ords/fincore`,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─── Request interceptor ─────────────────────────────────────────────────────
// Attach JWT token to all non-auth requests.
// Auto-migrates legacy plain-text demo tokens to ORDS-compatible Base64.
api.interceptors.request.use((config) => {
  const authEndpoints = ["/auth/login", "/auth/refresh", "/auth/me", "/auth/logout"];
  const isAuthEndpoint = authEndpoints.some((ep) => config.url?.includes(ep));

  if (!isAuthEndpoint) {
    let token = localStorage.getItem("accessToken");

    // Auto-migrate legacy demo tokens to ORDS-compatible Base64
    if (
      token === "demo-mode-token-fincore" ||
      token === "fake-jwt-token-fincore-2025"
    ) {
      token = btoa("sub=1,rol=ADMIN");
      localStorage.setItem("accessToken", token);
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// ─── Response interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;
