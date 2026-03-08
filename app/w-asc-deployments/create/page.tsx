"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { WAscDeploymentsApi } from "@/lib/api/w-asc-deployments";
import { CreateWAscDeploymentPayload, SectorType } from "@/types";

export default function CreateWAscDeploymentPage() {
	const router = useRouter();
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState<CreateWAscDeploymentPayload>({
		exact_venue: "",
		deployment_month: new Date().getMonth() + 1,
		deployment_year: new Date().getFullYear(),
		exact_date: new Date().toISOString().split("T")[0],
		has_socials: false,
		has_sortie: false,
		asc_attended: false,
		llc_attended: false,
		psc_attended: false,
		pol_activities: [],
	});

	const [polActivityInput, setPolActivityInput] = useState("");

	const createMutation = useMutation({
		mutationFn: (payload: CreateWAscDeploymentPayload) => WAscDeploymentsApi.create(payload),
		onSuccess: () => {
			toast.success("W ASC Deployment created successfully");
			queryClient.invalidateQueries({ queryKey: ["w-asc-deployments"] });
			router.push("/w-asc-deployments");
		},
		onError: () => {
			toast.error("Failed to create W ASC deployment");
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		createMutation.mutate(formData);
	};

	const handleAddPolActivity = () => {
		if (polActivityInput.trim()) {
			setFormData({
				...formData,
				pol_activities: [...(formData.pol_activities || []), polActivityInput.trim()],
			});
			setPolActivityInput("");
		}
	};

	const handleRemovePolActivity = (index: number) => {
		setFormData({
			...formData,
			pol_activities: formData.pol_activities?.filter((_, i) => i !== index) || [],
		});
	};

	return (
		<AuthenticatedLayout>
			<div className='mx-auto max-w-4xl space-y-6'>
				<div>
					<Link href='/w-asc-deployments'>
						<Button variant='ghost' size='sm' className='mb-2'>
							<ArrowLeft className='mr-2 h-4 w-4' />
							Back to Deployments
						</Button>
					</Link>
					<h1 className='text-3xl font-bold'>Create W ASC Deployment</h1>
					<p className='text-muted-foreground'>Add a new W ASC deployment record</p>
				</div>

				<form onSubmit={handleSubmit}>
					<Card>
						<CardHeader>
							<CardTitle>Deployment Information</CardTitle>
							<CardDescription>Enter the details for the new W ASC deployment</CardDescription>
						</CardHeader>
						<CardContent className='space-y-6'>
							{/* Basic Information */}
							<div className='space-y-4'>
								<h3 className='text-lg font-semibold'>Basic Information</h3>
								<div className='grid gap-4 md:grid-cols-2'>
									<div className='space-y-2'>
										<Label htmlFor='exact_venue'>Exact Venue *</Label>
										<Input
											id='exact_venue'
											required
											value={formData.exact_venue}
											onChange={(e) => setFormData({ ...formData, exact_venue: e.target.value })}
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='event_tagging'>Event Tagging</Label>
										<Input
											id='event_tagging'
											value={formData.event_tagging || ""}
											onChange={(e) => setFormData({ ...formData, event_tagging: e.target.value })}
										/>
									</div>
								</div>
							</div>

							{/* Location Details */}
							<div className='space-y-4'>
								<h3 className='text-lg font-semibold'>Location Details</h3>
								<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
									<div className='space-y-2'>
										<Label htmlFor='barangay'>Barangay</Label>
										<Input
											id='barangay'
											value={formData.barangay || ""}
											onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='city_municipality'>City/Municipality</Label>
										<Input
											id='city_municipality'
											value={formData.city_municipality || ""}
											onChange={(e) => setFormData({ ...formData, city_municipality: e.target.value })}
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
								</div>
							</div>

							{/* Deployment Date */}
							<div className='space-y-4'>
								<h3 className='text-lg font-semibold'>Deployment Date</h3>
								<div className='grid gap-4 md:grid-cols-3'>
									<div className='space-y-2'>
										<Label htmlFor='exact_date'>Exact Date *</Label>
										<Input
											id='exact_date'
											type='date'
											required
											value={formData.exact_date}
											onChange={(e) => setFormData({ ...formData, exact_date: e.target.value })}
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='deployment_month'>Month *</Label>
										<Select
											value={formData.deployment_month.toString()}
											onValueChange={(value) => value && setFormData({ ...formData, deployment_month: parseInt(value) })}>
											<SelectTrigger>
												<SelectValue>
													{formData.deployment_month
														? new Date(2000, formData.deployment_month - 1).toLocaleString("en", { month: "long" })
														: "Select month"}
												</SelectValue>
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
								</div>
							</div>

							{/* Attendance Flags */}
							<div className='space-y-4'>
								<h3 className='text-lg font-semibold'>Attendance & Activities</h3>
								<div className='grid gap-4 md:grid-cols-2'>
									<div className='flex items-center space-x-2'>
										<Checkbox
											id='has_socials'
											checked={formData.has_socials}
											onCheckedChange={(checked) => setFormData({ ...formData, has_socials: checked === true })}
										/>
										<Label htmlFor='has_socials' className='cursor-pointer'>
											Has Socials
										</Label>
									</div>
									<div className='flex items-center space-x-2'>
										<Checkbox
											id='has_sortie'
											checked={formData.has_sortie}
											onCheckedChange={(checked) => setFormData({ ...formData, has_sortie: checked === true })}
										/>
										<Label htmlFor='has_sortie' className='cursor-pointer'>
											Has Sortie
										</Label>
									</div>
									<div className='flex items-center space-x-2'>
										<Checkbox
											id='asc_attended'
											checked={formData.asc_attended}
											onCheckedChange={(checked) => setFormData({ ...formData, asc_attended: checked === true })}
										/>
										<Label htmlFor='asc_attended' className='cursor-pointer'>
											ASC Attended
										</Label>
									</div>
									<div className='flex items-center space-x-2'>
										<Checkbox
											id='llc_attended'
											checked={formData.llc_attended}
											onCheckedChange={(checked) => setFormData({ ...formData, llc_attended: checked === true })}
										/>
										<Label htmlFor='llc_attended' className='cursor-pointer'>
											LLC Attended
										</Label>
									</div>
									<div className='flex items-center space-x-2'>
										<Checkbox
											id='psc_attended'
											checked={formData.psc_attended}
											onCheckedChange={(checked) => setFormData({ ...formData, psc_attended: checked === true })}
										/>
										<Label htmlFor='psc_attended' className='cursor-pointer'>
											PSC Attended
										</Label>
									</div>
								</div>
							</div>

							{/* POL Activities */}
							<div className='space-y-4'>
								<h3 className='text-lg font-semibold'>POL Activities</h3>
								<div className='flex gap-2'>
									<Input
										placeholder='Enter POL activity'
										value={polActivityInput}
										onChange={(e) => setPolActivityInput(e.target.value)}
										onKeyPress={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
												handleAddPolActivity();
											}
										}}
									/>
									<Button type='button' onClick={handleAddPolActivity}>
										Add
									</Button>
								</div>
								{formData.pol_activities && formData.pol_activities.length > 0 && (
									<div className='space-y-2'>
										{formData.pol_activities.map((activity, index) => (
											<div key={index} className='flex items-center justify-between p-2 bg-muted rounded'>
												<span>{activity}</span>
												<Button type='button' variant='ghost' size='sm' onClick={() => handleRemovePolActivity(index)}>
													Remove
												</Button>
											</div>
										))}
									</div>
								)}
							</div>

							{/* Sector */}
							<div className='space-y-4'>
								<h3 className='text-lg font-semibold'>Additional Details</h3>
								<div className='grid gap-4 md:grid-cols-2'>
									<div className='space-y-2'>
										<Label htmlFor='sector'>Sector</Label>
										<Select
											value={formData.sector || ""}
											onValueChange={(value) => setFormData({ ...formData, sector: value as SectorType })}>
											<SelectTrigger>
												<SelectValue placeholder='Select sector' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='Health'>Health</SelectItem>
												<SelectItem value='Education'>Education</SelectItem>
												<SelectItem value='Agriculture'>Agriculture</SelectItem>
												<SelectItem value='Infrastructure'>Infrastructure</SelectItem>
												<SelectItem value='Social Services'>Social Services</SelectItem>
												<SelectItem value='Others'>Others</SelectItem>
											</SelectContent>
										</Select>
									</div>
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
								<Button type='submit' disabled={createMutation.isPending}>
									{createMutation.isPending ? (
										<>
											<Loader2 className='mr-2 h-4 w-4 animate-spin' />
											Saving...
										</>
									) : (
										<>
											<Save className='mr-2 h-4 w-4' />
											Create Deployment
										</>
									)}
								</Button>
								<Link href='/w-asc-deployments'>
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
