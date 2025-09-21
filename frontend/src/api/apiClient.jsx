import axios from "axios";

const RAW = typeof import.meta !== "undefined" ? import.meta.env.VITE_API_URL : "";
const API_ROOT = (RAW || "").replace(/\/+$/, "") || "http://127.0.0.1:8000";

// If caller provided the API root including /api, keep it; otherwise append /api
const base = API_ROOT.endsWith("/api") ? API_ROOT : `${API_ROOT}/api`;

const api = axios.create({
  baseURL: base,               // e.g. https://your-backend.onrender.com/api
  withCredentials: false,      // set to true only if you're using cookies/session auth
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

export default api;
