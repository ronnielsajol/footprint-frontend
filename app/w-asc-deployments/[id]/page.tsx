"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Loader2, Calendar, MapPin, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { WAscDeploymentsApi } from "@/lib/api/w-asc-deployments";
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

export default function WAscDeploymentDetailPage() {
	const params = useParams();
	const router = useRouter();
	const queryClient = useQueryClient();
	const id = parseInt(params.id as string);

	const { data, isLoading, error } = useQuery({
		queryKey: ["w-asc-deployment", id],
		queryFn: () => WAscDeploymentsApi.getById(id),
		enabled: !isNaN(id),
	});

	const deleteMutation = useMutation({
		mutationFn: () => WAscDeploymentsApi.delete(id),
		onSuccess: () => {
			toast.success("W ASC Deployment deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["w-asc-deployments"] });
			router.push("/w-asc-deployments");
		},
		onError: () => {
			toast.error("Failed to delete W ASC deployment");
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
						<Link href='/w-asc-deployments'>
							<Button variant='ghost' size='icon'>
								<ArrowLeft className='h-4 w-4' />
							</Button>
						</Link>
						<div>
							<h1 className='text-3xl font-bold'>{deployment.exact_venue}</h1>
							<p className='text-muted-foreground'>W ASC Deployment Details</p>
						</div>
					</div>
					<div className='flex gap-2'>
						<Link href={`/w-asc-deployments/${id}/edit`}>
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
								<label className='text-sm font-medium text-muted-foreground'>Exact Venue</label>
								<p className='text-base'>{deployment.exact_venue}</p>
							</div>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>Event Tagging</label>
								<p className='text-base'>{deployment.event_tagging || "N/A"}</p>
							</div>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>Barangay</label>
								<p className='text-base'>{deployment.barangay || "N/A"}</p>
							</div>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>City/Municipality</label>
								<p className='text-base'>{deployment.city_municipality || "N/A"}</p>
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
							{deployment.sector && (
								<div>
									<label className='text-sm font-medium text-muted-foreground'>Sector</label>
									<div className='mt-1'>
										<Badge variant='outline'>{deployment.sector}</Badge>
									</div>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Deployment Date */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<Calendar className='h-5 w-5' />
							Deployment Date
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='grid gap-4 md:grid-cols-3'>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>Exact Date</label>
								<p className='text-base'>{new Date(deployment.exact_date).toLocaleDateString()}</p>
							</div>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>Month</label>
								<p className='text-base'>{new Date(2000, deployment.deployment_month - 1).toLocaleString("en", { month: "long" })}</p>
							</div>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>Year</label>
								<p className='text-base'>{deployment.deployment_year}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Attendance Flags */}
				<Card>
					<CardHeader>
						<CardTitle>Attendance & Activities</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='grid gap-4 md:grid-cols-3'>
							<div className='flex items-center gap-2'>
								{deployment.has_socials ? (
									<CheckCircle className='h-5 w-5 text-green-600' />
								) : (
									<XCircle className='h-5 w-5 text-gray-400' />
								)}
								<span>Has Socials</span>
							</div>
							<div className='flex items-center gap-2'>
								{deployment.has_sortie ? (
									<CheckCircle className='h-5 w-5 text-green-600' />
								) : (
									<XCircle className='h-5 w-5 text-gray-400' />
								)}
								<span>Has Sortie</span>
							</div>
							<div className='flex items-center gap-2'>
								{deployment.asc_attended ? (
									<CheckCircle className='h-5 w-5 text-green-600' />
								) : (
									<XCircle className='h-5 w-5 text-gray-400' />
								)}
								<span>ASC Attended</span>
							</div>
							<div className='flex items-center gap-2'>
								{deployment.llc_attended ? (
									<CheckCircle className='h-5 w-5 text-green-600' />
								) : (
									<XCircle className='h-5 w-5 text-gray-400' />
								)}
								<span>LLC Attended</span>
							</div>
							<div className='flex items-center gap-2'>
								{deployment.psc_attended ? (
									<CheckCircle className='h-5 w-5 text-green-600' />
								) : (
									<XCircle className='h-5 w-5 text-gray-400' />
								)}
								<span>PSC Attended</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* POL Activities */}
				{deployment.pol_activities && deployment.pol_activities.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle>POL Activities</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className='list-disc list-inside space-y-1'>
								{deployment.pol_activities.map((activity, index) => (
									<li key={index}>{activity}</li>
								))}
							</ul>
						</CardContent>
					</Card>
				)}

				{/* Remarks */}
				{deployment.remarks && (
					<Card>
						<CardHeader>
							<CardTitle>Remarks</CardTitle>
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
