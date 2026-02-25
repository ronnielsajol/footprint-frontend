"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { polDeploymentsApi } from "@/lib/api/pol-deployments";
import { CreatePolDeploymentPayload } from "@/types";

export default function CreatePolDeploymentPage() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState<CreatePolDeploymentPayload>({
		event_name: "",
		exact_venue: "",
		deployment_month: new Date().getMonth() + 1,
		deployment_year: new Date().getFullYear(),
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const response = await polDeploymentsApi.create(formData);
			if (response.success) {
				toast.success(response.message);
				router.push("/pol-deployments");
			} else {
				toast.error(response.message);
			}
		} catch (error: any) {
			toast.error(error.message || "Failed to create deployment");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<AuthenticatedLayout>
			<div className='mx-auto max-w-4xl space-y-6'>
				{/* Header */}
				<div>
					<Link href='/pol-deployments'>
						<Button variant='ghost' size='sm' className='mb-2'>
							<ArrowLeft className='mr-2 h-4 w-4' />
							Back to Deployments
						</Button>
					</Link>
					<h1 className='text-3xl font-bold'>Create POL Deployment</h1>
					<p className='text-muted-foreground'>Add a new POL deployment record</p>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit}>
					<Card>
						<CardHeader>
							<CardTitle>Deployment Information</CardTitle>
							<CardDescription>Enter the details for the new deployment</CardDescription>
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
								<Button type='submit' disabled={isSubmitting}>
									{isSubmitting ? (
										<>Saving...</>
									) : (
										<>
											<Save className='mr-2 h-4 w-4' />
											Create Deployment
										</>
									)}
								</Button>
								<Link href='/pol-deployments'>
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
