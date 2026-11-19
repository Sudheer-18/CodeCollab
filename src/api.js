const DEFAULT_API_BASE_URL = import.meta.env.PROD
  ? "https://codecollab-1-stj1.onrender.com"
  : "http://localhost:5000";

export const API_BASE_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || API_BASE_URL.replace(/^http/, "ws");