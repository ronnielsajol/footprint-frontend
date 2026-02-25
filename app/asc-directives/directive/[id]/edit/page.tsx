"use client";

import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Save, AlertCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ascDirectivesApi } from "@/lib/api/asc-directives";
import { toast } from "sonner";
import type { UpdateAscDirectivePayload } from "@/types";

export default function EditDirectivePage() {
	const params = useParams();
	const router = useRouter();
	const queryClient = useQueryClient();

	const directiveId = parseInt(params.id as string);

	const [formData, setFormData] = useState<UpdateAscDirectivePayload>({
		directive_text: "",
		issued_by: "",
		issued_date: "",
	});

	// Fetch directive details
	const {
		data: directive,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["asc-directive", directiveId],
		queryFn: async () => {
			const response = await ascDirectivesApi.getById(directiveId);
			return response.data;
		},
	});

	// Populate form when directive is loaded
	// Initialize form data from directive (render-based)
	if (directive && formData.directive_text === "") {
		setFormData({
			directive_text: directive.directive_text,
			issued_by: directive.issued_by,
			issued_date: directive.issued_date,
		});
	}
	const updateMutation = useMutation({
		mutationFn: (payload: UpdateAscDirectivePayload) => ascDirectivesApi.update(directiveId, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["asc-directive", directiveId] });
			// Also invalidate the deployment directives list
			if (directive) {
				queryClient.invalidateQueries({ queryKey: ["asc-directives"] });
			}
			toast.success("Directive updated successfully");
			router.back();
		},
		onError: (error: unknown) => {
			const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to update directive";
			toast.error(message);
		},
	});

	const handleChange = (field: keyof UpdateAscDirectivePayload, value: string | number) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (formData.directive_text && !formData.directive_text.trim()) {
			toast.error("Directive text cannot be empty");
			return;
		}
		if (formData.issued_by && !formData.issued_by.trim()) {
			toast.error("Issued by cannot be empty");
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

	if (error || !directive) {
		return (
			<AuthenticatedLayout>
				<div className='flex flex-col items-center justify-center py-12'>
					<AlertCircle className='h-12 w-12 text-destructive mb-4' />
					<p className='text-lg font-semibold mb-2'>Failed to load directive</p>
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
						<h1 className='text-3xl font-bold'>Edit ASC Directive</h1>
						<p className='text-muted-foreground'>Update directive #{directiveId}</p>
					</div>
				</div>

				{/* Form */}
				<Card>
					<CardHeader>
						<CardTitle>Directive Information</CardTitle>
						<CardDescription>Update the details for this directive</CardDescription>
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

							{/* Metadata */}
							<div className='pt-4 border-t'>
								<p className='text-sm text-muted-foreground'>
									Created by {directive.created_by.name} on {new Date(directive.created_at).toLocaleString()}
								</p>
								{directive.updated_at !== directive.created_at && (
									<p className='text-sm text-muted-foreground'>Last updated: {new Date(directive.updated_at).toLocaleString()}</p>
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
											Update Directive
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
