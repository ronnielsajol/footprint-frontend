import type {
	ApiResponse,
	AscParticipation,
	CreateAscParticipationPayload,
	UpdateAscParticipationPayload,
	DeploymentType,
} from "@/types";
import { apiFetch } from "../api-client";

export const ascParticipationsApi = {
	getForDeployment: async (deploymentType: DeploymentType, deploymentId: number) => {
		return apiFetch<ApiResponse<AscParticipation[]>>(`/api/v1/${deploymentType}/${deploymentId}/asc-participation`, "GET");
	},

	create: async (deploymentType: DeploymentType, deploymentId: number, payload: CreateAscParticipationPayload) => {
		return apiFetch<ApiResponse<AscParticipation>>(
			`/api/v1/${deploymentType}/${deploymentId}/asc-participation`,
			"POST",
			payload
		);
	},

	getById: async (id: number) => {
		return apiFetch<ApiResponse<AscParticipation>>(`/api/v1/asc-participation/${id}`, "GET");
	},

	update: async (id: number, payload: UpdateAscParticipationPayload) => {
		return apiFetch<ApiResponse<AscParticipation>>(`/api/v1/asc-participation/${id}`, "PUT", payload);
	},

	delete: async (id: number) => {
		return apiFetch<ApiResponse<null>>(`/api/v1/asc-participation/${id}`, "DELETE");
	},
};
