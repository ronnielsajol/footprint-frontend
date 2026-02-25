"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types";
import { setAuthToken, clearAuthToken, getAuthToken } from "@/lib/api-client";
import { authApi } from "@/lib/api/auth";

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	// Check authentication on mount
	useEffect(() => {
		const initAuth = async () => {
			const token = getAuthToken();
			if (token) {
				try {
					const response = await authApi.me();
					if (response.success && response.data) {
						setUser(response.data);
					} else {
						clearAuthToken();
					}
				} catch (error) {
					console.error("Auth check failed:", error);
					clearAuthToken();
				}
			}
			setIsLoading(false);
		};

		initAuth();
	}, []);

	const login = async (email: string, password: string) => {
		try {
			const response = await authApi.login({ email, password });
			if (response.success && response.data) {
				setAuthToken(response.data.token);
				setUser(response.data.user);
				router.push("/dashboard");
			} else {
				throw new Error(response.message || "Login failed");
			}
		} catch (error) {
			console.error("Login error:", error);
			throw error;
		}
	};

	const logout = async () => {
		try {
			await authApi.logout();
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			clearAuthToken();
			setUser(null);
			router.push("/login");
		}
	};

	const refreshUser = async () => {
		const token = getAuthToken();
		if (!token) return;

		try {
			const response = await authApi.me();
			if (response.success && response.data) {
				setUser(response.data);
			}
		} catch (error) {
			console.error("Failed to refresh user:", error);
			clearAuthToken();
			setUser(null);
		}
	};

	return <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
