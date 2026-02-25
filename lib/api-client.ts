export interface ApiError extends Error {
	status?: number;
	error?: string;
	errors?: string[];
}

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
	if (token) {
		localStorage.setItem("auth_token", token);
		authToken = token;
	} else {
		localStorage.removeItem("auth_token");
		authToken = null;
	}
};

export const getAuthToken = () => {
	if (!authToken && typeof window !== "undefined") {
		authToken = localStorage.getItem("auth_token");
	}
	return authToken;
};

export const clearAuthToken = () => {
	localStorage.removeItem("auth_token");
	authToken = null;
};

export async function apiFetch<T>(
	url: string,
	method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
	body?: Record<string, unknown> | FormData | unknown,
	options?: { responseType?: "json" | "blob" }
): Promise<T> {
	const headers: HeadersInit = {
		Accept: options?.responseType === "blob" ? "*/*" : "application/json",
	};

	// Add Authorization header with bearer token
	if (authToken) {
		headers["Authorization"] = `Bearer ${authToken}`;
	}

	const config: RequestInit = {
		method,
		headers,
	};

	if (body) {
		if (body instanceof FormData) {
			config.body = body;
		} else {
			headers["Content-Type"] = "application/json";
			config.body = JSON.stringify(body);
		}
	}

	const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
	const res = await fetch(`${baseUrl}${url}`, config);

	if (!res.ok) {
		const errorBody = await res.json();

		const error: ApiError = new Error(errorBody.message || "An unknown API error occurred");
		error.status = res.status;
		error.error = errorBody.error;
		error.errors = errorBody.errors;
		throw error;
	}

	if (options?.responseType === "blob") {
		return res.blob() as T;
	}

	const contentType = res.headers.get("content-type");
	if (contentType && contentType.indexOf("application/json") !== -1) {
		return res.json();
	}

	return null as T;
}

export async function downloadUserFile(userId: number, fileId: number, fileName: string): Promise<void> {
	try {
		const blob = await apiFetch<Blob>(`/users/${userId}/files/${fileId}/download`, "GET", undefined, {
			responseType: "blob",
		});

		// Create download link
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = fileName;
		document.body.appendChild(link);
		link.click();

		// Cleanup
		document.body.removeChild(link);
		window.URL.revokeObjectURL(url);
	} catch (error) {
		console.error("Download failed:", error);
		throw error;
	}
}
