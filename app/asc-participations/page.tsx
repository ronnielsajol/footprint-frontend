"use client";

import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { UsersRound, Users, Loader2, AlertCircle, Calendar, MapPin, Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { polDeploymentsApi } from "@/lib/api/pol-deployments";
import { WAscDeploymentsApi } from "@/lib/api/w-asc-deployments";
import { useRouter } from "next/navigation";
import type { WAscDeployment } from "@/types";

export default function AscParticipationsPage() {
	const router = useRouter();

	// Fetch POL deployments
	const {
		data: polData,
		isLoading: polLoading,
		error: polError,
	} = useQuery({
		queryKey: ["pol-deployments"],
		queryFn: async () => {
			const response = await polDeploymentsApi.getAll();
			return response.data;
		},
	});

	// Fetch W ASC deployments
	const {
		data: wascData,
		isLoading: wascLoading,
		error: wascError,
	} = useQuery({
		queryKey: ["w-asc-deployments"],
		queryFn: async () => {
			const response = await WAscDeploymentsApi.getAll();
			return response.data;
		},
	});

	return (
		<AuthenticatedLayout>
			<div className='space-y-6'>
				{/* Header */}
				<div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2'>
					<UsersRound className='h-6 w-6 sm:h-8 sm:w-8' />
					<div>
						<h1 className='text-2xl sm:text-3xl font-bold'>ASC Participations</h1>
						<p className='text-sm text-muted-foreground'>Track participant records for deployments</p>
					</div>
				</div>

				{/* Tabs for deployment types */}
				<Tabs defaultValue='pol' className='space-y-4'>
					<TabsList className='w-full sm:w-auto'>
						<TabsTrigger value='pol' className='flex-1 sm:flex-none'>
							POL Deployments
						</TabsTrigger>
						<TabsTrigger value='wasc' className='flex-1 sm:flex-none'>
							W ASC Deployments
						</TabsTrigger>
					</TabsList>

					<TabsContent value='pol' className='space-y-4'>
						<Card>
							<CardHeader>
								<CardTitle>POL Deployment Participations</CardTitle>
								<CardDescription>Select a deployment to view and manage participation records</CardDescription>
							</CardHeader>
							<CardContent>
								{polLoading && (
									<div className='flex items-center justify-center py-8'>
										<Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
										<span className='ml-2 text-muted-foreground'>Loading deployments...</span>
									</div>
								)}

								{polError && (
									<div className='flex items-center justify-center py-8 text-destructive'>
										<AlertCircle className='h-5 w-5 mr-2' />
										<span>Failed to load POL deployments</span>
									</div>
								)}

								{!polLoading && !polError && polData?.data?.length === 0 && (
									<div className='text-center py-8 text-muted-foreground'>
										<p>No POL deployments found</p>
									</div>
								)}

								{!polLoading && !polError && polData && polData.data && polData.data.length > 0 && (
									<div className='space-y-4'>
										{/* Mobile: Card View */}
										<div className='block md:hidden space-y-3'>
											{polData.data.map((deployment) => (
												<Card key={deployment.id} className='p-4'>
													<div className='space-y-3'>
														<div className='space-y-2'>
															<div className='font-semibold text-lg'>{deployment.event_name}</div>
															<div className='flex items-center gap-2 text-sm text-muted-foreground'>
																<Calendar className='h-3 w-3 shrink-0' />
																<span>
																	{deployment.deployment_month} {deployment.deployment_year}
																</span>
															</div>
															<div className='flex items-center gap-2 text-sm text-muted-foreground'>
																<MapPin className='h-3 w-3 shrink-0' />
																<span>{deployment.district || "N/A"}</span>
															</div>
														</div>
														<Button
															size='sm'
															variant='outline'
															className='w-full'
															onClick={() => router.push(`/asc-participations/pol-deployment/${deployment.id}`)}>
															<Users className='h-4 w-4 mr-2' />
															View Participations
														</Button>
													</div>
												</Card>
											))}
										</div>

										{/* Desktop: Table View */}
										<div className='hidden md:block overflow-x-auto'>
											<Table>
												<TableHeader>
													<TableRow>
														<TableHead>Year</TableHead>
														<TableHead>Month</TableHead>
														<TableHead>Event</TableHead>
														<TableHead>District</TableHead>
														<TableHead className='text-right'>Actions</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{polData.data.map((deployment) => (
														<TableRow key={deployment.id}>
															<TableCell>{deployment.deployment_year}</TableCell>
															<TableCell>{deployment.deployment_month}</TableCell>
															<TableCell>{deployment.event_name}</TableCell>
															<TableCell>{deployment.district || "N/A"}</TableCell>
															<TableCell className='text-right'>
																<Button size='sm' variant='outline' onClick={() => router.push(`/asc-participations/pol-deployment/${deployment.id}`)}>
																	<Users className='h-4 w-4 mr-1' />
																	View Participations
																</Button>
															</TableCell>
														</TableRow>
													))}
												</TableBody>
											</Table>
										</div>

										{polData.meta && (
											<p className='text-sm text-muted-foreground text-center'>
												Showing {polData.data.length} of {polData.meta.total} deployments
											</p>
										)}
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value='wasc' className='space-y-4'>
						<Card>
							<CardHeader>
								<CardTitle>W ASC Deployment Participations</CardTitle>
								<CardDescription>Select a deployment to view and manage participation records</CardDescription>
							</CardHeader>
							<CardContent>
								{wascLoading && (
									<div className='flex items-center justify-center py-8'>
										<Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
										<span className='ml-2 text-muted-foreground'>Loading deployments...</span>
									</div>
								)}

								{wascError && (
									<div className='flex items-center justify-center py-8 text-destructive'>
										<AlertCircle className='h-5 w-5 mr-2' />
										<span>Failed to load W ASC deployments</span>
									</div>
								)}

								{!wascLoading && !wascError && wascData?.data?.length === 0 && (
									<div className='text-center py-8 text-muted-foreground'>
										<p>No W ASC deployments found</p>
									</div>
								)}

								{!wascLoading && !wascError && wascData && wascData.data && wascData.data.length > 0 && (
									<div className='space-y-4'>
										{/* Mobile: Card View */}
										<div className='block md:hidden space-y-3'>
											{wascData.data.map((deployment: WAscDeployment) => (
												<Card key={deployment.id} className='p-4'>
													<div className='space-y-3'>
														<div className='space-y-2'>
															<div className='font-semibold text-lg'>{deployment.exact_venue}</div>
															<div className='flex items-center gap-2 text-sm text-muted-foreground'>
																<Calendar className='h-3 w-3 shrink-0' />
																<span>
																	{deployment.deployment_month} {deployment.deployment_year}
																</span>
															</div>
															<div className='flex items-center gap-2 text-sm text-muted-foreground'>
																<Building2 className='h-3 w-3 shrink-0' />
																<span>{deployment.sector || "N/A"}</span>
															</div>
														</div>
														<Button
															size='sm'
															variant='outline'
															className='w-full'
															onClick={() => router.push(`/asc-participations/w-asc-deployment/${deployment.id}`)}>
															<Users className='h-4 w-4 mr-2' />
															View Participations
														</Button>
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
														<TableHead className='text-right'>Actions</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{wascData.data.map((deployment: WAscDeployment) => (
														<TableRow key={deployment.id}>
															<TableCell className='font-medium'>{deployment.id}</TableCell>
															<TableCell>{deployment.deployment_year}</TableCell>
															<TableCell>{deployment.deployment_month}</TableCell>
															<TableCell className='max-w-xs truncate'>{deployment.exact_venue}</TableCell>
															<TableCell>{deployment.sector || "N/A"}</TableCell>
															<TableCell className='text-right'>
																<Button
																	size='sm'
																	variant='outline'
																	onClick={() => router.push(`/asc-participations/w-asc-deployment/${deployment.id}`)}>
																	<Users className='h-4 w-4 mr-1' />
																	View Participations
																</Button>
															</TableCell>
														</TableRow>
													))}
												</TableBody>
											</Table>
										</div>

										{wascData.meta && (
											<p className='text-sm text-muted-foreground text-center'>
												Showing {wascData.data.length} of {wascData.meta.total} deployments
											</p>
										)}
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</AuthenticatedLayout>
	);
}
