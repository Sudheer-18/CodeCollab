export const API_BASE_URL = "https://codecollab-1-stj1.onrender.com";
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || API_BASE_URL.replace(/^http/, "ws");