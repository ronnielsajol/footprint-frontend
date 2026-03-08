"use client";

import { useState } from "react";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Eye, Edit, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { WAscDeploymentsApi } from "@/lib/api/w-asc-deployments";
import type { WAscDeploymentFilters, SectorType, WAscDeployment } from "@/types";

export default function WAscDeploymentsPage() {
	const router = useRouter();

	const [filters, setFilters] = useState<WAscDeploymentFilters>({
		search: "",
		year: new Date().getFullYear(),
	});

	// Fetch deployments with filters
	const { data, isLoading, error } = useQuery({
		queryKey: ["w-asc-deployments", filters],
		queryFn: async () => {
			const response = await WAscDeploymentsApi.getAll(filters);
			return response.data;
		},
	});

	return (
		<AuthenticatedLayout>
			<div className='space-y-6'>
				{/* Header */}
				<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
					<div>
						<h1 className='text-2xl sm:text-3xl font-bold'>W ASC Deployments</h1>
						<p className='text-muted-foreground'>Manage W ASC deployment activities</p>
					</div>
					<Button onClick={() => router.push("/w-asc-deployments/create")} className='w-full sm:w-auto'>
						<Plus className='mr-2 h-4 w-4' />
						New Deployment
					</Button>
				</div>

				{/* Filters */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<Filter className='h-5 w-5' />
							Filters
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='grid gap-4 md:grid-cols-3'>
							<div className='space-y-2'>
								<label className='text-sm font-medium'>Search</label>
								<div className='relative'>
									<Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
									<Input
										placeholder='Venue, municipality...'
										className='pl-8'
										value={filters.search}
										onChange={(e) => setFilters({ ...filters, search: e.target.value })}
									/>
								</div>
							</div>
							<div className='space-y-2'>
								<label className='text-sm font-medium'>Year</label>
								<Select
									value={filters.year?.toString()}
									onValueChange={(value) => setFilters({ ...filters, year: value ? parseInt(value) : undefined })}>
									<SelectTrigger>
										<SelectValue />
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
								<label className='text-sm font-medium'>Sector</label>
								<Select
									value={filters.sector || "All Sectors"}
									onValueChange={(value) => setFilters({ ...filters, sector: value === "all" ? undefined : (value as SectorType) })}>
									<SelectTrigger>
										<SelectValue placeholder='All sectors' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='all'>All Sectors</SelectItem>
										<SelectItem value='PTK'>PTK</SelectItem>
										<SelectItem value='Kababaihan'>Kababaihan</SelectItem>
										<SelectItem value='MSMEs'>MSMEs</SelectItem>
										<SelectItem value='Youth'>Youth</SelectItem>
										<SelectItem value='BHW'>BHW</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Deployments List */}
				<Card>
					<CardHeader>
						<CardTitle>Deployment Records</CardTitle>
						<CardDescription>View and manage W ASC deployments</CardDescription>
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
								<p>No W ASC deployments found</p>
								<Button variant='outline' size='sm' className='mt-4' onClick={() => router.push("/w-asc-deployments/create")}>
									<Plus className='h-4 w-4 mr-2' />
									Create First Deployment
								</Button>
							</div>
						)}

						{!isLoading && !error && data && data.data && data.data.length > 0 && (
							<div className='space-y-4'>
								{/* Mobile: Card View */}
								<div className='block md:hidden space-y-3'>
									{data.data.map((deployment: WAscDeployment) => (
										<Card key={deployment.id} className='p-4'>
											<div className='space-y-3'>
												<div className='flex items-start justify-between gap-3'>
													<div className='space-y-1 flex-1 min-w-0'>
														<div className='font-semibold truncate'>{deployment.exact_venue}</div>
														<div className='text-sm text-muted-foreground truncate'>
															{deployment.city_municipality || deployment.barangay || "N/A"}
														</div>
														<div className='flex gap-2 items-center text-sm'>
															<span className='text-muted-foreground'>
																{deployment.deployment_year}/{deployment.deployment_month}
															</span>
															<span>•</span>
															<span>{new Date(deployment.exact_date).toLocaleDateString()}</span>
														</div>
													</div>
													{deployment.sector && (
														<Badge variant='outline' className='shrink-0'>
															{deployment.sector}
														</Badge>
													)}
												</div>
												<div className='flex gap-2 pt-2 border-t'>
													<Button
														size='sm'
														variant='outline'
														className='flex-1'
														onClick={() => router.push(`/w-asc-deployments/${deployment.id}`)}>
														<Eye className='mr-2 h-4 w-4' />
														View
													</Button>
													<Button
														size='sm'
														variant='outline'
														className='flex-1'
														onClick={() => router.push(`/w-asc-deployments/${deployment.id}/edit`)}>
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
												<TableHead>Year</TableHead>
												<TableHead>Month</TableHead>
												<TableHead>Venue</TableHead>
												<TableHead>Sector</TableHead>
												<TableHead>Location</TableHead>
												<TableHead>Date</TableHead>
												<TableHead className='text-right'>Actions</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{data.data.map((deployment: WAscDeployment) => (
												<TableRow key={deployment.id}>
													<TableCell className='font-medium'>{deployment.id}</TableCell>
													<TableCell>{deployment.deployment_year}</TableCell>
													<TableCell>{deployment.deployment_month}</TableCell>
													<TableCell className='max-w-xs truncate'>{deployment.exact_venue}</TableCell>
													<TableCell>
														{deployment.sector ? (
															<Badge variant='outline'>{deployment.sector}</Badge>
														) : (
															<span className='text-muted-foreground'>N/A</span>
														)}
													</TableCell>
													<TableCell>{deployment.city_municipality || deployment.barangay || "N/A"}</TableCell>
													<TableCell>{new Date(deployment.exact_date).toLocaleDateString()}</TableCell>
													<TableCell className='text-right'>
														<div className='flex items-center justify-end gap-2'>
															<Button size='sm' variant='ghost' onClick={() => router.push(`/w-asc-deployments/${deployment.id}`)}>
																<Eye className='h-4 w-4' />
															</Button>
															<Button size='sm' variant='ghost' onClick={() => router.push(`/w-asc-deployments/${deployment.id}/edit`)}>
																<Edit className='h-4 w-4' />
															</Button>
														</div>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>

								{data.meta && (
									<p className='text-sm text-muted-foreground text-center'>
										Showing {data.data.length} of {data.meta.total} deployments
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
