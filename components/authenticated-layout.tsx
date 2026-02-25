"use client";

import { ReactNode } from "react";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { AppSidebar } from "@/components/app-sidebar";
import { Spinner } from "@/components/ui/spinner";

interface AuthenticatedLayoutProps {
	children: ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
	const { user, isLoading } = useRequireAuth();

	if (isLoading) {
		return (
			<div className='flex h-screen items-center justify-center'>
				<Spinner size='lg' />
			</div>
		);
	}

	if (!user) {
		return null;
	}

	return (
		<div className='flex h-screen overflow-hidden'>
			<AppSidebar />
			<main className='flex-1 overflow-y-auto bg-muted/30'>
				<div className='container mx-auto p-6'>{children}</div>
			</main>
		</div>
	);
}
