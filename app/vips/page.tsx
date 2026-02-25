"use client";

import { useState } from "react";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye, Edit, Loader2, AlertCircle, User, Phone, Mail, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { vipsApi } from "@/lib/api/vips";
import type { VipFilters } from "@/types";

export default function VipsPage() {
	const router = useRouter();
	const [filters, setFilters] = useState<VipFilters>({
		search: "",
	});

	// Fetch VIPs with filters
	const { data, isLoading, error } = useQuery({
		queryKey: ["vips", filters],
		queryFn: async () => {
			const response = await vipsApi.getAll(filters);
			return response.data;
		},
	});

	return (
		<AuthenticatedLayout>
			<div className='space-y-6'>
				{/* Header */}
				<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
					<div>
						<h1 className='text-3xl font-bold'>VIPs Management</h1>
						<p className='text-muted-foreground'>Manage VIP database and contacts</p>
					</div>
					<Button onClick={() => router.push("/vips/create")}>
						<Plus className='mr-2 h-4 w-4' />
						Add VIP
					</Button>
				</div>

				{/* Search */}
				<Card>
					<CardContent className='pt-6'>
						<div className='relative'>
							<Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
							<Input
								placeholder='Search by name, email, or contact number...'
								className='pl-10'
								value={filters.search}
								onChange={(e) => setFilters({ ...filters, search: e.target.value })}
							/>
						</div>
					</CardContent>
				</Card>

				{/* VIPs List */}
				<Card>
					<CardHeader>
						<CardTitle>VIP Records</CardTitle>
						<CardDescription>All registered VIPs in the system</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoading && (
							<div className='flex items-center justify-center py-8'>
								<Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
								<span className='ml-2 text-muted-foreground'>Loading VIPs...</span>
							</div>
						)}

						{error && (
							<div className='flex items-center justify-center py-8 text-destructive'>
								<AlertCircle className='h-5 w-5 mr-2' />
								<span>Failed to load VIPs</span>
							</div>
						)}

						{!isLoading && !error && data?.data?.length === 0 && (
							<div className='text-center py-8 text-muted-foreground'>
								<p>No VIPs found</p>
								<Button variant='outline' size='sm' className='mt-4' onClick={() => router.push("/vips/create")}>
									<Plus className='h-4 w-4 mr-2' />
									Add First VIP
								</Button>
							</div>
						)}

						{!isLoading && !error && data && data.data && data.data.length > 0 && (
							<div className='space-y-4'>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>ID</TableHead>
											<TableHead>Full Name</TableHead>
											<TableHead>Contact Number</TableHead>
											<TableHead>Email</TableHead>
											<TableHead>Birth Date</TableHead>
											<TableHead>Events</TableHead>
											<TableHead className='text-right'>Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{data.data.map((vip) => (
											<TableRow key={vip.id}>
												<TableCell className='font-medium'>{vip.id}</TableCell>
												<TableCell>
													<div className='flex items-center gap-2'>
														<User className='h-4 w-4 text-muted-foreground' />
														<span className='font-medium'>{vip.full_name}</span>
													</div>
												</TableCell>
												<TableCell>
													<div className='flex items-center gap-2'>
														<Phone className='h-4 w-4 text-muted-foreground' />
														<span>{vip.contact_number}</span>
													</div>
												</TableCell>
												<TableCell>
													{vip.email ? (
														<div className='flex items-center gap-2'>
															<Mail className='h-4 w-4 text-muted-foreground' />
															<span className='max-w-xs truncate'>{vip.email}</span>
														</div>
													) : (
														<span className='text-muted-foreground'>N/A</span>
													)}
												</TableCell>
												<TableCell>
													<div className='flex items-center gap-2'>
														<Calendar className='h-4 w-4 text-muted-foreground' />
														<span>{new Date(vip.birth_date).toLocaleDateString()}</span>
													</div>
												</TableCell>
												<TableCell>
													<Badge variant='secondary'>{vip.events_count ?? 0} events</Badge>
												</TableCell>
												<TableCell className='text-right'>
													<div className='flex items-center justify-end gap-2'>
														<Button size='sm' variant='ghost' onClick={() => router.push(`/vips/${vip.id}`)}>
															<Eye className='h-4 w-4' />
														</Button>
														<Button size='sm' variant='ghost' onClick={() => router.push(`/vips/${vip.id}/edit`)}>
															<Edit className='h-4 w-4' />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>

								{data.meta && (
									<p className='text-sm text-muted-foreground text-center'>
										Showing {data.data.length} of {data.meta.total} VIPs
									</p>
								)}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</AuthenticatedLayout>
	);
}
