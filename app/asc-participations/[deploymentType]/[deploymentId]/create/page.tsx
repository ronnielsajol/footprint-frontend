"use client";

import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ascParticipationsApi } from "@/lib/api/asc-participations";
import { toast } from "sonner";
import type { DeploymentType, CreateAscParticipationPayload } from "@/types";

export default function CreateParticipationPage() {
	const params = useParams();
	const router = useRouter();
	const queryClient = useQueryClient();

	const deploymentType = params.deploymentType as DeploymentType;
	const deploymentId = parseInt(params.deploymentId as string);

	const [formData, setFormData] = useState<CreateAscParticipationPayload>({
		event_id: deploymentId,
		participant_name: "",
		participant_role: "",
		participation_date: "",
		remarks: "",
	});

	const createMutation = useMutation({
		mutationFn: (payload: CreateAscParticipationPayload) =>
			ascParticipationsApi.create(deploymentType, deploymentId, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["asc-participations", deploymentType, deploymentId] });
			toast.success("Participation record created successfully");
			router.push(`/asc-participations/${deploymentType}/${deploymentId}`);
		},
		onError: (error: unknown) => {
			const message =
				(error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
				"Failed to create participation record";
			toast.error(message);
		},
	});

	const handleChange = (field: keyof CreateAscParticipationPayload, value: string | number) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (!formData.participant_name.trim()) {
			toast.error("Participant name is required");
			return;
		}
		if (!formData.participant_role.trim()) {
			toast.error("Participant role is required");
			return;
		}
		if (!formData.participation_date) {
			toast.error("Participation date is required");
			return;
		}

		createMutation.mutate(formData);
	};

	return (
		<AuthenticatedLayout>
			<div className='space-y-6'>
				{/* Header */}
				<div className='flex items-center gap-4'>
					<Button
						variant='outline'
						size='sm'
						onClick={() => router.push(`/asc-participations/${deploymentType}/${deploymentId}`)}>
						<ArrowLeft className='h-4 w-4 mr-2' />
						Back
					</Button>
					<div>
						<h1 className='text-3xl font-bold'>Add Participation Record</h1>
						<p className='text-muted-foreground'>
							Add a new participant for {deploymentType === "pol-deployment" ? "POL" : "W ASC"} Deployment #{deploymentId}
						</p>
					</div>
				</div>

				{/* Form */}
				<Card>
					<CardHeader>
						<CardTitle>Participant Information</CardTitle>
						<CardDescription>Enter the details for the new participation record</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className='space-y-6'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
								<div className='space-y-2'>
									<Label htmlFor='participant_name'>
										Participant Name <span className='text-destructive'>*</span>
									</Label>
									<Input
										id='participant_name'
										type='text'
										placeholder='Enter participant name'
										value={formData.participant_name}
										onChange={(e) => handleChange("participant_name", e.target.value)}
										required
									/>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='participant_role'>
										Role <span className='text-destructive'>*</span>
									</Label>
									<Input
										id='participant_role'
										type='text'
										placeholder='e.g., Coordinator, Assistant, etc.'
										value={formData.participant_role}
										onChange={(e) => handleChange("participant_role", e.target.value)}
										required
									/>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='participation_date'>
										Participation Date <span className='text-destructive'>*</span>
									</Label>
									<Input
										id='participation_date'
										type='date'
										value={formData.participation_date}
										onChange={(e) => handleChange("participation_date", e.target.value)}
										required
									/>
								</div>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='remarks'>Remarks</Label>
								<Textarea
									id='remarks'
									placeholder='Optional remarks or notes...'
									value={formData.remarks}
									onChange={(e) => handleChange("remarks", e.target.value)}
									rows={4}
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
											Create Record
										</>
									)}
								</Button>
								<Button
									type='button'
									variant='outline'
									onClick={() => router.push(`/asc-participations/${deploymentType}/${deploymentId}`)}
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
