"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Eye, Edit, Loader2, AlertCircle, MapPin, Calendar } from "lucide-react";
import Link from "next/link";
import { polDeploymentsApi } from "@/lib/api/pol-deployments";
import { PolDeploymentFilters, SourceType } from "@/types";

const MONTH_NAMES = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

export default function PolDeploymentsPage() {
	const router = useRouter();
	const [filters, setFilters] = useState<PolDeploymentFilters>({
		search: "",
		year: new Date().getFullYear(),
		per_page: 20,
	});

	const { data, isLoading, error } = useQuery({
		queryKey: ["pol-deployments", filters],
		queryFn: async () => {
			const response = await polDeploymentsApi.getAll(filters);
			return response.data;
		},
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
						<CardDescription>
							{data?.meta
								? `${data.meta.total} total record${data.meta.total !== 1 ? "s" : ""}`
								: "View and manage all POL deployments"}
						</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoading && (
							<div className='flex items-center justify-center py-8'>
								<Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
								<span className='ml-2 text-muted-foreground'>Loading deployments...</span>
							</div>
						)}

						{error && (
							<div className='flex items-center justify-center py-8 text-destructive'>
								<AlertCircle className='h-5 w-5 mr-2' />
								<span>Failed to load deployments</span>
							</div>
						)}

						{!isLoading && !error && data?.data?.length === 0 && (
							<div className='text-center py-8 text-muted-foreground'>
								<p>No deployments found</p>
								<Link href='/pol-deployments/create'>
									<Button variant='outline' size='sm' className='mt-4'>
										<Plus className='h-4 w-4 mr-2' />
										Create First Deployment
									</Button>
								</Link>
							</div>
						)}

						{!isLoading && !error && data && data.data && data.data.length > 0 && (
							<div className='space-y-4'>
								{/* Mobile: Card View */}
								<div className='block md:hidden space-y-3'>
									{data.data.map((deployment) => (
										<Card key={deployment.id} className='p-4'>
											<div className='space-y-3'>
												<div className='flex items-start justify-between gap-3'>
													<div className='space-y-1 flex-1 min-w-0'>
														<span className='font-semibold truncate block'>{deployment.event_name}</span>
														<div className='flex items-center gap-2 text-sm text-muted-foreground'>
															<MapPin className='h-3 w-3 shrink-0' />
															<span className='truncate'>
																{deployment.exact_venue}
																{deployment.lgu ? `, ${deployment.lgu}` : ""}
															</span>
														</div>
														<div className='flex items-center gap-2 text-sm text-muted-foreground'>
															<Calendar className='h-3 w-3 shrink-0' />
															<span>
																{MONTH_NAMES[deployment.deployment_month - 1]} {deployment.deployment_year}
															</span>
														</div>
													</div>
													{deployment.source && (
														<Badge variant='outline' className='shrink-0'>
															{deployment.source}
														</Badge>
													)}
												</div>
												<div className='flex gap-2 pt-2 border-t'>
													<Button size='sm' variant='outline' className='flex-1' onClick={() => router.push(`/pol-deployments/${deployment.id}`)}>
														<Eye className='mr-2 h-4 w-4' />
														View
													</Button>
													<Button
														size='sm'
														variant='outline'
														className='flex-1'
														onClick={() => router.push(`/pol-deployments/${deployment.id}/edit`)}>
														<Edit className='mr-2 h-4 w-4' />
														Edit
													</Button>
												</div>
											</div>
										</Card>
									))}
								</div>

								{/* Desktop: Table View */}
								<div className='hidden md:block overflow-x-auto'>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>ID</TableHead>
												<TableHead>Event Name</TableHead>
												<TableHead>Venue / LGU</TableHead>
												<TableHead>Date</TableHead>
												<TableHead>POL Officer</TableHead>
												<TableHead>Source</TableHead>
												<TableHead className='text-right'>Actions</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{data.data.map((deployment) => (
												<TableRow key={deployment.id}>
													<TableCell className='font-medium'>{deployment.id}</TableCell>
													<TableCell className='max-w-50 truncate font-medium'>{deployment.event_name}</TableCell>
													<TableCell>
														<div className='flex items-center gap-2'>
															<MapPin className='h-4 w-4 text-muted-foreground shrink-0' />
															<span className='max-w-45 truncate'>
																{deployment.exact_venue}
																{deployment.lgu ? `, ${deployment.lgu}` : ""}
															</span>
														</div>
													</TableCell>
													<TableCell>
														<div className='flex items-center gap-2'>
															<Calendar className='h-4 w-4 text-muted-foreground shrink-0' />
															<span>
																{MONTH_NAMES[deployment.deployment_month - 1]} {deployment.deployment_year}
															</span>
														</div>
													</TableCell>
													<TableCell>{deployment.pol_officer ?? <span className='text-muted-foreground'>N/A</span>}</TableCell>
													<TableCell>
														{deployment.source ? (
															<Badge variant='outline'>{deployment.source}</Badge>
														) : (
															<span className='text-muted-foreground'>N/A</span>
														)}
													</TableCell>
													<TableCell className='text-right'>
														<div className='flex gap-2 justify-end'>
															<Button size='sm' variant='outline' onClick={() => router.push(`/pol-deployments/${deployment.id}`)}>
																<Eye className='mr-2 h-4 w-4' />
																View
															</Button>
															<Button size='sm' variant='outline' onClick={() => router.push(`/pol-deployments/${deployment.id}/edit`)}>
																<Edit className='mr-2 h-4 w-4' />
																Edit
															</Button>
														</div>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>

								{/* Pagination info */}
								{data.meta && (
									<p className='text-sm text-muted-foreground text-right'>
										Showing {data.meta.from ?? 0}–{data.meta.to ?? 0} of {data.meta.total}
									</p>
								)}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</AuthenticatedLayout>
	);
}
