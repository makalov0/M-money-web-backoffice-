import axios from "axios";

const BASE_URL = "http://localhost:5001/api";

const api = axios.create({ baseURL: BASE_URL, timeout: 10000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export type AuditPayload = {
  action: string;            // "PAGE_VIEW", "CLICK", "CREATE", "UPDATE"
  page?: string;             // location.pathname
  target_type?: string;      // "promotion", "banner"
  target_id?: string;        // "123"
  detail?: unknown;          // any object
};

export async function sendAuditLog(payload: AuditPayload) {
  try {
    await api.post("/audit/log", payload);
  } catch (e) {
    // don't break UI if audit fails
    console.warn("audit failed", e);
  }
}
