import type {
	ApiResponse,
	AscDirective,
	CreateAscDirectivePayload,
	UpdateAscDirectivePayload,
	DeploymentType,
} from "@/types";
import { apiFetch } from "../api-client";

export const ascDirectivesApi = {
	getForDeployment: async (deploymentType: DeploymentType, deploymentId: number) => {
		return apiFetch<ApiResponse<AscDirective[]>>(`/api/v1/${deploymentType}/${deploymentId}/asc-directives`, "GET");
	},

	create: async (deploymentType: DeploymentType, deploymentId: number, payload: CreateAscDirectivePayload) => {
		return apiFetch<ApiResponse<AscDirective>>(`/api/v1/${deploymentType}/${deploymentId}/asc-directives`, "POST", payload);
	},

	getById: async (id: number) => {
		return apiFetch<ApiResponse<AscDirective>>(`/api/v1/asc-directives/${id}`, "GET");
	},

	update: async (id: number, payload: UpdateAscDirectivePayload) => {
		return apiFetch<ApiResponse<AscDirective>>(`/api/v1/asc-directives/${id}`, "PUT", payload);
	},

	delete: async (id: number) => {
		return apiFetch<ApiResponse<null>>(`/api/v1/asc-directives/${id}`, "DELETE");
	},
};
