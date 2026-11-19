const configuredApiBaseUrl = import.meta.env.VITE_API_URL?.trim();
export const API_BASE_URL = (configuredApiBaseUrl || "https://codecollab-1-stj1.onrender.com").replace(/\/+$/, "");
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || API_BASE_URL.replace(/^http/, "ws");