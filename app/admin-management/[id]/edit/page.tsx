"use client";

import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRoleCheck } from "@/hooks/use-role-check";
import { ArrowLeft, Loader2, Save, AlertCircle, Info } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminsApi } from "@/lib/api/admins";
import { toast } from "sonner";
import type { UpdateAdminPayload, User } from "@/types";

export default function EditAdminPage() {
	const { hasAccess } = useRoleCheck(["superadmin"]);
	const params = useParams();
	const router = useRouter();
	const queryClient = useQueryClient();

	const adminId = parseInt(params.id as string);

	const [formData, setFormData] = useState<UpdateAdminPayload>({
		name: "",
		email: "",
		password: "",
		password_confirmation: "",
	});

	// Fetch admin details
	const {
		data: admin,
		isLoading,
		error,
	} = useQuery<User | null>({
		queryKey: ["admin", adminId],
		queryFn: async () => {
			const response = await adminsApi.getById(adminId);
			return response.data;
		},
		enabled: hasAccess,
	});

	// Populate form when admin is loaded
	useEffect(() => {
		if (admin) {
			setFormData({
				name: admin.name,
				email: admin.email,
				password: "",
				password_confirmation: "",
			});
		}
	}, [admin]);

	const updateMutation = useMutation({
		mutationFn: (payload: UpdateAdminPayload) => adminsApi.update(adminId, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", adminId] });
			queryClient.invalidateQueries({ queryKey: ["admins"] });
			toast.success("Admin updated successfully");
			router.push("/admin-management");
		},
		onError: (error: unknown) => {
			const message = (error as any)?.response?.data?.message || "Failed to update admin";
			toast.error(message);
		},
	});

	const handleChange = (field: keyof UpdateAdminPayload, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Prepare payload (only include password fields if password is provided)
		const payload: UpdateAdminPayload = {
			name: formData.name,
			email: formData.email,
		};

		// Validation
		if (!payload.name?.trim()) {
			toast.error("Name is required");
			return;
		}
		if (!payload.email?.trim()) {
			toast.error("Email is required");
			return;
		}

		// If password is provided, validate and include it
		if (formData.password) {
			if (formData.password.length < 8) {
				toast.error("Password must be at least 8 characters");
				return;
			}
			if (formData.password !== formData.password_confirmation) {
				toast.error("Passwords do not match");
				return;
			}
			payload.password = formData.password;
			payload.password_confirmation = formData.password_confirmation;
		}

		updateMutation.mutate(payload);
	};

	if (!hasAccess) {
		return null;
	}

	if (isLoading) {
		return (
			<AuthenticatedLayout>
				<div className='flex items-center justify-center py-12'>
					<Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
				</div>
			</AuthenticatedLayout>
		);
	}

	if (error || !admin) {
		return (
			<AuthenticatedLayout>
				<div className='flex flex-col items-center justify-center py-12'>
					<AlertCircle className='h-12 w-12 text-destructive mb-4' />
					<p className='text-lg font-semibold mb-2'>Failed to load admin</p>
					<Button onClick={() => router.push("/admin-management")} variant='outline'>
						<ArrowLeft className='h-4 w-4 mr-2' />
						Back to Admins
					</Button>
				</div>
			</AuthenticatedLayout>
		);
	}

	return (
		<AuthenticatedLayout>
			<div className='mx-auto max-w-2xl space-y-6'>
				<div>
					<Button variant='ghost' size='sm' className='mb-2' onClick={() => router.push("/admin-management")}>
						<ArrowLeft className='mr-2 h-4 w-4' />
						Back to Admins
					</Button>
					<h1 className='text-3xl font-bold'>Edit Admin User</h1>
					<p className='text-muted-foreground'>Update administrator information</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Admin Information</CardTitle>
						<CardDescription>Update admin user details</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className='space-y-6'>
							<div className='space-y-2'>
								<Label htmlFor='name'>
									Full Name <span className='text-destructive'>*</span>
								</Label>
								<Input
									id='name'
									type='text'
									placeholder='Enter full name'
									value={formData.name}
									onChange={(e) => handleChange("name", e.target.value)}
									required
								/>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='email'>
									Email Address <span className='text-destructive'>*</span>
								</Label>
								<Input
									id='email'
									type='email'
									placeholder='admin@example.com'
									value={formData.email}
									onChange={(e) => handleChange("email", e.target.value)}
									required
								/>
								<p className='text-xs text-muted-foreground'>This will be used for login</p>
							</div>

							<Alert>
								<Info className='h-4 w-4' />
								<AlertDescription>Leave password fields empty to keep the current password</AlertDescription>
							</Alert>

							<div className='space-y-2'>
								<Label htmlFor='password'>New Password (Optional)</Label>
								<Input
									id='password'
									type='password'
									placeholder='Enter new password (min. 8 characters)'
									value={formData.password}
									onChange={(e) => handleChange("password", e.target.value)}
								/>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='password_confirmation'>Confirm New Password</Label>
								<Input
									id='password_confirmation'
									type='password'
									placeholder='Re-enter new password'
									value={formData.password_confirmation}
									onChange={(e) => handleChange("password_confirmation", e.target.value)}
								/>
							</div>

							{/* Metadata */}
							<div className='pt-4 border-t'>
								<p className='text-sm text-muted-foreground'>Created: {new Date(admin.created_at).toLocaleString()}</p>
								{admin.updated_at !== admin.created_at && (
									<p className='text-sm text-muted-foreground'>Last updated: {new Date(admin.updated_at).toLocaleString()}</p>
								)}
								<p className='text-sm text-muted-foreground'>
									Role: <strong>{admin.role === "superadmin" ? "Superadmin" : "POL Admin"}</strong>
								</p>
							</div>

							<div className='flex gap-4'>
								<Button type='submit' disabled={updateMutation.isPending}>
									{updateMutation.isPending ? (
										<>
											<Loader2 className='h-4 w-4 mr-2 animate-spin' />
											Updating...
										</>
									) : (
										<>
											<Save className='h-4 w-4 mr-2' />
											Update Admin
										</>
									)}
								</Button>
								<Button
									type='button'
									variant='outline'
									onClick={() => router.push("/admin-management")}
									disabled={updateMutation.isPending}>
									Cancel
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</AuthenticatedLayout>
	);
}
