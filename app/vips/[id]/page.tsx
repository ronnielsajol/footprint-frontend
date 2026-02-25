"use client";

import { useQuery, useMutation, useQueryClient } from "@tantml:react-query";
import { useParams, useRouter } from "next/navigation";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Loader2, User, Phone, Mail, Calendar } from "lucide-react";
import Link from "next/link";
import { VipsApi } from "@/lib/api/vips";
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

export default function VipDetailPage() {
	const params = useParams();
	const router = useRouter();
	const queryClient = useQueryClient();
	const id = parseInt(params.id as string);

	const { data, isLoading, error } = useQuery({
		queryKey: ["vip", id],
		queryFn: () => VipsApi.getById(id),
		enabled: !isNaN(id),
	});

	const deleteMutation = useMutation({
		mutationFn: () => VipsApi.delete(id),
		onSuccess: () => {
			toast.success("VIP deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["vips"] });
			router.push("/vips");
		},
		onError: () => {
			toast.error("Failed to delete VIP");
		},
	});

	if (isNaN(id)) {
		return (
			<AuthenticatedLayout>
				<div className='text-center py-8 text-destructive'>
					<p>Invalid VIP ID</p>
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
					<p>Error loading VIP</p>
					<p className='text-sm mt-2'>{error?.message}</p>
				</div>
			</AuthenticatedLayout>
		);
	}

	const vip = data.data;

	return (
		<AuthenticatedLayout>
			<div className='space-y-6'>
				{/* Header */}
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-4'>
						<Link href='/vips'>
							<Button variant='ghost' size='icon'>
								<ArrowLeft className='h-4 w-4' />
							</Button>
						</Link>
						<div>
							<h1 className='text-3xl font-bold'>{vip.full_name}</h1>
							<p className='text-muted-foreground'>VIP Details</p>
						</div>
					</div>
					<div className='flex gap-2'>
						<Link href={`/vips/${id}/edit`}>
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
										This action cannot be undone. This will permanently delete the VIP record.
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

				{/* Personal Information */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<User className='h-5 w-5' />
							Personal Information
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='grid gap-4 md:grid-cols-2'>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>First Name</label>
								<p className='text-base'>{vip.first_name}</p>
							</div>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>Last Name</label>
								<p className='text-base'>{vip.last_name}</p>
							</div>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>Full Name</label>
								<p className='text-base font-semibold'>{vip.full_name}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Contact Information */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<Phone className='h-5 w-5' />
							Contact Information
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='grid gap-4 md:grid-cols-2'>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>Contact Number</label>
								<p className='text-base'>{vip.contact_number}</p>
							</div>
							<div>
								<label className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
									<Mail className='h-4 w-4' />
									Email
								</label>
								<p className='text-base'>{vip.email || "N/A"}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Additional Information */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<Calendar className='h-5 w-5' />
							Additional Information
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='grid gap-4 md:grid-cols-2'>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>Birth Date</label>
								<p className='text-base'>{new Date(vip.birth_date).toLocaleDateString()}</p>
							</div>
							{vip.events_count !== undefined && (
								<div>
									<label className='text-sm font-medium text-muted-foreground'>Events Count</label>
									<div className='mt-1'>
										<Badge variant='secondary'>{vip.events_count} events</Badge>
									</div>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Metadata */}
				<Card>
					<CardHeader>
						<CardTitle>Metadata</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='grid gap-4 md:grid-cols-2'>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>Created By</label>
								<p className='text-base'>{vip.created_by.name}</p>
							</div>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>Created At</label>
								<p className='text-base'>{new Date(vip.created_at).toLocaleString()}</p>
							</div>
							<div>
								<label className='text-sm font-medium text-muted-foreground'>Last Updated</label>
								<p className='text-base'>{new Date(vip.updated_at).toLocaleString()}</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</AuthenticatedLayout>
	);
}
