"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { PolDeploymentsApi } from "@/lib/api/pol-deployments";
import { UpdatePolDeploymentPayload } from "@/types";

export default function EditPolDeploymentPage() {
	const params = useParams();
	const router = useRouter();
	const queryClient = useQueryClient();
	const id = parseInt(params.id as string);

	const [formData, setFormData] = useState<UpdatePolDeploymentPayload>({
		event_name: "",
		exact_venue: "",
		deployment_month: new Date().getMonth() + 1,
		deployment_year: new Date().getFullYear(),
	});

	const { data, isLoading, error } = useQuery({
		queryKey: ["pol-deployment", id],
		queryFn: () => PolDeploymentsApi.getById(id),
		enabled: !isNaN(id),
	});

	const updateMutation = useMutation({
		mutationFn: (payload: UpdatePolDeploymentPayload) => PolDeploymentsApi.update(id, payload),
		onSuccess: () => {
			toast.success("Deployment updated successfully");
			queryClient.invalidateQueries({ queryKey: ["pol-deployment", id] });
			queryClient.invalidateQueries({ queryKey: ["pol-deployments"] });
			router.push(`/pol-deployments/${id}`);
		},
		onError: () => {
			toast.error("Failed to update deployment");
		},
	});

	useEffect(() => {
		if (data?.data) {
			const deployment = data.data;
			setFormData({
				event_name: deployment.event_name,
				exact_venue: deployment.venue,
				lgu: deployment.lgu,
				barangay: deployment.barangay,
				region: deployment.region,
				district: deployment.district,
				province: deployment.province,
				deployment_month: new Date(deployment.date_start).getMonth() + 1,
				deployment_year: new Date(deployment.date_start).getFullYear(),
				turnover_date: deployment.date_end ? new Date(deployment.date_end).toISOString().split("T")[0] : undefined,
				pol_officer: deployment.assigned_to,
				category: undefined,
				asc_type: undefined,
				llc: undefined,
				psc: undefined,
				proponent: undefined,
				sector_recipient: undefined,
				count: undefined,
				unit: undefined,
				amount: deployment.donation_amount,
				source: deployment.source,
				donation_summary: deployment.donation_description,
				remarks: deployment.remarks,
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

	return (
		<AuthenticatedLayout>
			<div className='mx-auto max-w-4xl space-y-6'>
				{/* Header */}
				<div>
					<Link href={`/pol-deployments/${id}`}>
						<Button variant='ghost' size='sm' className='mb-2'>
							<ArrowLeft className='mr-2 h-4 w-4' />
							Back to Details
						</Button>
					</Link>
					<h1 className='text-3xl font-bold'>Edit POL Deployment</h1>
					<p className='text-muted-foreground'>Update deployment record</p>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit}>
					<Card>
						<CardHeader>
							<CardTitle>Deployment Information</CardTitle>
							<CardDescription>Update the deployment details</CardDescription>
						</CardHeader>
						<CardContent className='space-y-6'>
							{/* Basic Information */}
							<div className='space-y-4'>
								<h3 className='text-lg font-semibold'>Basic Information</h3>
								<div className='grid gap-4 md:grid-cols-2'>
									<div className='space-y-2'>
										<Label htmlFor='event_name'>Event Name *</Label>
										<Input
											id='event_name'
											required
											value={formData.event_name}
											onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='exact_venue'>Exact Venue *</Label>
										<Input
											id='exact_venue'
											required
											value={formData.exact_venue}
											onChange={(e) => setFormData({ ...formData, exact_venue: e.target.value })}
										/>
									</div>
								</div>
							</div>

							{/* Location Details */}
							<div className='space-y-4'>
								<h3 className='text-lg font-semibold'>Location Details</h3>
								<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
									<div className='space-y-2'>
										<Label htmlFor='lgu'>LGU</Label>
										<Input id='lgu' value={formData.lgu || ""} onChange={(e) => setFormData({ ...formData, lgu: e.target.value })} />
									</div>
									<div className='space-y-2'>
										<Label htmlFor='barangay'>Barangay</Label>
										<Input
											id='barangay'
											value={formData.barangay || ""}
											onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='region'>Region</Label>
										<Input
											id='region'
											value={formData.region || ""}
											onChange={(e) => setFormData({ ...formData, region: e.target.value })}
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='district'>District</Label>
										<Input
											id='district'
											value={formData.district || ""}
											onChange={(e) => setFormData({ ...formData, district: e.target.value })}
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='province'>Province</Label>
										<Input
											id='province'
											value={formData.province || ""}
											onChange={(e) => setFormData({ ...formData, province: e.target.value })}
										/>
									</div>
								</div>
							</div>

							{/* Deployment Date */}
							<div className='space-y-4'>
								<h3 className='text-lg font-semibold'>Deployment Date</h3>
								<div className='grid gap-4 md:grid-cols-3'>
									<div className='space-y-2'>
										<Label htmlFor='deployment_month'>Month *</Label>
										<Select
											value={formData.deployment_month.toString()}
											onValueChange={(value) => setFormData({ ...formData, deployment_month: parseInt(value) })}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
													<SelectItem key={month} value={month.toString()}>
														{new Date(2000, month - 1).toLocaleString("en", { month: "long" })}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='deployment_year'>Year *</Label>
										<Input
											id='deployment_year'
											type='number'
											required
											min='2020'
											max='2100'
											value={formData.deployment_year}
											onChange={(e) => setFormData({ ...formData, deployment_year: parseInt(e.target.value) })}
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='turnover_date'>Turnover Date</Label>
										<Input
											id='turnover_date'
											type='date'
											value={formData.turnover_date || ""}
											onChange={(e) => setFormData({ ...formData, turnover_date: e.target.value })}
										/>
									</div>
								</div>
							</div>

							{/* Assignment Details */}
							<div className='space-y-4'>
								<h3 className='text-lg font-semibold'>Assignment Details</h3>
								<div className='grid gap-4 md:grid-cols-2'>
									<div className='space-y-2'>
										<Label htmlFor='pol_officer'>POL Officer</Label>
										<Input
											id='pol_officer'
											value={formData.pol_officer || ""}
											onChange={(e) => setFormData({ ...formData, pol_officer: e.target.value })}
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='category'>Category</Label>
										<Input
											id='category'
											value={formData.category || ""}
											onChange={(e) => setFormData({ ...formData, category: e.target.value })}
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='asc_type'>ASC Type</Label>
										<Select
											value={formData.asc_type || ""}
											onValueChange={(value) => setFormData({ ...formData, asc_type: value as "virtual" | "actual" })}>
											<SelectTrigger>
												<SelectValue placeholder='Select type' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='virtual'>Virtual</SelectItem>
												<SelectItem value='actual'>Actual</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='llc'>LLC</Label>
										<Input id='llc' value={formData.llc || ""} onChange={(e) => setFormData({ ...formData, llc: e.target.value })} />
									</div>
									<div className='space-y-2'>
										<Label htmlFor='psc'>PSC</Label>
										<Input id='psc' value={formData.psc || ""} onChange={(e) => setFormData({ ...formData, psc: e.target.value })} />
									</div>
									<div className='space-y-2'>
										<Label htmlFor='proponent'>Proponent</Label>
										<Input
											id='proponent'
											value={formData.proponent || ""}
											onChange={(e) => setFormData({ ...formData, proponent: e.target.value })}
										/>
									</div>
								</div>
							</div>

							{/* Donation Details */}
							<div className='space-y-4'>
								<h3 className='text-lg font-semibold'>Donation Details</h3>
								<div className='grid gap-4 md:grid-cols-2'>
									<div className='space-y-2'>
										<Label htmlFor='sector_recipient'>Sector Recipient</Label>
										<Input
											id='sector_recipient'
											value={formData.sector_recipient || ""}
											onChange={(e) => setFormData({ ...formData, sector_recipient: e.target.value })}
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='count'>Count</Label>
										<Input
											id='count'
											type='number'
											min='0'
											value={formData.count || ""}
											onChange={(e) => setFormData({ ...formData, count: e.target.value ? parseInt(e.target.value) : undefined })}
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='unit'>Unit</Label>
										<Input id='unit' value={formData.unit || ""} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} />
									</div>
									<div className='space-y-2'>
										<Label htmlFor='amount'>Amount</Label>
										<Input
											id='amount'
											type='number'
											min='0'
											step='0.01'
											value={formData.amount || ""}
											onChange={(e) => setFormData({ ...formData, amount: e.target.value ? parseFloat(e.target.value) : undefined })}
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='source'>Source</Label>
										<Select value={formData.source || ""} onValueChange={(value) => setFormData({ ...formData, source: value as any })}>
											<SelectTrigger>
												<SelectValue placeholder='Select source' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='TESDA'>TESDA</SelectItem>
												<SelectItem value='DSWD-AICS'>DSWD-AICS</SelectItem>
												<SelectItem value='DOLE-DILP'>DOLE-DILP</SelectItem>
												<SelectItem value='DOLE-TUPAD'>DOLE-TUPAD</SelectItem>
												<SelectItem value='DOH-MAIFIP'>DOH-MAIFIP</SelectItem>
												<SelectItem value='Private'>Private</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='donation_summary'>Donation Summary</Label>
									<Textarea
										id='donation_summary'
										value={formData.donation_summary || ""}
										onChange={(e) => setFormData({ ...formData, donation_summary: e.target.value })}
										rows={3}
									/>
								</div>
							</div>

							{/* Remarks */}
							<div className='space-y-2'>
								<Label htmlFor='remarks'>Remarks</Label>
								<Textarea
									id='remarks'
									value={formData.remarks || ""}
									onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
									rows={3}
								/>
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
											Update Deployment
										</>
									)}
								</Button>
								<Link href={`/pol-deployments/${id}`}>
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
