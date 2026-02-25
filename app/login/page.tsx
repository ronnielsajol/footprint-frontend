"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";

export default function LoginPage() {
	const { user, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		// Redirect to dashboard if already logged in
		if (!isLoading && user) {
			router.push("/dashboard");
		}
	}, [user, isLoading, router]);

	if (isLoading) {
		return (
			<div className='flex min-h-screen items-center justify-center'>
				<Spinner />
			</div>
		);
	}

	if (user) {
		return null; // Will redirect
	}

	return (
		<div className='flex min-h-screen items-center justify-center bg-muted/30 p-4'>
			<div className='w-full max-w-md space-y-6'>
				<div className='text-center'>
					<h1 className='text-4xl font-bold'>Footprint</h1>
					<p className='mt-2 text-muted-foreground'>ASC Management System</p>
				</div>
				<LoginForm />
			</div>
		</div>
	);
}
