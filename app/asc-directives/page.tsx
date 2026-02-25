"use client";

import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileCheck, FileText, Loader2, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { polDeploymentsApi } from "@/lib/api/pol-deployments";
import { WAscDeploymentsApi } from "@/lib/api/w-asc-deployments";
import { useRouter } from "next/navigation";
import type { WAscDeployment } from "@/types";

export default function AscDirectivesPage() {
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
				<div>
					<div className='flex items-center gap-2'>
						<FileCheck className='h-8 w-8' />
						<div>
							<h1 className='text-3xl font-bold'>ASC Directives</h1>
							<p className='text-muted-foreground'>Manage directives for POL and W ASC deployments</p>
						</div>
					</div>
				</div>

				{/* Tabs for deployment types */}
				<Tabs defaultValue='pol' className='space-y-4'>
					<TabsList>
						<TabsTrigger value='pol'>POL Deployments</TabsTrigger>
						<TabsTrigger value='wasc'>W ASC Deployments</TabsTrigger>
					</TabsList>

					<TabsContent value='pol' className='space-y-4'>
						<Card>
							<CardHeader>
								<CardTitle>POL Deployment Directives</CardTitle>
								<CardDescription>Select a deployment to view and manage its directives</CardDescription>
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
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>ID</TableHead>
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
														<TableCell className='font-medium'>{deployment.id}</TableCell>
														<TableCell>{deployment.deployment_year}</TableCell>
														<TableCell>{deployment.deployment_month}</TableCell>
														<TableCell>{deployment.event_name}</TableCell>
														<TableCell>{deployment.district || "N/A"}</TableCell>
														<TableCell className='text-right'>
															<Button size='sm' variant='outline' onClick={() => router.push(`/asc-directives/pol-deployment/${deployment.id}`)}>
																<FileText className='h-4 w-4 mr-1' />
																View Directives
															</Button>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>

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
								<CardTitle>W ASC Deployment Directives</CardTitle>
								<CardDescription>Select a deployment to view and manage its directives</CardDescription>
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
															<Button size='sm' variant='outline' onClick={() => router.push(`/asc-directives/w-asc-deployment/${deployment.id}`)}>
																<FileText className='h-4 w-4 mr-1' />
																View Directives
															</Button>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>

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
