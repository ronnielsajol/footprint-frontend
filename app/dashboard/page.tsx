"use client";

import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { FileText, CalendarDays, Users, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
	const { user } = useAuth();

	const statsCards = [
		{
			title: "POL Deployments",
			description: "Manage POL deployment records",
			icon: FileText,
			href: "/pol-deployments",
			color: "text-blue-600",
			bgColor: "bg-blue-50",
		},
		{
			title: "W ASC Deployments",
			description: "Track W ASC deployment activities",
			icon: CalendarDays,
			href: "/w-asc-deployments",
			color: "text-green-600",
			bgColor: "bg-green-50",
		},
		{
			title: "VIPs",
			description: "Manage VIP database",
			icon: Users,
			href: "/vips",
			color: "text-purple-600",
			bgColor: "bg-purple-50",
		},
		{
			title: "Activities",
			description: "ASC Directives & Participations",
			icon: Activity,
			href: "/asc-directives",
			color: "text-orange-600",
			bgColor: "bg-orange-50",
		},
	];

	return (
		<AuthenticatedLayout>
			<div className='space-y-6'>
				{/* Header */}
				<div>
					<h1 className='text-3xl font-bold'>Welcome back, {user?.name}!</h1>
					<p className='text-muted-foreground'>Here&apos;s an overview of your ASC management system</p>
				</div>

				{/* Quick Stats Grid */}
				<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
					{statsCards.map((stat) => {
						const Icon = stat.icon;
						return (
							<Link key={stat.href} href={stat.href}>
								<Card className='cursor-pointer transition-all hover:shadow-md'>
									<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
										<CardTitle className='text-sm font-medium'>{stat.title}</CardTitle>
										<div className={`rounded-full p-2 ${stat.bgColor}`}>
											<Icon className={`h-4 w-4 ${stat.color}`} />
										</div>
									</CardHeader>
									<CardContent>
										<p className='text-xs text-muted-foreground'>{stat.description}</p>
									</CardContent>
								</Card>
							</Link>
						);
					})}
				</div>

				{/* Quick Actions */}
				<Card>
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
						<CardDescription>Common tasks and shortcuts</CardDescription>
					</CardHeader>
					<CardContent className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
						<Link href='/pol-deployments'>
							<Button variant='outline' className='w-full justify-start'>
								<FileText className='mr-2 h-4 w-4' />
								Create POL Deployment
							</Button>
						</Link>
						<Link href='/w-asc-deployments'>
							<Button variant='outline' className='w-full justify-start'>
								<CalendarDays className='mr-2 h-4 w-4' />
								Create W ASC Deployment
							</Button>
						</Link>
						<Link href='/vips'>
							<Button variant='outline' className='w-full justify-start'>
								<Users className='mr-2 h-4 w-4' />
								Add New VIP
							</Button>
						</Link>
					</CardContent>
				</Card>

				{/* Getting Started */}
				<Card>
					<CardHeader>
						<CardTitle>Getting Started</CardTitle>
						<CardDescription>Navigate through the system using the sidebar</CardDescription>
					</CardHeader>
					<CardContent className='space-y-2'>
						<p className='text-sm text-muted-foreground'>• Use the sidebar to access different modules</p>
						<p className='text-sm text-muted-foreground'>• Create and manage deployment records</p>
						<p className='text-sm text-muted-foreground'>• Track VIPs and their participation in events</p>
						<p className='text-sm text-muted-foreground'>• Record ASC directives and participations</p>
						{user?.role === "superadmin" && <p className='text-sm text-muted-foreground'>• Manage admin users (Superadmin only)</p>}
					</CardContent>
				</Card>
			</div>
		</AuthenticatedLayout>
	);
}
