"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { vipsApi } from "@/lib/api/vips";
import { CreateVipPayload } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CreateVipPage() {
	const router = useRouter();
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState<CreateVipPayload>({
		first_name: "",
		last_name: "",
		contact_number: "",
		email: "",
		birth_date: "",
	});

	const [checkingDuplicate, setCheckingDuplicate] = useState(false);
	const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

	const createMutation = useMutation({
		mutationFn: (payload: CreateVipPayload) => vipsApi.create(payload),
		onSuccess: () => {
			toast.success("VIP created successfully");
			queryClient.invalidateQueries({ queryKey: ["vips"] });
			router.push("/vips");
		},
		onError: () => {
			toast.error("Failed to create VIP");
		},
	});

	const handleCheckDuplicate = async () => {
		if (!formData.first_name || !formData.last_name || !formData.birth_date) {
			return;
		}

		setCheckingDuplicate(true);
		setDuplicateWarning(null);

		try {
			const response = await vipsApi.checkExists({
				first_name: formData.first_name,
				last_name: formData.last_name,
				birth_date: formData.birth_date,
			});

			if (response.data?.exists) {
				setDuplicateWarning(`A VIP with this name and birth date already exists (ID: ${response.data.vip?.id})`);
			} else {
				toast.success("No duplicate found");
			}
		} catch (error) {
			console.error("Error checking duplicate:", error);
		} finally {
			setCheckingDuplicate(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		createMutation.mutate(formData);
	};

	return (
		<AuthenticatedLayout>
			<div className='mx-auto max-w-2xl space-y-6'>
				<div>
					<Link href='/vips'>
						<Button variant='ghost' size='sm' className='mb-2'>
							<ArrowLeft className='mr-2 h-4 w-4' />
							Back to VIPs
						</Button>
					</Link>
					<h1 className='text-3xl font-bold'>Add New VIP</h1>
					<p className='text-muted-foreground'>Register a new VIP in the system</p>
				</div>

				<form onSubmit={handleSubmit}>
					<Card>
						<CardHeader>
							<CardTitle>VIP Information</CardTitle>
							<CardDescription>Enter VIP details</CardDescription>
						</CardHeader>
						<CardContent className='space-y-6'>
							{duplicateWarning && (
								<Alert variant='destructive'>
									<AlertCircle className='h-4 w-4' />
									<AlertDescription>{duplicateWarning}</AlertDescription>
								</Alert>
							)}

							<div className='space-y-4'>
								<div className='grid gap-4 md:grid-cols-2'>
									<div className='space-y-2'>
										<Label htmlFor='first_name'>First Name *</Label>
										<Input
											id='first_name'
											required
											value={formData.first_name}
											onChange={(e) => {
												setFormData({ ...formData, first_name: e.target.value });
												setDuplicateWarning(null);
											}}
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='last_name'>Last Name *</Label>
										<Input
											id='last_name'
											required
											value={formData.last_name}
											onChange={(e) => {
												setFormData({ ...formData, last_name: e.target.value });
												setDuplicateWarning(null);
											}}
										/>
									</div>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='birth_date'>Birth Date *</Label>
									<Input
										id='birth_date'
										type='date'
										required
										value={formData.birth_date}
										onChange={(e) => {
											setFormData({ ...formData, birth_date: e.target.value });
											setDuplicateWarning(null);
										}}
									/>
								</div>

								<div className='space-y-2'>
									<Button type='button' variant='outline' onClick={handleCheckDuplicate} disabled={checkingDuplicate}>
										{checkingDuplicate ? (
											<>
												<Loader2 className='mr-2 h-4 w-4 animate-spin' />
												Checking...
											</>
										) : (
											"Check for Duplicate"
										)}
									</Button>
									<p className='text-sm text-muted-foreground'>Verify that this VIP doesn&apos;t already exist in the system</p>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='contact_number'>Contact Number *</Label>
									<Input
										id='contact_number'
										type='tel'
										required
										placeholder='+63 XXX XXX XXXX'
										value={formData.contact_number}
										onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
									/>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='email'>Email</Label>
									<Input
										id='email'
										type='email'
										placeholder='email@example.com'
										value={formData.email}
										onChange={(e) => setFormData({ ...formData, email: e.target.value })}
									/>
								</div>
							</div>

							{/* Submit Button */}
							<div className='flex gap-3'>
								<Button type='submit' disabled={createMutation.isPending}>
									{createMutation.isPending ? (
										<>
											<Loader2 className='mr-2 h-4 w-4 animate-spin' />
											Saving...
										</>
									) : (
										<>
											<Save className='mr-2 h-4 w-4' />
											Create VIP
										</>
									)}
								</Button>
								<Link href='/vips'>
									<Button type='button' variant='outline'>
										Cancel
									</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
				</form>
			</div>
		</AuthenticatedLayout>
	);
}
