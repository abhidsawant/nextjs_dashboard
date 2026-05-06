import api from "./api";

// Auth
export const loginUser         = (form)                    => api.post("/auth/login", form);
export const registerUser      = (form)                    => api.post("/auth/register", form);
export const verifyOtp         = (endpoint, email, otp)    => api.post(endpoint, { email, otp });
export const resendOtp         = (email, purpose)          => api.post("/auth/resend-otp", { email, purpose });
export const forgotPassword    = (email)                   => api.post("/auth/forgot-password", { email });
export const resetPassword     = (email, otp, newPassword) => api.post("/auth/reset-password", { email, otp, newPassword });
export const getMe             = ()                        => api.get("/auth/me");
export const logoutUser        = (refreshToken)            => api.post("/auth/logout", { refreshToken });

// Admin
export const getAdminUsers     = ()                        => api.get("/dashboard/admin/users");
export const updateUserRole    = (userId, role)            => api.patch(`/dashboard/admin/users/${userId}/role`, { role });
