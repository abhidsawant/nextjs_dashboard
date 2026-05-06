import Cookies from "js-cookie";

export const setTokens = (access, refresh, role) => {
  Cookies.set("accessToken", access,  { sameSite: "strict" });
  Cookies.set("refreshToken", refresh, { sameSite: "strict" });
  Cookies.set("userRole",     role,    { sameSite: "strict" });
};

export const clearTokens = () => {
  Cookies.remove("accessToken");
  Cookies.remove("refreshToken");
  Cookies.remove("userRole");
};

export const getAccessToken  = () => Cookies.get("accessToken");
export const getRefreshToken = () => Cookies.get("refreshToken");
