"use client";

import { useState } from "react";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter } from "lucide-react";
import Link from "next/link";
import { PolDeploymentFilters, SourceType } from "@/types";

export default function PolDeploymentsPage() {
	const [filters, setFilters] = useState<PolDeploymentFilters>({
		search: "",
		year: new Date().getFullYear(),
		per_page: 20,
	});

	return (
		<AuthenticatedLayout>
			<div className='space-y-6'>
				{/* Header */}
				<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
					<div>
						<h1 className='text-2xl sm:text-3xl font-bold'>POL Deployments</h1>
						<p className='text-muted-foreground'>Manage POL deployment records</p>
					</div>
					<Link href='/pol-deployments/create'>
						<Button className='w-full sm:w-auto'>
							<Plus className='mr-2 h-4 w-4' />
							New Deployment
						</Button>
					</Link>
				</div>

				{/* Filters */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<Filter className='h-5 w-5' />
							Filters
						</CardTitle>
						<CardDescription>Filter and search deployment records</CardDescription>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
							<div className='space-y-2'>
								<label className='text-sm font-medium'>Search</label>
								<div className='relative'>
									<Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
									<Input
										placeholder='Event name, venue, LGU...'
										className='pl-8'
										value={filters.search}
										onChange={(e) => setFilters({ ...filters, search: e.target.value })}
									/>
								</div>
							</div>
							<div className='space-y-2'>
								<label className='text-sm font-medium'>Year</label>
								<Select
									value={filters.year?.toString() || ""}
									onValueChange={(value) => setFilters({ ...filters, year: value ? parseInt(value) : undefined })}>
									<SelectTrigger>
										<SelectValue placeholder='Select year' />
									</SelectTrigger>
									<SelectContent>
										{Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
											<SelectItem key={year} value={year.toString()}>
												{year}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className='space-y-2'>
								<label className='text-sm font-medium'>Month</label>
								<Select
									value={filters.month?.toString() || "all"}
									onValueChange={(value) => {
										if (!value) return;
										setFilters({ ...filters, month: value === "all" ? undefined : parseInt(value) });
									}}>
									<SelectTrigger>
										<SelectValue>
											{filters.month ? new Date(2000, filters.month - 1).toLocaleString("en", { month: "long" }) : "All months"}
										</SelectValue>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='all'>All months</SelectItem>
										{Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
											<SelectItem key={month} value={month.toString()}>
												{new Date(2000, month - 1).toLocaleString("en", { month: "long" })}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className='space-y-2'>
								<label className='text-sm font-medium'>Source</label>
								<Select
									value={filters.source || "all"}
									onValueChange={(value) => setFilters({ ...filters, source: value === "all" ? undefined : (value as SourceType) })}>
									<SelectTrigger>
										<SelectValue>{filters.source || "All sources"}</SelectValue>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='all'>All sources</SelectItem>
										<SelectItem value='TESDA'>TESDA</SelectItem>
										<SelectItem value='DSWD-AICS'>DSWD-AICS</SelectItem>
										<SelectItem value='DOLE-DILP'>DOLE-DILP</SelectItem>
										<SelectItem value='DOLE-TUPAD'>DOLE-TUPAD</SelectItem>
										<SelectItem value='DOH-MAIFIP'>DOH-MAIFIP</SelectItem>
										<SelectItem value='Private'>Private</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className='flex gap-2'>
							<Button
								variant='outline'
								size='sm'
								onClick={() =>
									setFilters({ per_page: 20, year: new Date().getFullYear(), month: undefined, source: undefined, search: "" })
								}>
								Clear Filters
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Deployments List */}
				<Card>
					<CardHeader>
						<CardTitle>Deployment Records</CardTitle>
						<CardDescription>View and manage all POL deployments</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='text-center py-8 text-muted-foreground'>
							<p>Deployment list will be loaded here</p>
							<p className='text-sm mt-2'>Connect to API to display records</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</AuthenticatedLayout>
	);
}
