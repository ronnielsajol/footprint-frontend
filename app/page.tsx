"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";

export default function Page() {
	const { user, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading) {
			if (user) {
				router.push("/dashboard");
			} else {
				router.push("/login");
			}
		}
	}, [user, isLoading, router]);

	return (
		<div className='flex min-h-screen items-center justify-center'>
			<Spinner size='lg' />
		</div>
	);
}
