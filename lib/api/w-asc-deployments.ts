import type {
	ApiResponse,
	PaginatedResponse,
	WAscDeployment,
	CreateWAscDeploymentPayload,
	UpdateWAscDeploymentPayload,
	WAscDeploymentFilters,
	WAscDeploymentOfficer,
	AddOfficerPayload,
	UpdateOfficerPayload,
	AddVipToDeploymentPayload,
	Vip,
} from "@/types";
import { apiFetch } from "../api-client";

export const WAscDeploymentsApi = {
	getAll: async (filters?: WAscDeploymentFilters) => {
		const params = new URLSearchParams();
		if (filters) {
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					params.append(key, String(value));
				}
			});
		}
		const queryString = params.toString();
		const url = `/api/v1/w-asc-deployments${queryString ? `?${queryString}` : ""}`;
		return apiFetch<ApiResponse<PaginatedResponse<WAscDeployment>>>(url, "GET");
	},

	getById: async (id: number) => {
		return apiFetch<ApiResponse<WAscDeployment>>(`/api/v1/w-asc-deployments/${id}`, "GET");
	},

	create: async (payload: CreateWAscDeploymentPayload) => {
		return apiFetch<ApiResponse<WAscDeployment>>("/api/v1/w-asc-deployments", "POST", payload);
	},

	update: async (id: number, payload: UpdateWAscDeploymentPayload) => {
		return apiFetch<ApiResponse<WAscDeployment>>(`/api/v1/w-asc-deployments/${id}`, "PUT", payload);
	},

	delete: async (id: number) => {
		return apiFetch<ApiResponse<null>>(`/api/v1/w-asc-deployments/${id}`, "DELETE");
	},

	// Officers
	getOfficers: async (id: number) => {
		return apiFetch<ApiResponse<WAscDeploymentOfficer[]>>(`/api/v1/w-asc-deployments/${id}/officers`, "GET");
	},

	addOfficer: async (id: number, payload: AddOfficerPayload) => {
		return apiFetch<ApiResponse<WAscDeploymentOfficer>>(`/api/v1/w-asc-deployments/${id}/officers`, "POST", payload);
	},

	updateOfficer: async (id: number, officerId: number, payload: UpdateOfficerPayload) => {
		return apiFetch<ApiResponse<WAscDeploymentOfficer>>(
			`/api/v1/w-asc-deployments/${id}/officers/${officerId}`,
			"PUT",
			payload
		);
	},

	removeOfficer: async (id: number, officerId: number) => {
		return apiFetch<ApiResponse<null>>(`/api/v1/w-asc-deployments/${id}/officers/${officerId}`, "DELETE");
	},

	// VIPs
	getVips: async (id: number) => {
		return apiFetch<ApiResponse<Vip[]>>(`/api/v1/w-asc-deployments/${id}/vips`, "GET");
	},

	addVip: async (id: number, payload: AddVipToDeploymentPayload) => {
		return apiFetch<ApiResponse<Vip>>(`/api/v1/w-asc-deployments/${id}/vips`, "POST", payload);
	},

	removeVip: async (id: number, vipId: number) => {
		return apiFetch<ApiResponse<null>>(`/api/v1/w-asc-deployments/${id}/vips/${vipId}`, "DELETE");
	},
};
