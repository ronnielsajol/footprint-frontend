"use client";

import { ReactNode, useState } from "react";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Loader2, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface AuthenticatedLayoutProps {
	children: ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
	const { user, isLoading } = useRequireAuth();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	if (isLoading) {
		return (
			<div className='flex h-screen items-center justify-center'>
				<Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
			</div>
		);
	}

	if (!user) {
		return null;
	}

	return (
		<div className='flex h-screen overflow-hidden'>
			{/* Desktop Sidebar */}
			<div className='hidden md:flex'>
				<AppSidebar />
			</div>

			{/* Main Content */}
			<main className='flex-1 overflow-y-auto bg-muted/30'>
				{/* Mobile Header */}
				<div className='sticky top-0 z-10 flex items-center gap-2 border-b bg-background p-3 md:hidden'>
					<Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
						<SheetTrigger className='rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-muted'>
							<Menu className='h-5 w-5' />
						</SheetTrigger>
						<SheetContent side='left' className='w-64 p-0'>
							<AppSidebar mobile onNavigate={() => setMobileMenuOpen(false)} />
						</SheetContent>
					</Sheet>
					<h2 className='text-lg font-bold'>Footprint</h2>
				</div>

				{/* Page Content */}
				<div className='container mx-auto p-4 md:p-6'>{children}</div>
			</main>
		</div>
	);
}
