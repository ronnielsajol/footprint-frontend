"use client";

import { useAuth } from "./use-auth";
import { UserRole } from "@/types";

export function useRoleCheck(allowedRoles: UserRole[]) {
	const { user } = useAuth();

	const hasAccess = Boolean(user && allowedRoles.includes(user.role));

	return { hasAccess, userRole: user?.role };
}
