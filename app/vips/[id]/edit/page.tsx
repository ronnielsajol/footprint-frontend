"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { VipsApi } from "@/lib/api/vips";
import { UpdateVipPayload } from "@/types";

export default function EditVipPage() {
	const params = useParams();
	const router = useRouter();
	const queryClient = useQueryClient();
	const id = parseInt(params.id as string);

	const [formData, setFormData] = useState<UpdateVipPayload>({
		first_name: "",
		last_name: "",
		contact_number: "",
		email: "",
		birth_date: "",
	});

	const { data, isLoading, error } = useQuery({
		queryKey: ["vip", id],
		queryFn: () => VipsApi.getById(id),
		enabled: !isNaN(id),
	});

	const updateMutation = useMutation({
		mutationFn: (payload: UpdateVipPayload) => VipsApi.update(id, payload),
		onSuccess: () => {
			toast.success("VIP updated successfully");
			queryClient.invalidateQueries({ queryKey: ["vip", id] });
			queryClient.invalidateQueries({ queryKey: ["vips"] });
			router.push(`/vips/${id}`);
		},
		onError: () => {
			toast.error("Failed to update VIP");
		},
	});

	useEffect(() => {
		if (data?.data) {
			const vip = data.data;
			setFormData({
				first_name: vip.first_name,
				last_name: vip.last_name,
				contact_number: vip.contact_number,
				email: vip.email || "",
				birth_date: vip.birth_date,
			});
		}
	}, [data]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		updateMutation.mutate(formData);
	};

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

	return (
		<AuthenticatedLayout>
			<div className='mx-auto max-w-2xl space-y-6'>
				<div>
					<Link href={`/vips/${id}`}>
						<Button variant='ghost' size='sm' className='mb-2'>
							<ArrowLeft className='mr-2 h-4 w-4' />
							Back to Details
						</Button>
					</Link>
					<h1 className='text-3xl font-bold'>Edit VIP</h1>
					<p className='text-muted-foreground'>Update VIP information</p>
				</div>

				<form onSubmit={handleSubmit}>
					<Card>
						<CardHeader>
							<CardTitle>VIP Information</CardTitle>
							<CardDescription>Update VIP details</CardDescription>
						</CardHeader>
						<CardContent className='space-y-6'>
							<div className='space-y-4'>
								<div className='grid gap-4 md:grid-cols-2'>
									<div className='space-y-2'>
										<Label htmlFor='first_name'>First Name *</Label>
										<Input
											id='first_name'
											required
											value={formData.first_name}
											onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='last_name'>Last Name *</Label>
										<Input
											id='last_name'
											required
											value={formData.last_name}
											onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
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
										onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
									/>
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
								<Button type='submit' disabled={updateMutation.isPending}>
									{updateMutation.isPending ? (
										<>
											<Loader2 className='mr-2 h-4 w-4 animate-spin' />
											Saving...
										</>
									) : (
										<>
											<Save className='mr-2 h-4 w-4' />
											Update VIP
										</>
									)}
								</Button>
								<Link href={`/vips/${id}`}>
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
