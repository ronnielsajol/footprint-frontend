"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Loader2, Calendar, User, FileText } from "lucide-react";
import Link from "next/link";
import { polDeploymentsApi } from "@/lib/api/pol-deployments";
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
		queryFn: () => polDeploymentsApi.getById(id),
		enabled: !isNaN(id),
	});

	const deleteMutation = useMutation({
		mutationFn: () => polDeploymentsApi.delete(id),
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
							<AlertDialogTrigger>
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
									{deployment.source && <Badge variant='outline'>{deployment.source}</Badge>}
									{!deployment.source && <span className='text-muted-foreground'>N/A</span>}
								</div>
							</div>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>Venue</label>
								<p className='text-base'>{deployment.exact_venue}</p>
							</div>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>LGU</label>
								<p className='text-base'>{deployment.lgu || "N/A"}</p>
							</div>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>Barangay</label>
								<p className='text-base'>{deployment.barangay || "N/A"}</p>
							</div>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>Province</label>
								<p className='text-base'>{deployment.province || "N/A"}</p>
							</div>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>Region</label>
								<p className='text-base'>{deployment.region || "N/A"}</p>
							</div>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>District</label>
								<p className='text-base'>{deployment.district || "N/A"}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Deployment Information */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<Calendar className='h-5 w-5' />
							Deployment Information
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='grid gap-4 md:grid-cols-2'>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>Deployment Year</label>
								<p className='text-base'>{deployment.deployment_year}</p>
							</div>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>Deployment Month</label>
								<p className='text-base'>{deployment.deployment_month}</p>
							</div>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>Turnover Date</label>
								<p className='text-base'>
									{deployment.turnover_date ? new Date(deployment.turnover_date).toLocaleDateString() : "N/A"}
								</p>
							</div>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>Category</label>
								<p className='text-base'>{deployment.category || "N/A"}</p>
							</div>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>ASC Type</label>
								<p className='text-base'>{deployment.asc_type || "N/A"}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Personnel Information */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<User className='h-5 w-5' />
							Personnel Information
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='grid gap-4 md:grid-cols-3'>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>POL Officer</label>
								<p className='text-base'>{deployment.pol_officer || "N/A"}</p>
							</div>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>LLC</label>
								<p className='text-base'>{deployment.llc || "N/A"}</p>
							</div>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>PSC</label>
								<p className='text-base'>{deployment.psc || "N/A"}</p>
							</div>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>Proponent</label>
								<p className='text-base'>{deployment.proponent || "N/A"}</p>
							</div>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>Sector Recipient</label>
								<p className='text-base'>{deployment.sector_recipient || "N/A"}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Donation Details */}
				{(deployment.amount || deployment.donation_summary || deployment.count || deployment.unit) && (
					<Card>
						<CardHeader>
							<CardTitle>Donation Details</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='grid gap-4 md:grid-cols-2'>
								{deployment.amount && (
									<div>
										<label className='text-sm font-medium text-muted-foreground'>Amount</label>
										<p className='text-base'>₱{deployment.amount.toLocaleString()}</p>
									</div>
								)}
								{deployment.count && (
									<div>
										<label className='text-sm font-medium text-muted-foreground'>Count</label>
										<p className='text-base'>{deployment.count}</p>
									</div>
								)}
								{deployment.unit && (
									<div>
										<label className='text-sm font-medium text-muted-foreground'>Unit</label>
										<p className='text-base'>{deployment.unit}</p>
									</div>
								)}
								{deployment.donation_summary && (
									<div className='col-span-2'>
										<label className='text-sm font-medium text-muted-foreground'>Summary</label>
										<p className='text-base'>{deployment.donation_summary}</p>
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
