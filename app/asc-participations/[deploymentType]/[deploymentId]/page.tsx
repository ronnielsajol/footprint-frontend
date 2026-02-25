"use client";

import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { ArrowLeft, Plus, Edit, Trash2, Loader2, AlertCircle, Users, Calendar, User, FileText } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { polDeploymentsApi } from "@/lib/api/pol-deployments";
import { wAscDeploymentsApi } from "@/lib/api/w-asc-deployments";
import { ascParticipationsApi } from "@/lib/api/asc-participations";
import { toast } from "sonner";
import type { DeploymentType } from "@/types";

export default function DeploymentParticipationsPage() {
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
		queryKey: [deploymentType === "pol" ? "pol-deployment" : "w-asc-deployment", deploymentId],
		queryFn: async () => {
			const response =
				deploymentType === "pol"
					? await polDeploymentsApi.getById(deploymentId)
					: await wAscDeploymentsApi.getById(deploymentId);
			return response.data;
		},
	});

	// Fetch participations for this deployment
	const {
		data: participations,
		isLoading: participationsLoading,
		error: participationsError,
	} = useQuery({
		queryKey: ["asc-participations", deploymentType, deploymentId],
		queryFn: async () => {
			const response = await ascParticipationsApi.getForDeployment(deploymentType, deploymentId);
			return response.data;
		},
	});

	// Delete participation mutation
	const deleteMutation = useMutation({
		mutationFn: (participationId: number) => ascParticipationsApi.delete(participationId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["asc-participations", deploymentType, deploymentId] });
			toast.success("Participation record deleted successfully");
		},
		onError: () => {
			toast.error("Failed to delete participation record");
		},
	});

	const handleDelete = (participationId: number) => {
		deleteMutation.mutate(participationId);
	};

	const loading = deploymentLoading || participationsLoading;
	const error = deploymentError || participationsError;

	return (
		<AuthenticatedLayout>
			<div className='space-y-6'>
				{/* Header */}
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-4'>
						<Button variant='outline' size='sm' onClick={() => router.push("/asc-participations")}>
							<ArrowLeft className='h-4 w-4 mr-2' />
							Back
						</Button>
						<div className='flex items-center gap-2'>
							<Users className='h-8 w-8' />
							<div>
								<h1 className='text-3xl font-bold'>ASC Participations</h1>
								<p className='text-muted-foreground'>
									{deploymentType === "pol" ? "POL Deployment" : "W ASC Deployment"} #{deploymentId}
								</p>
							</div>
						</div>
					</div>
					<Button onClick={() => router.push(`/asc-participations/${deploymentType}/${deploymentId}/create`)}>
						<Plus className='h-4 w-4 mr-2' />
						Add Participant
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
								<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
									<div>
										<p className='text-sm text-muted-foreground'>Year</p>
										<p className='font-medium'>{deployment.year}</p>
									</div>
									<div>
										<p className='text-sm text-muted-foreground'>Month</p>
										<p className='font-medium'>{deployment.month}</p>
									</div>
									{deploymentType === "pol" && "service_name" in deployment && (
										<div>
											<p className='text-sm text-muted-foreground'>Service</p>
											<p className='font-medium'>{deployment.service_name}</p>
										</div>
									)}
									{deploymentType === "wasc" && "sector" in deployment && (
										<div>
											<p className='text-sm text-muted-foreground'>Sector</p>
											<p className='font-medium'>{deployment.sector || "N/A"}</p>
										</div>
									)}
									<div>
										<p className='text-sm text-muted-foreground'>Location</p>
										<p className='font-medium'>{deployment.location || "N/A"}</p>
									</div>
									<div>
										<p className='text-sm text-muted-foreground'>Status</p>
										<Badge variant={deployment.is_completed ? "default" : "secondary"}>
											{deployment.is_completed ? "Completed" : "Ongoing"}
										</Badge>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Participations List */}
						<Card>
							<CardHeader>
								<div className='flex items-center justify-between'>
									<div>
										<CardTitle>Participation Records</CardTitle>
										<CardDescription>
											{participations && participations.length > 0
												? `${participations.length} participant${participations.length !== 1 ? "s" : ""} recorded`
												: "No participation records yet"}
										</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								{participationsLoading && (
									<div className='flex items-center justify-center py-8'>
										<Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
									</div>
								)}

								{!participationsLoading && (!participations || participations.length === 0) && (
									<div className='text-center py-8 text-muted-foreground'>
										<Users className='h-12 w-12 mx-auto mb-2 opacity-50' />
										<p>No participation records for this deployment</p>
										<Button
											variant='outline'
											size='sm'
											className='mt-4'
											onClick={() => router.push(`/asc-participations/${deploymentType}/${deploymentId}/create`)}>
											<Plus className='h-4 w-4 mr-2' />
											Add First Participant
										</Button>
									</div>
								)}

								{!participationsLoading && participations && participations.length > 0 && (
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>ID</TableHead>
												<TableHead>Participant Name</TableHead>
												<TableHead>Role</TableHead>
												<TableHead>Date</TableHead>
												<TableHead>Remarks</TableHead>
												<TableHead>Created By</TableHead>
												<TableHead className='text-right'>Actions</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{participations.map((participation) => (
												<TableRow key={participation.id}>
													<TableCell className='font-medium'>{participation.id}</TableCell>
													<TableCell>
														<div className='flex items-center gap-2'>
															<User className='h-4 w-4 text-muted-foreground' />
															{participation.participant_name}
														</div>
													</TableCell>
													<TableCell>
														<Badge variant='outline'>{participation.participant_role}</Badge>
													</TableCell>
													<TableCell>
														<div className='flex items-center gap-1'>
															<Calendar className='h-3 w-3 text-muted-foreground' />
															{new Date(participation.participation_date).toLocaleDateString()}
														</div>
													</TableCell>
													<TableCell className='max-w-xs truncate'>
														{participation.remarks || <span className='text-muted-foreground'>—</span>}
													</TableCell>
													<TableCell className='text-sm text-muted-foreground'>{participation.created_by.name}</TableCell>
													<TableCell className='text-right'>
														<div className='flex items-center justify-end gap-2'>
															<Button
																size='sm'
																variant='outline'
																onClick={() => router.push(`/asc-participations/participation/${participation.id}/edit`)}>
																<Edit className='h-4 w-4' />
															</Button>
															<AlertDialog>
																<AlertDialogTrigger asChild>
																	<Button size='sm' variant='outline'>
																		<Trash2 className='h-4 w-4 text-destructive' />
																	</Button>
																</AlertDialogTrigger>
																<AlertDialogContent>
																	<AlertDialogHeader>
																		<AlertDialogTitle>Delete Participation Record</AlertDialogTitle>
																		<AlertDialogDescription>
																			Are you sure you want to delete this participation record for <strong>{participation.participant_name}</strong>? This
																			action cannot be undone.
																		</AlertDialogDescription>
																	</AlertDialogHeader>
																	<AlertDialogFooter>
																		<AlertDialogCancel>Cancel</AlertDialogCancel>
																		<AlertDialogAction
																			onClick={() => handleDelete(participation.id)}
																			className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
																			Delete
																		</AlertDialogAction>
																	</AlertDialogFooter>
																</AlertDialogContent>
															</AlertDialog>
														</div>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								)}
							</CardContent>
						</Card>
					</>
				)}
			</div>
		</AuthenticatedLayout>
	);
}
