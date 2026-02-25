// ============================================
// Core API Response Types
// ============================================

export interface ApiResponse<T> {
	success: boolean;
	message: string;
	data: T | null;
	errors?: Record<string, string[]>;
}

export interface ApiError extends Error {
	status?: number;
	error?: string;
	errors?: string[];
}

export interface ErrorResponse {
	response?: {
		data?: {
			message?: string;
		};
	};
}

// ============================================
// Pagination Types
// ============================================

export interface PaginatedResponse<T> {
	data: T[];
	links: {
		first: string | null;
		last: string | null;
		prev: string | null;
		next: string | null;
	};
	meta: {
		current_page: number;
		from: number | null;
		last_page: number;
		links: Array<{
			url: string | null;
			label: string;
			active: boolean;
		}>;
		path: string;
		per_page: number;
		to: number | null;
		total: number;
	};
}

// ============================================
// User Types
// ============================================

export type UserRole = "superadmin" | "pol_admin";

export interface User {
	id: number;
	name: string;
	email: string;
	role: UserRole;
	created_at: string;
	updated_at: string;
}

export interface UserWithAuth extends User {
	email_verified_at: string | null;
}

export interface AuthResponse {
	user: User;
	token: string;
}

// ============================================
// VIP Types
// ============================================

export interface Vip {
	id: number;
	first_name: string;
	last_name: string;
	full_name: string;
	contact_number: string;
	email: string | null;
	birth_date: string;
	created_by: {
		id: number;
		name: string;
	};
	events_count?: number;
	pivot?: {
		remarks: string | null;
	};
	created_at: string;
	updated_at: string;
}

export interface CreateVipPayload {
	first_name: string;
	last_name: string;
	contact_number: string;
	email?: string;
	birth_date: string;
}

export type UpdateVipPayload = Partial<CreateVipPayload>;

export interface VipFilters {
	search?: string;
	per_page?: number;
}

export interface CheckVipExistsParams {
	first_name: string;
	last_name: string;
	birth_date: string;
}

export interface CheckVipExistsResponse {
	exists: boolean;
	vip: Vip | null;
}

// ============================================
// POL Deployment Types
// ============================================

export type SourceType = "TESDA" | "DSWD-AICS" | "DOLE-DILP" | "DOLE-TUPAD" | "DOH-MAIFIP" | "Private";

export type AscType = "virtual" | "actual";

export interface PolDeployment {
	id: number;
	event_name: string;
	exact_venue: string;
	lgu: string | null;
	barangay: string | null;
	region: string | null;
	district: string | null;
	province: string | null;
	deployment_month: number;
	deployment_year: number;
	turnover_date: string | null;
	pol_officer: string | null;
	category: string | null;
	asc_type: AscType | null;
	llc: string | null;
	psc: string | null;
	proponent: string | null;
	sector_recipient: string | null;
	count: number | null;
	unit: string | null;
	donation_summary: string | null;
	amount: number | null;
	source: SourceType | null;
	remarks: string | null;
	created_by: number;
	created_at: string;
	updated_at: string;
	creator?: User;
	vips?: Vip[];
	asc_directives?: AscDirective[];
	asc_participations?: AscParticipation[];
}

export interface CreatePolDeploymentPayload {
	event_name: string;
	exact_venue: string;
	lgu?: string;
	barangay?: string;
	region?: string;
	district?: string;
	province?: string;
	deployment_month: number;
	deployment_year: number;
	turnover_date?: string;
	pol_officer?: string;
	category?: string;
	asc_type?: AscType;
	llc?: string;
	psc?: string;
	proponent?: string;
	sector_recipient?: string;
	count?: number;
	unit?: string;
	donation_summary?: string;
	amount?: number;
	source?: SourceType;
	remarks?: string;
}

export type UpdatePolDeploymentPayload = Partial<CreatePolDeploymentPayload>;

export interface PolDeploymentFilters {
	search?: string;
	year?: number;
	month?: number;
	source?: SourceType;
	category?: string;
	asc_type?: AscType;
	sort_by?: "deployment_month" | "deployment_year" | "event_name" | "created_at";
	sort_order?: "asc" | "desc";
	per_page?: number;
}

export interface AddVipToDeploymentPayload {
	vip_id: number;
	remarks?: string;
}

// ============================================
// W ASC Deployment Types
// ============================================

export type SectorType = "PTK" | "Kababaihan" | "MSMEs" | "Youth" | "BHW";

export interface WAscDeployment {
	id: number;
	exact_venue: string;
	barangay: string | null;
	city_municipality: string | null;
	region: string | null;
	district: string | null;
	province: string | null;
	deployment_month: number;
	deployment_year: number;
	exact_date: string;
	event_tagging: string | null;
	has_socials: boolean;
	has_sortie: boolean;
	asc_attended: boolean;
	llc_attended: boolean;
	psc_attended: boolean;
	pol_activities: string[] | null;
	sector: SectorType | null;
	remarks: string | null;
	created_by: number;
	created_at: string;
	updated_at: string;
	creator?: User;
	officers?: WAscDeploymentOfficer[];
	vips?: Vip[];
	asc_directives?: AscDirective[];
	asc_participations?: AscParticipation[];
}

export interface WAscDeploymentOfficer {
	id: number;
	w_asc_deployment_id: number;
	name: string;
	rank: string | null;
	position: string | null;
	unit: string | null;
	created_at: string;
	updated_at: string;
}

export interface CreateWAscDeploymentPayload {
	exact_venue: string;
	barangay?: string;
	city_municipality?: string;
	region?: string;
	district?: string;
	province?: string;
	deployment_month: number;
	deployment_year: number;
	exact_date: string;
	event_tagging?: string;
	has_socials?: boolean;
	has_sortie?: boolean;
	asc_attended?: boolean;
	llc_attended?: boolean;
	psc_attended?: boolean;
	pol_activities?: string[];
	sector?: SectorType;
	remarks?: string;
}

export type UpdateWAscDeploymentPayload = Partial<CreateWAscDeploymentPayload>;

export interface WAscDeploymentFilters {
	search?: string;
	year?: number;
	month?: number;
	sector?: SectorType;
	sort_by?: "deployment_month" | "deployment_year" | "exact_date" | "created_at";
	sort_order?: "asc" | "desc";
	per_page?: number;
}

export interface AddOfficerPayload {
	name: string;
	rank?: string;
	position?: string;
	unit?: string;
}

export type UpdateOfficerPayload = Partial<AddOfficerPayload>;

// ============================================
// ASC Directive Types
// ============================================

export interface AscDirective {
	id: number;
	event_id: number;
	directive_text: string;
	issued_by: string;
	issued_date: string;
	created_by: {
		id: number;
		name: string;
	};
	created_at: string;
	updated_at: string;
}

export interface CreateAscDirectivePayload {
	event_id: number;
	directive_text: string;
	issued_by: string;
	issued_date: string;
}

export type UpdateAscDirectivePayload = Partial<CreateAscDirectivePayload>;

// ============================================
// ASC Participation Types
// ============================================

export interface AscParticipation {
	id: number;
	event_id: number;
	participant_name: string;
	participant_role: string;
	participation_date: string;
	remarks: string | null;
	created_by: {
		id: number;
		name: string;
	};
	created_at: string;
	updated_at: string;
}

export interface CreateAscParticipationPayload {
	event_id: number;
	participant_name: string;
	participant_role: string;
	participation_date: string;
	remarks?: string;
}

export type UpdateAscParticipationPayload = Partial<CreateAscParticipationPayload>;

// ============================================
// Admin Management Types
// ============================================

export interface CreateAdminPayload {
	name: string;
	email: string;
	password: string;
	password_confirmation: string;
}

export interface UpdateAdminPayload {
	name?: string;
	email?: string;
	password?: string;
	password_confirmation?: string;
}

// ============================================
// Login Types
// ============================================

export interface LoginPayload {
	email: string;
	password: string;
}

// ============================================
// Deployment Type (for polymorphic relationships)
// ============================================

export type DeploymentType = "pol-deployment" | "w-asc-deployment";
