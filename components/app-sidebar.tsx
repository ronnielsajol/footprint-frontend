"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { LayoutDashboard, FileText, Users, CalendarDays, FileCheck, UsersRound, Settings, LogOut } from "lucide-react";

interface NavItem {
	title: string;
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	allowedRoles?: ("superadmin" | "pol_admin")[];
}

const navItems: NavItem[] = [
	{
		title: "Dashboard",
		href: "/dashboard",
		icon: LayoutDashboard,
	},
	{
		title: "POL Deployments",
		href: "/pol-deployments",
		icon: FileText,
	},
	{
		title: "W ASC Deployments",
		href: "/w-asc-deployments",
		icon: CalendarDays,
	},
	{
		title: "VIPs",
		href: "/vips",
		icon: Users,
	},
	{
		title: "ASC Directives",
		href: "/asc-directives",
		icon: FileCheck,
	},
	{
		title: "ASC Participations",
		href: "/asc-participations",
		icon: UsersRound,
	},
	{
		title: "Admin Management",
		href: "/admin-management",
		icon: Settings,
		allowedRoles: ["superadmin"],
	},
];

export function AppSidebar() {
	const pathname = usePathname();
	const { user, logout } = useAuth();

	const filteredNavItems = navItems.filter((item) => {
		if (!item.allowedRoles) return true;
		return user && item.allowedRoles.includes(user.role);
	});

	return (
		<div className='flex h-full w-64 flex-col border-r bg-background'>
			{/* Header */}
			<div className='border-b p-6'>
				<h2 className='text-xl font-bold'>Footprint</h2>
				<p className='text-sm text-muted-foreground'>ASC Management</p>
			</div>

			{/* Navigation */}
			<ScrollArea className='flex-1 px-3 py-4'>
				<div className='space-y-1'>
					{filteredNavItems.map((item) => {
						const Icon = item.icon;
						const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

						return (
							<Link key={item.href} href={item.href}>
								<Button
									variant={isActive ? "secondary" : "ghost"}
									className={cn("w-full justify-start gap-3", {
										"bg-secondary": isActive,
									})}>
									<Icon className='h-4 w-4' />
									<span>{item.title}</span>
								</Button>
							</Link>
						);
					})}
				</div>
			</ScrollArea>

			{/* User Info & Logout */}
			<div className='border-t p-4'>
				<div className='mb-3 px-3'>
					<p className='text-sm font-medium'>{user?.name}</p>
					<p className='text-xs text-muted-foreground'>{user?.email}</p>
					<p className='mt-1 text-xs font-medium capitalize text-primary'>{user?.role?.replace("_", " ")}</p>
				</div>
				<Button variant='outline' className='w-full justify-start gap-3' onClick={logout}>
					<LogOut className='h-4 w-4' />
					<span>Logout</span>
				</Button>
			</div>
		</div>
	);
}
