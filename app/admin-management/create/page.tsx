"use client";

import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRoleCheck } from "@/hooks/use-role-check";
import { ArrowLeft, Loader2, Save, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminsApi } from "@/lib/api/admins";
import { toast } from "sonner";
import type { CreateAdminPayload } from "@/types";

export default function CreateAdminPage() {
	const { hasAccess } = useRoleCheck(["superadmin"]);
	const router = useRouter();
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState<CreateAdminPayload>({
		name: "",
		email: "",
		password: "",
		password_confirmation: "",
	});

	const createMutation = useMutation({
		mutationFn: (payload: CreateAdminPayload) => adminsApi.create(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admins"] });
			toast.success("Admin created successfully");
			router.push("/admin-management");
		},
		onError: (error: unknown) => {
			const message =
				(error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to create admin";
			toast.error(message);
		},
	});

	const handleChange = (field: keyof CreateAdminPayload, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (!formData.name.trim()) {
			toast.error("Name is required");
			return;
		}
		if (!formData.email.trim()) {
			toast.error("Email is required");
			return;
		}
		if (!formData.password) {
			toast.error("Password is required");
			return;
		}
		if (formData.password.length < 8) {
			toast.error("Password must be at least 8 characters");
			return;
		}
		if (formData.password !== formData.password_confirmation) {
			toast.error("Passwords do not match");
			return;
		}

		createMutation.mutate(formData);
	};

	if (!hasAccess) {
		return null;
	}

	return (
		<AuthenticatedLayout>
			<div className='mx-auto max-w-2xl space-y-6'>
				<div>
					<Button variant='ghost' size='sm' className='mb-2' onClick={() => router.push("/admin-management")}>
						<ArrowLeft className='mr-2 h-4 w-4' />
						Back to Admins
					</Button>
					<h1 className='text-3xl font-bold'>Create Admin User</h1>
					<p className='text-muted-foreground'>Add a new administrator to the system</p>
				</div>

				<Alert>
					<AlertCircle className='h-4 w-4' />
					<AlertDescription>
						New administrators will be created with <strong>POL Admin</strong> role by default. Only superadmins can manage admin
						accounts.
					</AlertDescription>
				</Alert>

				<Card>
					<CardHeader>
						<CardTitle>Admin Information</CardTitle>
						<CardDescription>Enter admin user details</CardDescription>
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

							<div className='space-y-2'>
								<Label htmlFor='password'>
									Password <span className='text-destructive'>*</span>
								</Label>
								<Input
									id='password'
									type='password'
									placeholder='Enter password (min. 8 characters)'
									value={formData.password}
									onChange={(e) => handleChange("password", e.target.value)}
									required
								/>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='password_confirmation'>
									Confirm Password <span className='text-destructive'>*</span>
								</Label>
								<Input
									id='password_confirmation'
									type='password'
									placeholder='Re-enter password'
									value={formData.password_confirmation}
									onChange={(e) => handleChange("password_confirmation", e.target.value)}
									required
								/>
							</div>

							<div className='flex gap-4'>
								<Button type='submit' disabled={createMutation.isPending}>
									{createMutation.isPending ? (
										<>
											<Loader2 className='h-4 w-4 mr-2 animate-spin' />
											Creating...
										</>
									) : (
										<>
											<Save className='h-4 w-4 mr-2' />
											Create Admin
										</>
									)}
								</Button>
								<Button
									type='button'
									variant='outline'
									onClick={() => router.push("/admin-management")}
									disabled={createMutation.isPending}>
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
