import type { ApiResponse, LoginPayload, AuthResponse, UserWithAuth } from "@/types";
import { apiFetch } from "../api-client";

export const authApi = {
	login: async (payload: LoginPayload) => {
		return apiFetch<ApiResponse<AuthResponse>>("/api/v1/auth/login", "POST", payload);
	},

	logout: async () => {
		return apiFetch<ApiResponse<null>>("/api/v1/auth/logout", "POST");
	},

	me: async () => {
		return apiFetch<ApiResponse<UserWithAuth>>("/api/v1/auth/me", "GET");
	},

	refresh: async () => {
		return apiFetch<ApiResponse<AuthResponse>>("/api/v1/auth/refresh", "POST");
	},
};
