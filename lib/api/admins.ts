import type { ApiResponse, PaginatedResponse, User, CreateAdminPayload, UpdateAdminPayload } from "@/types";
import { apiFetch } from "../api-client";

export const adminsApi = {
	getAll: async (per_page?: number) => {
		const params = new URLSearchParams();
		if (per_page) {
			params.append("per_page", String(per_page));
		}
		const queryString = params.toString();
		const url = `/api/v1/admins${queryString ? `?${queryString}` : ""}`;
		return apiFetch<ApiResponse<PaginatedResponse<User>>>(url, "GET");
	},

	getById: async (id: number) => {
		return apiFetch<ApiResponse<User>>(`/api/v1/admins/${id}`, "GET");
	},

	create: async (payload: CreateAdminPayload) => {
		return apiFetch<ApiResponse<User>>("/api/v1/admins", "POST", payload);
	},

	update: async (id: number, payload: UpdateAdminPayload) => {
		return apiFetch<ApiResponse<User>>(`/api/v1/admins/${id}`, "PUT", payload);
	},

	delete: async (id: number) => {
		return apiFetch<ApiResponse<null>>(`/api/v1/admins/${id}`, "DELETE");
	},
};
