// src/api/auth.api.ts
// Uses a RAW axios instance (no interceptors) for auth endpoints
// so that no stale Bearer tokens ever contaminate /auth/login requests.
import axios from "axios";
import { AuthResponse, User } from "../types";

const ORDS_BASE_URL =
  import.meta.env.VITE_ORDS_BASE_URL ||
  (import.meta.env.DEV ? "" : "http://100.100.129.101:8080");

// Dedicated auth client — no shared interceptors, guarantees clean login requests
const authClient = axios.create({
  baseURL: `${ORDS_BASE_URL}/ords/fincore`,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  // Purge any stale tokens so nothing leaks into the request
  // (belt-and-suspenders: authClient has no interceptors anyway)
  delete authClient.defaults.headers.common["Authorization"];

  const response = await authClient.post<AuthResponse>("/auth/login", {
    email: email.trim(),
    password,
  });
  return response.data;
};

export const logout = async (
  accessToken: string
): Promise<{ status: string; message: string }> => {
  const response = await authClient.post<{ status: string; message: string }>(
    "/auth/logout",
    { access_token: accessToken }
  );
  return response.data;
};

export const refreshToken = async (
  tokenRefresh: string
): Promise<{
  status: string;
  message: string;
  data: { access_token: string; refresh_token: string; expires_in: number };
}> => {
  const response = await authClient.post<{
    status: string;
    message: string;
    data: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };
  }>("/auth/refresh", { refresh_token: tokenRefresh });
  return response.data;
};

export const getCurrentUser = async (
  accessToken: string
): Promise<{ status: string; data: User }> => {
  const response = await authClient.post<{ status: string; data: User }>(
    "/auth/me",
    { access_token: accessToken }
  );
  return response.data;
};
