"use client";

import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Save, AlertCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ascParticipationsApi } from "@/lib/api/asc-participations";
import { toast } from "sonner";
import type { UpdateAscParticipationPayload } from "@/types";

export default function EditParticipationPage() {
	const params = useParams();
	const router = useRouter();
	const queryClient = useQueryClient();

	const participationId = parseInt(params.id as string);

	const [formData, setFormData] = useState<UpdateAscParticipationPayload>({
		participant_name: "",
		participant_role: "",
		participation_date: "",
		remarks: "",
	});

	// Fetch participation details
	const {
		data: participation,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["asc-participation", participationId],
		queryFn: async () => {
			const response = await ascParticipationsApi.getById(participationId);
			return response.data;
		},
	});

	// Populate form when participation is loaded
	useEffect(() => {
		if (participation) {
			setFormData({
				participant_name: participation.participant_name,
				participant_role: participation.participant_role,
				participation_date: participation.participation_date,
				remarks: participation.remarks || "",
			});
		}
	}, [participation]);

	const updateMutation = useMutation({
		mutationFn: (payload: UpdateAscParticipationPayload) => ascParticipationsApi.update(participationId, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["asc-participation", participationId] });
			// Also invalidate the deployment participations list
			if (participation) {
				queryClient.invalidateQueries({ queryKey: ["asc-participations"] });
			}
			toast.success("Participation record updated successfully");
			router.back();
		},
		onError: (error: unknown) => {
			const message = (error as any)?.response?.data?.message || "Failed to update participation record";
			toast.error(message);
		},
	});

	const handleChange = (field: keyof UpdateAscParticipationPayload, value: string | number) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (formData.participant_name && !formData.participant_name.trim()) {
			toast.error("Participant name cannot be empty");
			return;
		}
		if (formData.participant_role && !formData.participant_role.trim()) {
			toast.error("Participant role cannot be empty");
			return;
		}

		updateMutation.mutate(formData);
	};

	if (isLoading) {
		return (
			<AuthenticatedLayout>
				<div className='flex items-center justify-center py-12'>
					<Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
				</div>
			</AuthenticatedLayout>
		);
	}

	if (error || !participation) {
		return (
			<AuthenticatedLayout>
				<div className='flex flex-col items-center justify-center py-12'>
					<AlertCircle className='h-12 w-12 text-destructive mb-4' />
					<p className='text-lg font-semibold mb-2'>Failed to load participation record</p>
					<Button onClick={() => router.back()} variant='outline'>
						<ArrowLeft className='h-4 w-4 mr-2' />
						Go Back
					</Button>
				</div>
			</AuthenticatedLayout>
		);
	}

	return (
		<AuthenticatedLayout>
			<div className='space-y-6'>
				{/* Header */}
				<div className='flex items-center gap-4'>
					<Button variant='outline' size='sm' onClick={() => router.back()}>
						<ArrowLeft className='h-4 w-4 mr-2' />
						Back
					</Button>
					<div>
						<h1 className='text-3xl font-bold'>Edit Participation Record</h1>
						<p className='text-muted-foreground'>Update participation record #{participationId}</p>
					</div>
				</div>

				{/* Form */}
				<Card>
					<CardHeader>
						<CardTitle>Participant Information</CardTitle>
						<CardDescription>Update the details for this participation record</CardDescription>
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

							{/* Metadata */}
							<div className='pt-4 border-t'>
								<p className='text-sm text-muted-foreground'>
									Created by {participation.created_by.name} on {new Date(participation.created_at).toLocaleString()}
								</p>
								{participation.updated_at !== participation.created_at && (
									<p className='text-sm text-muted-foreground'>Last updated: {new Date(participation.updated_at).toLocaleString()}</p>
								)}
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
											Update Record
										</>
									)}
								</Button>
								<Button type='button' variant='outline' onClick={() => router.back()} disabled={updateMutation.isPending}>
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
