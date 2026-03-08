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
import { useRoleCheck } from "@/hooks/use-role-check";
import {
	Plus,
	Settings,
	ShieldAlert,
	Loader2,
	AlertCircle,
	Edit,
	Trash2,
	User as UserIcon,
	Mail,
	Shield,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminsApi } from "@/lib/api/admins";
import { toast } from "sonner";
import type { PaginatedResponse, User } from "@/types";

export default function AdminManagementPage() {
	const { hasAccess } = useRoleCheck(["superadmin"]);
	const router = useRouter();
	const queryClient = useQueryClient();

	// Fetch admins list
	const {
		data: adminsData,
		isLoading,
		error,
	} = useQuery<PaginatedResponse<User> | null>({
		queryKey: ["admins"],
		queryFn: async () => {
			const response = await adminsApi.getAll();
			return response.data;
		},
		enabled: hasAccess,
	});

	// Delete admin mutation
	const deleteMutation = useMutation({
		mutationFn: (adminId: number) => adminsApi.delete(adminId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admins"] });
			toast.success("Admin deleted successfully");
		},
		onError: (error: unknown) => {
			const message =
				(error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to delete admin";
			toast.error(message);
		},
	});

	const handleDelete = (adminId: number) => {
		deleteMutation.mutate(adminId);
	};

	if (!hasAccess) {
		return (
			<AuthenticatedLayout>
				<Card>
					<CardContent className='flex flex-col items-center justify-center py-12'>
						<ShieldAlert className='h-12 w-12 text-muted-foreground mb-4' />
						<h2 className='text-xl font-semibold mb-2'>Access Denied</h2>
						<p className='text-muted-foreground text-center'>Only superadmin users can access this page.</p>
					</CardContent>
				</Card>
			</AuthenticatedLayout>
		);
	}

	return (
		<AuthenticatedLayout>
			<div className='space-y-6'>
				{/* Header */}
				<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
					<div className='flex items-center gap-2'>
						<Settings className='h-6 w-6 sm:h-8 sm:w-8' />
						<div>
							<h1 className='text-2xl sm:text-3xl font-bold'>Admin Management</h1>
							<p className='text-muted-foreground text-sm'>Manage system administrators</p>
						</div>
					</div>
					<Button onClick={() => router.push("/admin-management/create")} className='w-full sm:w-auto'>
						<Plus className='mr-2 h-4 w-4' />
						Add Admin
					</Button>
				</div>

				{/* Admins List */}
				<Card>
					<CardHeader>
						<CardTitle>System Administrators</CardTitle>
						<CardDescription>Manage admin users and their access levels</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoading && (
							<div className='flex items-center justify-center py-8'>
								<Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
								<span className='ml-2 text-muted-foreground'>Loading administrators...</span>
							</div>
						)}

						{error && (
							<div className='flex items-center justify-center py-8 text-destructive'>
								<AlertCircle className='h-5 w-5 mr-2' />
								<span>Failed to load administrators</span>
							</div>
						)}

						{!isLoading && !error && adminsData?.data?.length === 0 && (
							<div className='text-center py-8 text-muted-foreground'>
								<UserIcon className='h-12 w-12 mx-auto mb-2 opacity-50' />
								<p>No administrators found</p>
								<Button variant='outline' size='sm' className='mt-4' onClick={() => router.push("/admin-management/create")}>
									<Plus className='h-4 w-4 mr-2' />
									Add First Admin
								</Button>
							</div>
						)}

						{!isLoading && !error && adminsData && adminsData.data && adminsData.data.length > 0 && (
							<div className='space-y-4'>
								{/* Mobile: Card View */}
								<div className='block md:hidden space-y-3'>
									{adminsData.data.map((admin) => (
										<Card key={admin.id} className='p-4'>
											<div className='space-y-3'>
												<div className='flex items-start justify-between gap-3'>
													<div className='space-y-1 flex-1 min-w-0'>
														<div className='flex items-center gap-2 min-w-0'>
															<UserIcon className='h-4 w-4 text-muted-foreground shrink-0' />
															<span className='font-semibold truncate'>{admin.name}</span>
														</div>
														<div className='flex items-center gap-2 text-sm text-muted-foreground min-w-0'>
															<Mail className='h-3 w-3 shrink-0' />
															<span className='truncate'>{admin.email}</span>
														</div>
														<div className='text-xs text-muted-foreground'>Created: {new Date(admin.created_at).toLocaleDateString()}</div>
													</div>
													<Badge variant={admin.role === "superadmin" ? "default" : "secondary"} className='shrink-0'>
														<Shield className='h-3 w-3 mr-1' />
														{admin.role === "superadmin" ? "Superadmin" : "POL Admin"}
													</Badge>
												</div>
												<div className='flex gap-2 pt-2 border-t'>
													<Button
														size='sm'
														variant='outline'
														className='flex-1'
														onClick={() => router.push(`/admin-management/${admin.id}/edit`)}>
														<Edit className='mr-2 h-4 w-4' />
														Edit
													</Button>
													<AlertDialog>
														<AlertDialogTrigger>
															<Button size='sm' variant='outline' className='flex-1'>
																<Trash2 className='mr-2 h-4 w-4 text-destructive' />
																Delete
															</Button>
														</AlertDialogTrigger>
														<AlertDialogContent>
															<AlertDialogHeader>
																<AlertDialogTitle>Delete Administrator</AlertDialogTitle>
																<AlertDialogDescription>
																	Are you sure you want to delete <strong>{admin.name}</strong>? This action cannot be undone.
																</AlertDialogDescription>
															</AlertDialogHeader>
															<AlertDialogFooter>
																<AlertDialogCancel>Cancel</AlertDialogCancel>
																<AlertDialogAction
																	onClick={() => handleDelete(admin.id)}
																	className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
																	Delete
																</AlertDialogAction>
															</AlertDialogFooter>
														</AlertDialogContent>
													</AlertDialog>
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
												<TableHead>Name</TableHead>
												<TableHead>Email</TableHead>
												<TableHead>Role</TableHead>
												<TableHead>Created</TableHead>
												<TableHead className='text-right'>Actions</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{adminsData.data.map((admin) => (
												<TableRow key={admin.id}>
													<TableCell className='font-medium'>{admin.id}</TableCell>
													<TableCell>
														<div className='flex items-center gap-2'>
															<UserIcon className='h-4 w-4 text-muted-foreground' />
															{admin.name}
														</div>
													</TableCell>
													<TableCell>
														<div className='flex items-center gap-2'>
															<Mail className='h-4 w-4 text-muted-foreground' />
															{admin.email}
														</div>
													</TableCell>
													<TableCell>
														<Badge variant={admin.role === "superadmin" ? "default" : "secondary"}>
															<Shield className='h-3 w-3 mr-1' />
															{admin.role === "superadmin" ? "Superadmin" : "POL Admin"}
														</Badge>
													</TableCell>
													<TableCell className='text-sm text-muted-foreground'>{new Date(admin.created_at).toLocaleDateString()}</TableCell>
													<TableCell className='text-right'>
														<div className='flex items-center justify-end gap-2'>
															<Button size='sm' variant='outline' onClick={() => router.push(`/admin-management/${admin.id}/edit`)}>
																<Edit className='h-4 w-4' />
															</Button>
															<AlertDialog>
																<AlertDialogTrigger className='p-2 rounded-md hover:bg-destructive/10'>
																	<Trash2 className='h-4 w-4 text-destructive' />
																</AlertDialogTrigger>
																<AlertDialogContent>
																	<AlertDialogHeader>
																		<AlertDialogTitle>Delete Administrator</AlertDialogTitle>
																		<AlertDialogDescription>
																			Are you sure you want to delete <strong>{admin.name}</strong>? This action cannot be undone and will revoke their access
																			to the system.
																		</AlertDialogDescription>
																	</AlertDialogHeader>
																	<AlertDialogFooter>
																		<AlertDialogCancel>Cancel</AlertDialogCancel>
																		<AlertDialogAction
																			onClick={() => handleDelete(admin.id)}
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
								</div>

								{adminsData.meta && (
									<p className='text-sm text-muted-foreground text-center'>
										Showing {adminsData.data.length} of {adminsData.meta.total} administrators
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
