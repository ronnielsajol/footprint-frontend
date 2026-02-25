import type {
	ApiResponse,
	PaginatedResponse,
	Vip,
	CreateVipPayload,
	UpdateVipPayload,
	VipFilters,
	CheckVipExistsParams,
	CheckVipExistsResponse,
} from "@/types";
import { apiFetch } from "../api-client";

export const vipsApi = {
	getAll: async (filters?: VipFilters) => {
		const params = new URLSearchParams();
		if (filters) {
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					params.append(key, String(value));
				}
			});
		}
		const queryString = params.toString();
		const url = `/api/v1/vips${queryString ? `?${queryString}` : ""}`;
		return apiFetch<ApiResponse<PaginatedResponse<Vip>>>(url, "GET");
	},

	checkExists: async (params: CheckVipExistsParams) => {
		const searchParams = new URLSearchParams();
		Object.entries(params).forEach(([key, value]) => {
			searchParams.append(key, String(value));
		});
		return apiFetch<ApiResponse<CheckVipExistsResponse>>(`/api/v1/vips/check-exists?${searchParams.toString()}`, "GET");
	},

	getById: async (id: number) => {
		return apiFetch<ApiResponse<Vip>>(`/api/v1/vips/${id}`, "GET");
	},

	create: async (payload: CreateVipPayload) => {
		return apiFetch<ApiResponse<Vip>>("/api/v1/vips", "POST", payload);
	},

	update: async (id: number, payload: UpdateVipPayload) => {
		return apiFetch<ApiResponse<Vip>>(`/api/v1/vips/${id}`, "PUT", payload);
	},

	delete: async (id: number) => {
		return apiFetch<ApiResponse<null>>(`/api/v1/vips/${id}`, "DELETE");
	},
};
