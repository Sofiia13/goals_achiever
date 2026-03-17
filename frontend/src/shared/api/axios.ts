import axios from "axios";

const apiBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(
  /\/+$/,
  ""
);

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
