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
import { ascDirectivesApi } from "@/lib/api/asc-directives";
import { toast } from "sonner";
import type { DeploymentType, CreateAscDirectivePayload } from "@/types";

export default function CreateDirectivePage() {
	const params = useParams();
	const router = useRouter();
	const queryClient = useQueryClient();

	const deploymentType = params.deploymentType as DeploymentType;
	const deploymentId = parseInt(params.deploymentId as string);

	const [formData, setFormData] = useState<CreateAscDirectivePayload>({
		event_id: deploymentId,
		directive_text: "",
		issued_by: "",
		issued_date: "",
	});

	const createMutation = useMutation({
		mutationFn: (payload: CreateAscDirectivePayload) => ascDirectivesApi.create(deploymentType, deploymentId, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["asc-directives", deploymentType, deploymentId] });
			toast.success("Directive created successfully");
			router.push(`/asc-directives/${deploymentType}/${deploymentId}`);
		},
		onError: (error: unknown) => {
			const message =
				(error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to create directive";
			toast.error(message);
		},
	});

	const handleChange = (field: keyof CreateAscDirectivePayload, value: string | number) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (!formData.directive_text.trim()) {
			toast.error("Directive text is required");
			return;
		}
		if (!formData.issued_by.trim()) {
			toast.error("Issued by is required");
			return;
		}
		if (!formData.issued_date) {
			toast.error("Issued date is required");
			return;
		}

		createMutation.mutate(formData);
	};

	return (
		<AuthenticatedLayout>
			<div className='space-y-6'>
				{/* Header */}
				<div className='flex items-center gap-4'>
					<Button variant='outline' size='sm' onClick={() => router.push(`/asc-directives/${deploymentType}/${deploymentId}`)}>
						<ArrowLeft className='h-4 w-4 mr-2' />
						Back
					</Button>
					<div>
						<h1 className='text-3xl font-bold'>Create ASC Directive</h1>
						<p className='text-muted-foreground'>
							Add a new directive for {deploymentType === "pol-deployment" ? "POL" : "W ASC"} Deployment #{deploymentId}
						</p>
					</div>
				</div>

				{/* Form */}
				<Card>
					<CardHeader>
						<CardTitle>Directive Information</CardTitle>
						<CardDescription>Enter the details for the new directive</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className='space-y-6'>
							<div className='space-y-2'>
								<Label htmlFor='directive_text'>
									Directive Text <span className='text-destructive'>*</span>
								</Label>
								<Textarea
									id='directive_text'
									placeholder='Enter the directive text...'
									value={formData.directive_text}
									onChange={(e) => handleChange("directive_text", e.target.value)}
									rows={6}
									required
								/>
								<p className='text-xs text-muted-foreground'>Provide clear and detailed instructions</p>
							</div>

							<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
								<div className='space-y-2'>
									<Label htmlFor='issued_by'>
										Issued By <span className='text-destructive'>*</span>
									</Label>
									<Input
										id='issued_by'
										type='text'
										placeholder='Name of issuing authority'
										value={formData.issued_by}
										onChange={(e) => handleChange("issued_by", e.target.value)}
										required
									/>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='issued_date'>
										Issued Date <span className='text-destructive'>*</span>
									</Label>
									<Input
										id='issued_date'
										type='date'
										value={formData.issued_date}
										onChange={(e) => handleChange("issued_date", e.target.value)}
										required
									/>
								</div>
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
											Create Directive
										</>
									)}
								</Button>
								<Button
									type='button'
									variant='outline'
									onClick={() => router.push(`/asc-directives/${deploymentType}/${deploymentId}`)}
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
