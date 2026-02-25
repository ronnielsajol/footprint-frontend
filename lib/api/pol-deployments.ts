import type {
	ApiResponse,
	PaginatedResponse,
	PolDeployment,
	CreatePolDeploymentPayload,
	UpdatePolDeploymentPayload,
	PolDeploymentFilters,
	AddVipToDeploymentPayload,
	Vip,
} from "@/types";
import { apiFetch } from "../api-client";

export const polDeploymentsApi = {
	getAll: async (filters?: PolDeploymentFilters) => {
		const params = new URLSearchParams();
		if (filters) {
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					params.append(key, String(value));
				}
			});
		}
		const queryString = params.toString();
		const url = `/api/v1/pol-deployments${queryString ? `?${queryString}` : ""}`;
		return apiFetch<ApiResponse<PaginatedResponse<PolDeployment>>>(url, "GET");
	},

	getById: async (id: number) => {
		return apiFetch<ApiResponse<PolDeployment>>(`/api/v1/pol-deployments/${id}`, "GET");
	},

	create: async (payload: CreatePolDeploymentPayload) => {
		return apiFetch<ApiResponse<PolDeployment>>("/api/v1/pol-deployments", "POST", payload);
	},

	update: async (id: number, payload: UpdatePolDeploymentPayload) => {
		return apiFetch<ApiResponse<PolDeployment>>(`/api/v1/pol-deployments/${id}`, "PUT", payload);
	},

	delete: async (id: number) => {
		return apiFetch<ApiResponse<null>>(`/api/v1/pol-deployments/${id}`, "DELETE");
	},

	getVips: async (id: number) => {
		return apiFetch<ApiResponse<Vip[]>>(`/api/v1/pol-deployments/${id}/vips`, "GET");
	},

	addVip: async (id: number, payload: AddVipToDeploymentPayload) => {
		return apiFetch<ApiResponse<Vip>>(`/api/v1/pol-deployments/${id}/vips`, "POST", payload);
	},

	removeVip: async (id: number, vipId: number) => {
		return apiFetch<ApiResponse<null>>(`/api/v1/pol-deployments/${id}/vips/${vipId}`, "DELETE");
	},
};
