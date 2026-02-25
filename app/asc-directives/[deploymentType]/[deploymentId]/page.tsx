"use client";

import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Plus, Edit, Trash2, Loader2, AlertCircle, FileText, Calendar, User } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { polDeploymentsApi } from "@/lib/api/pol-deployments";
import { WAscDeploymentsApi } from "@/lib/api/w-asc-deployments";
import { ascDirectivesApi } from "@/lib/api/asc-directives";
import { toast } from "sonner";
import type { DeploymentType } from "@/types";

export default function DeploymentDirectivesPage() {
	const params = useParams();
	const router = useRouter();
	const queryClient = useQueryClient();

	const deploymentType = params.deploymentType as DeploymentType;
	const deploymentId = parseInt(params.deploymentId as string);

	// Fetch deployment details
	const {
		data: deployment,
		isLoading: deploymentLoading,
		error: deploymentError,
	} = useQuery({
		queryKey: [deploymentType === "pol-deployment" ? "pol-deployment" : "w-asc-deployment", deploymentId],
		queryFn: async () => {
			const response =
				deploymentType === "pol-deployment"
					? await polDeploymentsApi.getById(deploymentId)
					: await WAscDeploymentsApi.getById(deploymentId);
			return response.data;
		},
	});

	// Fetch directives for this deployment
	const {
		data: directives,
		isLoading: directivesLoading,
		error: directivesError,
	} = useQuery({
		queryKey: ["asc-directives", deploymentType, deploymentId],
		queryFn: async () => {
			const response = await ascDirectivesApi.getForDeployment(deploymentType, deploymentId);
			return response.data;
		},
	});

	// Delete directive mutation
	const deleteMutation = useMutation({
		mutationFn: (directiveId: number) => ascDirectivesApi.delete(directiveId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["asc-directives", deploymentType, deploymentId] });
			toast.success("Directive deleted successfully");
		},
		onError: () => {
			toast.error("Failed to delete directive");
		},
	});

	const handleDelete = (directiveId: number) => {
		deleteMutation.mutate(directiveId);
	};

	const loading = deploymentLoading || directivesLoading;
	const error = deploymentError || directivesError;

	return (
		<AuthenticatedLayout>
			<div className='space-y-6'>
				{/* Header */}
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-4'>
						<Button variant='outline' size='sm' onClick={() => router.push("/asc-directives")}>
							<ArrowLeft className='h-4 w-4 mr-2' />
							Back
						</Button>
						<div className='flex items-center gap-2'>
							<FileText className='h-8 w-8' />
							<div>
								<h1 className='text-3xl font-bold'>ASC Directives</h1>
								<p className='text-muted-foreground'>
									{deploymentType === "pol-deployment" ? "POL Deployment" : "W ASC Deployment"} #{deploymentId}
								</p>
							</div>
						</div>
					</div>
					<Button onClick={() => router.push(`/asc-directives/${deploymentType}/${deploymentId}/create`)}>
						<Plus className='h-4 w-4 mr-2' />
						Add Directive
					</Button>
				</div>

				{loading && (
					<div className='flex items-center justify-center py-12'>
						<Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
					</div>
				)}

				{error && (
					<div className='flex items-center justify-center py-12 text-destructive'>
						<AlertCircle className='h-5 w-5 mr-2' />
						<span>Failed to load data</span>
					</div>
				)}

				{!loading && !error && deployment && (
					<>
						{/* Deployment Information */}
						<Card>
							<CardHeader>
								<CardTitle>Deployment Information</CardTitle>
								<CardDescription>Details about this deployment</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
									<div>
										<p className='text-sm text-muted-foreground'>Year</p>
										<p className='font-medium'>{deployment.deployment_year}</p>
									</div>
									<div>
										<p className='text-sm text-muted-foreground'>Month</p>
										<p className='font-medium'>{deployment.deployment_month}</p>
									</div>
									{deploymentType === "pol-deployment" && "source" in deployment && deployment.source && (
										<div>
											<p className='text-sm text-muted-foreground'>Source</p>
											<p className='font-medium'>{deployment.source}</p>
										</div>
									)}
									{deploymentType === "w-asc-deployment" && "sector" in deployment && (
										<div>
											<p className='text-sm text-muted-foreground'>Sector</p>
											<p className='font-medium'>{deployment.sector || "N/A"}</p>
										</div>
									)}
									<div>
										<p className='text-sm text-muted-foreground'>Venue</p>
										<p className='font-medium'>{deployment.exact_venue || "N/A"}</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Directives List */}
						<Card>
							<CardHeader>
								<div className='flex items-center justify-between'>
									<div>
										<CardTitle>Directives</CardTitle>
										<CardDescription>
											{directives && directives.length > 0
												? `${directives.length} directive${directives.length !== 1 ? "s" : ""} issued`
												: "No directives issued yet"}
										</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								{directivesLoading && (
									<div className='flex items-center justify-center py-8'>
										<Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
									</div>
								)}

								{!directivesLoading && (!directives || directives.length === 0) && (
									<div className='text-center py-8 text-muted-foreground'>
										<FileText className='h-12 w-12 mx-auto mb-2 opacity-50' />
										<p>No directives have been issued for this deployment</p>
										<Button
											variant='outline'
											size='sm'
											className='mt-4'
											onClick={() => router.push(`/asc-directives/${deploymentType}/${deploymentId}/create`)}>
											<Plus className='h-4 w-4 mr-2' />
											Add First Directive
										</Button>
									</div>
								)}

								{!directivesLoading && directives && directives.length > 0 && (
									<div className='space-y-4'>
										{directives.map((directive, index) => (
											<div key={directive.id}>
												{index > 0 && <Separator className='my-4' />}
												<div className='space-y-3'>
													<div className='flex items-start justify-between'>
														<div className='flex-1'>
															<div className='flex items-center gap-2 mb-2'>
																<Badge variant='outline'>#{directive.id}</Badge>
																<div className='flex items-center gap-1 text-sm text-muted-foreground'>
																	<Calendar className='h-3 w-3' />
																	{new Date(directive.issued_date).toLocaleDateString()}
																</div>
															</div>
															<p className='text-sm whitespace-pre-wrap mb-2'>{directive.directive_text}</p>
															<div className='flex items-center gap-4 text-xs text-muted-foreground'>
																<div className='flex items-center gap-1'>
																	<User className='h-3 w-3' />
																	Issued by: {directive.issued_by}
																</div>
																<div className='flex items-center gap-1'>
																	<User className='h-3 w-3' />
																	Created by: {directive.created_by.name}
																</div>
															</div>
														</div>
														<div className='flex items-center gap-2'>
															<Button size='sm' variant='outline' onClick={() => router.push(`/asc-directives/directive/${directive.id}/edit`)}>
																<Edit className='h-4 w-4' />
															</Button>
															<AlertDialog>
																<AlertDialogTrigger>
																	<Button size='sm' variant='outline'>
																		<Trash2 className='h-4 w-4 text-destructive' />
																	</Button>
																</AlertDialogTrigger>
																<AlertDialogContent>
																	<AlertDialogHeader>
																		<AlertDialogTitle>Delete Directive</AlertDialogTitle>
																		<AlertDialogDescription>
																			Are you sure you want to delete this directive? This action cannot be undone.
																		</AlertDialogDescription>
																	</AlertDialogHeader>
																	<AlertDialogFooter>
																		<AlertDialogCancel>Cancel</AlertDialogCancel>
																		<AlertDialogAction
																			onClick={() => handleDelete(directive.id)}
																			className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
																			Delete
																		</AlertDialogAction>
																	</AlertDialogFooter>
																</AlertDialogContent>
															</AlertDialog>
														</div>
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</>
				)}
			</div>
		</AuthenticatedLayout>
	);
}
