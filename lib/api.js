import axios from "axios";
import Cookies from "js-cookie";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./auth";
import { API_URL } from "./env";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status === 401 &&
      error.response?.data?.message === "Access token expired" &&
      !original._retry
    ) {
      original._retry = true;
      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000"}/auth/refresh`,
          { refreshToken: getRefreshToken() }
        );
        setTokens(data.accessToken, data.refreshToken, Cookies.get("userRole"));
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        clearTokens();
        // fire event instead of redirecting directly
        window.dispatchEvent(new Event("session:expired"));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
