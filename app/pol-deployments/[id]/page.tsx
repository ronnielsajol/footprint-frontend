"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Trash2, Loader2, Calendar, MapPin, User, FileText } from "lucide-react";
import Link from "next/link";
import { PolDeploymentsApi } from "@/lib/api/pol-deployments";
import { toast } from "sonner";
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

export default function PolDeploymentDetailPage() {
	const params = useParams();
	const router = useRouter();
	const queryClient = useQueryClient();
	const id = parseInt(params.id as string);

	const { data, isLoading, error } = useQuery({
		queryKey: ["pol-deployment", id],
		queryFn: () => PolDeploymentsApi.getById(id),
		enabled: !isNaN(id),
	});

	const deleteMutation = useMutation({
		mutationFn: () => PolDeploymentsApi.delete(id),
		onSuccess: () => {
			toast.success("Deployment deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["pol-deployments"] });
			router.push("/pol-deployments");
		},
		onError: () => {
			toast.error("Failed to delete deployment");
		},
	});

	if (isNaN(id)) {
		return (
			<AuthenticatedLayout>
				<div className='text-center py-8 text-destructive'>
					<p>Invalid deployment ID</p>
				</div>
			</AuthenticatedLayout>
		);
	}

	if (isLoading) {
		return (
			<AuthenticatedLayout>
				<div className='flex items-center justify-center py-8'>
					<Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
				</div>
			</AuthenticatedLayout>
		);
	}

	if (error || !data?.data) {
		return (
			<AuthenticatedLayout>
				<div className='text-center py-8 text-destructive'>
					<p>Error loading deployment</p>
					<p className='text-sm mt-2'>{error?.message}</p>
				</div>
			</AuthenticatedLayout>
		);
	}

	const deployment = data.data;

	return (
		<AuthenticatedLayout>
			<div className='space-y-6'>
				{/* Header */}
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-4'>
						<Link href='/pol-deployments'>
							<Button variant='ghost' size='icon'>
								<ArrowLeft className='h-4 w-4' />
							</Button>
						</Link>
						<div>
							<h1 className='text-3xl font-bold'>{deployment.event_name}</h1>
							<p className='text-muted-foreground'>POL Deployment Details</p>
						</div>
					</div>
					<div className='flex gap-2'>
						<Link href={`/pol-deployments/${id}/edit`}>
							<Button>
								<Edit className='mr-2 h-4 w-4' />
								Edit
							</Button>
						</Link>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant='destructive'>
									<Trash2 className='mr-2 h-4 w-4' />
									Delete
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Are you sure?</AlertDialogTitle>
									<AlertDialogDescription>
										This action cannot be undone. This will permanently delete the deployment record.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction onClick={() => deleteMutation.mutate()} className='bg-destructive text-destructive-foreground'>
										{deleteMutation.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : "Delete"}
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</div>

				{/* Basic Information */}
				<Card>
					<CardHeader>
						<CardTitle>Basic Information</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='grid gap-4 md:grid-cols-2'>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>Event Name</label>
								<p className='text-base'>{deployment.event_name}</p>
							</div>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>Source</label>
								<div className='mt-1'>
									<Badge variant='outline'>{deployment.source}</Badge>
								</div>
							</div>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>Venue</label>
								<p className='text-base'>{deployment.venue}</p>
							</div>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>LGU</label>
								<p className='text-base'>{deployment.lgu}</p>
							</div>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>Barangay</label>
								<p className='text-base'>{deployment.barangay || "N/A"}</p>
							</div>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>Island Group</label>
								<p className='text-base'>{deployment.island_group || "N/A"}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Deployment Dates */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<Calendar className='h-5 w-5' />
							Deployment Dates
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='grid gap-4 md:grid-cols-2'>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>Start Date</label>
								<p className='text-base'>{new Date(deployment.date_start).toLocaleDateString()}</p>
							</div>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>End Date</label>
								<p className='text-base'>{deployment.date_end ? new Date(deployment.date_end).toLocaleDateString() : "N/A"}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Assignment Details */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<User className='h-5 w-5' />
							Assignment Details
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='grid gap-4 md:grid-cols-2'>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>Assigned To</label>
								<p className='text-base'>{deployment.assigned_to || "N/A"}</p>
							</div>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>Unit/Section/Office</label>
								<p className='text-base'>{deployment.unit_section_office || "N/A"}</p>
							</div>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>Original Assignment</label>
								<p className='text-base'>{deployment.original_unit_section_office || "N/A"}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Donation Details */}
				{(deployment.donation_amount || deployment.donation_description) && (
					<Card>
						<CardHeader>
							<CardTitle>Donation Details</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='grid gap-4 md:grid-cols-2'>
								{deployment.donation_amount && (
									<div>
										<label className='text-sm font-medium text-muted-foreground'>Amount</label>
										<p className='text-base'>₱{deployment.donation_amount.toLocaleString()}</p>
									</div>
								)}
								{deployment.donation_description && (
									<div className='col-span-2'>
										<label className='text-sm font-medium text-muted-foreground'>Description</label>
										<p className='text-base'>{deployment.donation_description}</p>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Remarks */}
				{deployment.remarks && (
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<FileText className='h-5 w-5' />
								Remarks
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='text-base whitespace-pre-wrap'>{deployment.remarks}</p>
						</CardContent>
					</Card>
				)}

				{/* Metadata */}
				<Card>
					<CardHeader>
						<CardTitle>Metadata</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='grid gap-4 md:grid-cols-2'>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>Created At</label>
								<p className='text-base'>{new Date(deployment.created_at).toLocaleString()}</p>
							</div>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>Last Updated</label>
								<p className='text-base'>{new Date(deployment.updated_at).toLocaleString()}</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</AuthenticatedLayout>
	);
}
