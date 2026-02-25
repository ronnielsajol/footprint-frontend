# Frontend API Integration Guide

**Version:** 1.0  
**Base URL:** `http://your-api-domain.com/api/v1`  
**Authentication:** Laravel Sanctum (Bearer Token)

This documentation provides complete TypeScript type definitions and API endpoint specifications for integrating with the Footprint Backend API using Next.js and React Query.

---

## Table of Contents

1. [Standard Response Format](#standard-response-format)
2. [Authentication Flow](#authentication-flow)
3. [Error Handling](#error-handling)
4. [Core Type Definitions](#core-type-definitions)
5. [API Endpoints](#api-endpoints)
    - [Authentication](#authentication-endpoints)
    - [POL Deployments](#pol-deployments-endpoints)
    - [W ASC Deployments](#w-asc-deployments-endpoints)
    - [VIPs](#vips-endpoints)
    - [ASC Directives](#asc-directives-endpoints)
    - [ASC Participations](#asc-participations-endpoints)
    - [Admin Management](#admin-management-endpoints)

---

## Standard Response Format

All API responses follow this consistent format:

```typescript
interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data: T | null;
    errors?: Record<string, string[]>; // Only present in validation errors
}
```

### Success Response Example

```json
{
    "success": true,
    "message": "Operation successful",
    "data": {
        // Response data here
    }
}
```

### Error Response Example

```json
{
    "success": false,
    "message": "The provided credentials are incorrect.",
    "errors": {
        "email": ["The provided credentials are incorrect."]
    }
}
```

---

## Authentication Flow

This API uses Laravel Sanctum for token-based authentication.

### Authentication Steps

1. **Login** → Receive token
2. **Include token** in all subsequent requests via `Authorization: Bearer {token}` header
3. **Refresh token** when needed (optional)
4. **Logout** to revoke token

### Token Storage

Store the token securely (httpOnly cookie or secure storage). Include it in all authenticated requests.

---

## Error Handling

### HTTP Status Codes

| Status Code | Meaning               | When Used                          |
| ----------- | --------------------- | ---------------------------------- |
| `200`       | OK                    | Successful GET, PUT, DELETE        |
| `201`       | Created               | Successful POST (resource created) |
| `400`       | Bad Request           | General client error               |
| `401`       | Unauthorized          | Missing or invalid token           |
| `403`       | Forbidden             | User lacks permissions             |
| `404`       | Not Found             | Resource doesn't exist             |
| `422`       | Unprocessable Entity  | Validation errors                  |
| `500`       | Internal Server Error | Server-side error                  |

### Validation Errors (422)

Validation errors return field-specific messages:

```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "email": ["The email field is required."],
        "password": ["The password must be at least 8 characters."]
    }
}
```

### TypeScript Error Type

```typescript
interface ValidationError {
    success: false;
    message: string;
    errors: Record<string, string[]>;
}
```

---

## Core Type Definitions

### User Types

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    role: "superadmin" | "pol_admin";
    created_at: string; // ISO 8601 format
    updated_at: string; // ISO 8601 format
}

interface UserWithAuth extends User {
    email_verified_at: string | null;
}
```

### VIP Types

```typescript
interface Vip {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    contact_number: string;
    email: string | null;
    birth_date: string; // YYYY-MM-DD format
    created_by: {
        id: number;
        name: string;
    };
    events_count?: number;
    pivot?: {
        remarks: string | null;
    };
    created_at: string; // ISO 8601 format
    updated_at: string; // ISO 8601 format
}

interface CreateVipPayload {
    first_name: string;
    last_name: string;
    contact_number: string;
    email?: string;
    birth_date: string; // YYYY-MM-DD, must be before today
}

interface UpdateVipPayload extends Partial<CreateVipPayload> {}
```

### POL Deployment Types

```typescript
interface PolDeployment {
    id: number;
    event_name: string;
    exact_venue: string;
    lgu: string | null;
    barangay: string | null;
    region: string | null;
    district: string | null;
    province: string | null;
    deployment_month: number; // 1-12
    deployment_year: number;
    turnover_date: string | null; // YYYY-MM-DD
    pol_officer: string | null;
    category: string | null;
    asc_type: "virtual" | "actual" | null;
    llc: string | null;
    psc: string | null;
    proponent: string | null;
    sector_recipient: string | null;
    count: number | null;
    unit: string | null;
    donation_summary: string | null;
    amount: number | null;
    source:
        | "TESDA"
        | "DSWD-AICS"
        | "DOLE-DILP"
        | "DOLE-TUPAD"
        | "DOH-MAIFIP"
        | "Private"
        | null;
    remarks: string | null;
    created_by: number;
    created_at: string; // ISO 8601
    updated_at: string; // ISO 8601

    // Relationships (conditionally loaded)
    creator?: User;
    vips?: Vip[];
    asc_directives?: AscDirective[];
    asc_participations?: AscParticipation[];
}

interface CreatePolDeploymentPayload {
    event_name: string;
    exact_venue: string;
    lgu?: string;
    barangay?: string;
    region?: string;
    district?: string;
    province?: string;
    deployment_month: number; // 1-12
    deployment_year: number; // 2020-2100
    turnover_date?: string; // YYYY-MM-DD
    pol_officer?: string;
    category?: string;
    asc_type?: "virtual" | "actual";
    llc?: string;
    psc?: string;
    proponent?: string;
    sector_recipient?: string;
    count?: number; // min: 0
    unit?: string;
    donation_summary?: string;
    amount?: number; // min: 0
    source?:
        | "TESDA"
        | "DSWD-AICS"
        | "DOLE-DILP"
        | "DOLE-TUPAD"
        | "DOH-MAIFIP"
        | "Private";
    remarks?: string;
}

interface UpdatePolDeploymentPayload extends Partial<CreatePolDeploymentPayload> {}

interface PolDeploymentFilters {
    search?: string;
    year?: number;
    month?: number; // 1-12
    source?:
        | "TESDA"
        | "DSWD-AICS"
        | "DOLE-DILP"
        | "DOLE-TUPAD"
        | "DOH-MAIFIP"
        | "Private";
    category?: string;
    asc_type?: "virtual" | "actual";
    sort_by?:
        | "deployment_month"
        | "deployment_year"
        | "event_name"
        | "created_at";
    sort_order?: "asc" | "desc";
    per_page?: number;
}
```

### W ASC Deployment Types

```typescript
interface WAscDeployment {
    id: number;
    exact_venue: string;
    barangay: string | null;
    city_municipality: string | null;
    region: string | null;
    district: string | null;
    province: string | null;
    deployment_month: number; // 1-12
    deployment_year: number;
    exact_date: string; // YYYY-MM-DD
    event_tagging: string | null;
    has_socials: boolean;
    has_sortie: boolean;
    asc_attended: boolean;
    llc_attended: boolean;
    psc_attended: boolean;
    pol_activities: string[] | null;
    sector: "PTK" | "Kababaihan" | "MSMEs" | "Youth" | "BHW" | null;
    remarks: string | null;
    created_by: number;
    created_at: string; // ISO 8601
    updated_at: string; // ISO 8601

    // Relationships (conditionally loaded)
    creator?: User;
    officers?: WAscDeploymentOfficer[];
    vips?: Vip[];
    asc_directives?: AscDirective[];
    asc_participations?: AscParticipation[];
}

interface WAscDeploymentOfficer {
    id: number;
    w_asc_deployment_id: number;
    name: string;
    rank: string | null;
    position: string | null;
    unit: string | null;
    created_at: string; // ISO 8601
    updated_at: string; // ISO 8601
}

interface CreateWAscDeploymentPayload {
    exact_venue: string;
    barangay?: string;
    city_municipality?: string;
    region?: string;
    district?: string;
    province?: string;
    deployment_month: number; // 1-12
    deployment_year: number; // 2020-2100
    exact_date: string; // YYYY-MM-DD
    event_tagging?: string;
    has_socials?: boolean;
    has_sortie?: boolean;
    asc_attended?: boolean;
    llc_attended?: boolean;
    psc_attended?: boolean;
    pol_activities?: string[]; // max 500 chars per item
    sector?: "PTK" | "Kababaihan" | "MSMEs" | "Youth" | "BHW";
    remarks?: string;
}

interface UpdateWAscDeploymentPayload extends Partial<CreateWAscDeploymentPayload> {}

interface AddOfficerPayload {
    name: string;
    rank?: string;
    position?: string;
    unit?: string;
}

interface UpdateOfficerPayload extends Partial<AddOfficerPayload> {}
```

### ASC Directive Types

```typescript
interface AscDirective {
    id: number;
    event_id: number; // Polymorphic - can be POL or W ASC deployment
    directive_text: string;
    issued_by: string;
    issued_date: string; // YYYY-MM-DD
    created_by: {
        id: number;
        name: string;
    };
    created_at: string; // ISO 8601
    updated_at: string; // ISO 8601
}

interface CreateAscDirectivePayload {
    event_id: number;
    directive_text: string;
    issued_by: string;
    issued_date: string; // YYYY-MM-DD
}

interface UpdateAscDirectivePayload extends Partial<CreateAscDirectivePayload> {}
```

### ASC Participation Types

```typescript
interface AscParticipation {
    id: number;
    event_id: number; // Polymorphic - can be POL or W ASC deployment
    participant_name: string;
    participant_role: string;
    participation_date: string; // YYYY-MM-DD
    remarks: string | null;
    created_by: {
        id: number;
        name: string;
    };
    created_at: string; // ISO 8601
    updated_at: string; // ISO 8601
}

interface CreateAscParticipationPayload {
    event_id: number;
    participant_name: string;
    participant_role: string;
    participation_date: string; // YYYY-MM-DD
    remarks?: string;
}

interface UpdateAscParticipationPayload extends Partial<CreateAscParticipationPayload> {}
```

### Pagination Types

```typescript
interface PaginatedResponse<T> {
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
```

---

## API Endpoints

### Authentication Endpoints

#### POST `/auth/login`

Authenticate user and receive access token.

**Authentication:** None (Public)

**Request Payload:**

```typescript
interface LoginPayload {
    email: string;
    password: string;
}
```

**Request Example:**

```json
{
    "email": "admin@example.com",
    "password": "password123"
}
```

**Success Response (200):**

```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "user": {
            "id": 1,
            "name": "Admin User",
            "email": "admin@example.com",
            "role": "superadmin"
        },
        "token": "1|abcdef123456..."
    }
}
```

**Error Response (401):**

```json
{
    "success": false,
    "message": "The provided credentials are incorrect.",
    "errors": {
        "email": ["The provided credentials are incorrect."]
    }
}
```

---

#### POST `/auth/logout`

Logout user and revoke current token.

**Authentication:** Required

**Request Payload:** None

**Success Response (200):**

```json
{
    "success": true,
    "message": "Logged out successfully",
    "data": null
}
```

---

#### GET `/auth/me`

Get authenticated user information.

**Authentication:** Required

**Success Response (200):**

```json
{
    "success": true,
    "message": "User retrieved successfully",
    "data": {
        "id": 1,
        "name": "Admin User",
        "email": "admin@example.com",
        "role": "superadmin",
        "email_verified_at": null,
        "created_at": "2024-01-15T08:30:00.000000Z",
        "updated_at": "2024-01-15T08:30:00.000000Z"
    }
}
```

---

#### POST `/auth/refresh`

Refresh authentication token (revokes old token and creates new one).

**Authentication:** Required

**Request Payload:** None

**Success Response (200):**

```json
{
    "success": true,
    "message": "Token refreshed successfully",
    "data": {
        "user": {
            "id": 1,
            "name": "Admin User",
            "email": "admin@example.com",
            "role": "superadmin"
        },
        "token": "2|xyz789newtoken..."
    }
}
```

---

### POL Deployments Endpoints

#### GET `/pol-deployments`

Get paginated list of POL deployments with optional filtering and sorting.

**Authentication:** Required

**Query Parameters:**

| Parameter    | Type   | Description                              | Example            |
| ------------ | ------ | ---------------------------------------- | ------------------ |
| `search`     | string | Search in event name, venue, LGU, etc.   | `Christmas`        |
| `year`       | number | Filter by deployment year                | `2024`             |
| `month`      | number | Filter by deployment month (1-12)        | `12`               |
| `source`     | string | Filter by source                         | `TESDA`            |
| `category`   | string | Filter by category                       | `Education`        |
| `asc_type`   | string | Filter by ASC type (`virtual`, `actual`) | `actual`           |
| `sort_by`    | string | Sort field                               | `deployment_month` |
| `sort_order` | string | Sort direction (`asc`, `desc`)           | `desc`             |
| `per_page`   | number | Items per page (default: 15)             | `25`               |

**Request Example:**

```
GET /api/v1/pol-deployments?year=2024&month=12&sort_by=deployment_month&sort_order=desc&per_page=20
```

**Success Response (200):**

```json
{
    "success": true,
    "message": "POL deployments retrieved successfully",
    "data": {
        "data": [
            {
                "id": 1,
                "event_name": "Christmas Gift Giving 2024",
                "exact_venue": "Municipal Hall",
                "lgu": "City Government of Manila",
                "barangay": "Barangay 123",
                "region": "NCR",
                "district": "1st District",
                "province": "Metro Manila",
                "deployment_month": 12,
                "deployment_year": 2024,
                "turnover_date": "2024-12-25",
                "pol_officer": "Major Juan Dela Cruz",
                "category": "Social Welfare",
                "asc_type": "actual",
                "llc": "LLC Name",
                "psc": "PSC Name",
                "proponent": "City Mayor",
                "sector_recipient": "Senior Citizens",
                "count": 500,
                "unit": "packs",
                "donation_summary": "500 packs of groceries",
                "amount": 250000.0,
                "source": "DSWD-AICS",
                "remarks": "Successfully distributed all items",
                "created_by": 1,
                "created_at": "2024-11-15T08:30:00.000000Z",
                "updated_at": "2024-11-15T08:30:00.000000Z",
                "creator": {
                    "id": 1,
                    "name": "Admin User",
                    "email": "admin@example.com",
                    "role": "superadmin",
                    "created_at": "2024-01-01T00:00:00.000000Z",
                    "updated_at": "2024-01-01T00:00:00.000000Z"
                }
            }
        ],
        "links": {
            "first": "http://api.com/api/v1/pol-deployments?page=1",
            "last": "http://api.com/api/v1/pol-deployments?page=5",
            "prev": null,
            "next": "http://api.com/api/v1/pol-deployments?page=2"
        },
        "meta": {
            "current_page": 1,
            "from": 1,
            "last_page": 5,
            "links": [
                {
                    "url": null,
                    "label": "&laquo; Previous",
                    "active": false
                },
                {
                    "url": "http://api.com/api/v1/pol-deployments?page=1",
                    "label": "1",
                    "active": true
                },
                {
                    "url": "http://api.com/api/v1/pol-deployments?page=2",
                    "label": "Next &raquo;",
                    "active": false
                }
            ],
            "path": "http://api.com/api/v1/pol-deployments",
            "per_page": 20,
            "to": 20,
            "total": 95
        }
    }
}
```

---

#### POST `/pol-deployments`

Create a new POL deployment.

**Authentication:** Required  
**Authorization:** User must have permission to create POL deployments

**Request Payload:**

```json
{
    "event_name": "New Year Livelihood Training",
    "exact_venue": "Community Center, Barangay San Jose",
    "lgu": "Municipality of San Pedro",
    "barangay": "San Jose",
    "region": "Region IV-A",
    "district": "2nd District",
    "province": "Laguna",
    "deployment_month": 1,
    "deployment_year": 2025,
    "turnover_date": "2025-01-10",
    "pol_officer": "Captain Maria Santos",
    "category": "Livelihood",
    "asc_type": "actual",
    "llc": "Local Livelihood Committee",
    "psc": "Provincial Skills Center",
    "proponent": "Municipal Mayor",
    "sector_recipient": "Out of School Youth",
    "count": 30,
    "unit": "participants",
    "donation_summary": "30 participants trained in baking",
    "amount": 150000.0,
    "source": "TESDA",
    "remarks": "Training scheduled for 5 days"
}
```

**Success Response (201):**

```json
{
    "success": true,
    "message": "POL deployment created successfully",
    "data": {
        "id": 2,
        "event_name": "New Year Livelihood Training",
        "exact_venue": "Community Center, Barangay San Jose",
        "lgu": "Municipality of San Pedro",
        "barangay": "San Jose",
        "region": "Region IV-A",
        "district": "2nd District",
        "province": "Laguna",
        "deployment_month": 1,
        "deployment_year": 2025,
        "turnover_date": "2025-01-10",
        "pol_officer": "Captain Maria Santos",
        "category": "Livelihood",
        "asc_type": "actual",
        "llc": "Local Livelihood Committee",
        "psc": "Provincial Skills Center",
        "proponent": "Municipal Mayor",
        "sector_recipient": "Out of School Youth",
        "count": 30,
        "unit": "participants",
        "donation_summary": "30 participants trained in baking",
        "amount": 150000.0,
        "source": "TESDA",
        "remarks": "Training scheduled for 5 days",
        "created_by": 1,
        "created_at": "2024-12-20T10:15:00.000000Z",
        "updated_at": "2024-12-20T10:15:00.000000Z"
    }
}
```

**Validation Error Response (422):**

```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "event_name": ["The event name field is required."],
        "exact_venue": ["The exact venue field is required."],
        "deployment_month": ["The deployment month must be between 1 and 12."]
    }
}
```

---

#### GET `/pol-deployments/{id}`

Get a specific POL deployment by ID.

**Authentication:** Required  
**Authorization:** User must have permission to view this deployment

**Path Parameters:**

- `id` (number): POL deployment ID

**Request Example:**

```
GET /api/v1/pol-deployments/1
```

**Success Response (200):**

```json
{
    "success": true,
    "message": "POL deployment retrieved successfully",
    "data": {
        "id": 1,
        "event_name": "Christmas Gift Giving 2024",
        "exact_venue": "Municipal Hall",
        "lgu": "City Government of Manila",
        "barangay": "Barangay 123",
        "region": "NCR",
        "district": "1st District",
        "province": "Metro Manila",
        "deployment_month": 12,
        "deployment_year": 2024,
        "turnover_date": "2024-12-25",
        "pol_officer": "Major Juan Dela Cruz",
        "category": "Social Welfare",
        "asc_type": "actual",
        "llc": "LLC Name",
        "psc": "PSC Name",
        "proponent": "City Mayor",
        "sector_recipient": "Senior Citizens",
        "count": 500,
        "unit": "packs",
        "donation_summary": "500 packs of groceries",
        "amount": 250000.0,
        "source": "DSWD-AICS",
        "remarks": "Successfully distributed all items",
        "created_by": 1,
        "created_at": "2024-11-15T08:30:00.000000Z",
        "updated_at": "2024-11-15T08:30:00.000000Z"
    }
}
```

**Error Response (404):**

```json
{
    "success": false,
    "message": "POL deployment not found"
}
```

---

#### PUT `/pol-deployments/{id}`

Update an existing POL deployment.

**Authentication:** Required  
**Authorization:** User must have permission to update this deployment

**Path Parameters:**

- `id` (number): POL deployment ID

**Request Payload:** (All fields optional)

```json
{
    "event_name": "Updated Event Name",
    "remarks": "Updated remarks"
}
```

**Success Response (200):**

```json
{
    "success": true,
    "message": "POL deployment updated successfully",
    "data": {
        "id": 1,
        "event_name": "Updated Event Name",
        "exact_venue": "Municipal Hall",
        "lgu": "City Government of Manila",
        "barangay": "Barangay 123",
        "region": "NCR",
        "district": "1st District",
        "province": "Metro Manila",
        "deployment_month": 12,
        "deployment_year": 2024,
        "turnover_date": "2024-12-25",
        "pol_officer": "Major Juan Dela Cruz",
        "category": "Social Welfare",
        "asc_type": "actual",
        "llc": "LLC Name",
        "psc": "PSC Name",
        "proponent": "City Mayor",
        "sector_recipient": "Senior Citizens",
        "count": 500,
        "unit": "packs",
        "donation_summary": "500 packs of groceries",
        "amount": 250000.0,
        "source": "DSWD-AICS",
        "remarks": "Updated remarks",
        "created_by": 1,
        "created_at": "2024-11-15T08:30:00.000000Z",
        "updated_at": "2024-12-20T11:00:00.000000Z"
    }
}
```

---

#### DELETE `/pol-deployments/{id}`

Delete a POL deployment.

**Authentication:** Required  
**Authorization:** User must have permission to delete this deployment

**Path Parameters:**

- `id` (number): POL deployment ID

**Request Example:**

```
DELETE /api/v1/pol-deployments/1
```

**Success Response (200):**

```json
{
    "success": true,
    "message": "POL deployment deleted successfully",
    "data": null
}
```

**Error Response (404):**

```json
{
    "success": false,
    "message": "POL deployment not found"
}
```

---

#### GET `/pol-deployments/{id}/vips`

Get all VIPs associated with a POL deployment.

**Authentication:** Required  
**Authorization:** User must have permission to view this deployment

**Path Parameters:**

- `id` (number): POL deployment ID

**Success Response (200):**

```json
{
    "success": true,
    "message": "VIPs retrieved successfully",
    "data": [
        {
            "id": 1,
            "first_name": "Juan",
            "last_name": "Dela Cruz",
            "full_name": "Juan Dela Cruz",
            "contact_number": "+639171234567",
            "email": "juan@example.com",
            "birth_date": "1980-05-15",
            "created_by": {
                "id": 1,
                "name": "Admin User"
            },
            "pivot": {
                "remarks": "Guest speaker"
            },
            "created_at": "2024-11-01T10:00:00.000000Z",
            "updated_at": "2024-11-01T10:00:00.000000Z"
        }
    ]
}
```

---

#### POST `/pol-deployments/{id}/vips`

Add a VIP to a POL deployment.

**Authentication:** Required  
**Authorization:** User must have permission to update this deployment

**Path Parameters:**

- `id` (number): POL deployment ID

**Request Payload:**

```typescript
interface AddVipToDeploymentPayload {
    vip_id: number;
    remarks?: string;
}
```

**Request Example:**

```json
{
    "vip_id": 1,
    "remarks": "Guest of honor"
}
```

**Success Response (200):**

```json
{
    "success": true,
    "message": "VIP added to deployment successfully",
    "data": {
        "id": 1,
        "first_name": "Juan",
        "last_name": "Dela Cruz",
        "full_name": "Juan Dela Cruz",
        "contact_number": "+639171234567",
        "email": "juan@example.com",
        "birth_date": "1980-05-15",
        "created_by": {
            "id": 1,
            "name": "Admin User"
        },
        "pivot": {
            "remarks": "Guest of honor"
        },
        "created_at": "2024-11-01T10:00:00.000000Z",
        "updated_at": "2024-11-01T10:00:00.000000Z"
    }
}
```

---

#### DELETE `/pol-deployments/{id}/vips/{vipId}`

Remove a VIP from a POL deployment.

**Authentication:** Required  
**Authorization:** User must have permission to update this deployment

**Path Parameters:**

- `id` (number): POL deployment ID
- `vipId` (number): VIP ID

**Request Example:**

```
DELETE /api/v1/pol-deployments/1/vips/1
```

**Success Response (200):**

```json
{
    "success": true,
    "message": "VIP removed from deployment successfully",
    "data": null
}
```

---

### W ASC Deployments Endpoints

#### GET `/w-asc-deployments`

Get paginated list of W ASC deployments with optional filtering.

**Authentication:** Required

**Query Parameters:** Similar to POL deployments (search, year, month, sort_by, sort_order, per_page)

**Success Response (200):**

```json
{
    "success": true,
    "message": "W ASC deployments retrieved successfully",
    "data": {
        "data": [
            {
                "id": 1,
                "exact_venue": "Barangay Hall San Roque",
                "barangay": "San Roque",
                "city_municipality": "Quezon City",
                "region": "NCR",
                "district": "2nd District",
                "province": "Metro Manila",
                "deployment_month": 11,
                "deployment_year": 2024,
                "exact_date": "2024-11-15",
                "event_tagging": "Community Development",
                "has_socials": true,
                "has_sortie": false,
                "asc_attended": true,
                "llc_attended": true,
                "psc_attended": false,
                "pol_activities": [
                    "Medical mission",
                    "Legal consultation",
                    "Information dissemination"
                ],
                "sector": "Kababaihan",
                "remarks": "Well attended event",
                "created_by": 1,
                "created_at": "2024-11-10T08:00:00.000000Z",
                "updated_at": "2024-11-10T08:00:00.000000Z",
                "creator": {
                    "id": 1,
                    "name": "Admin User",
                    "email": "admin@example.com",
                    "role": "superadmin",
                    "created_at": "2024-01-01T00:00:00.000000Z",
                    "updated_at": "2024-01-01T00:00:00.000000Z"
                }
            }
        ],
        "links": {
            "first": "http://api.com/api/v1/w-asc-deployments?page=1",
            "last": "http://api.com/api/v1/w-asc-deployments?page=3",
            "prev": null,
            "next": "http://api.com/api/v1/w-asc-deployments?page=2"
        },
        "meta": {
            "current_page": 1,
            "from": 1,
            "last_page": 3,
            "path": "http://api.com/api/v1/w-asc-deployments",
            "per_page": 15,
            "to": 15,
            "total": 45
        }
    }
}
```

---

#### POST `/w-asc-deployments`

Create a new W ASC deployment.

**Authentication:** Required  
**Authorization:** User must have permission to create W ASC deployments

**Request Payload:**

```json
{
    "exact_venue": "Barangay Plaza",
    "barangay": "Santa Mesa",
    "city_municipality": "Manila",
    "region": "NCR",
    "district": "3rd District",
    "province": "Metro Manila",
    "deployment_month": 12,
    "deployment_year": 2024,
    "exact_date": "2024-12-15",
    "event_tagging": "Health and Wellness",
    "has_socials": true,
    "has_sortie": true,
    "asc_attended": true,
    "llc_attended": false,
    "psc_attended": true,
    "pol_activities": [
        "Blood pressure monitoring",
        "Dental checkup",
        "Vaccine administration"
    ],
    "sector": "Youth",
    "remarks": "First deployment in this area"
}
```

**Success Response (201):**

```json
{
    "success": true,
    "message": "W ASC deployment created successfully",
    "data": {
        "id": 2,
        "exact_venue": "Barangay Plaza",
        "barangay": "Santa Mesa",
        "city_municipality": "Manila",
        "region": "NCR",
        "district": "3rd District",
        "province": "Metro Manila",
        "deployment_month": 12,
        "deployment_year": 2024,
        "exact_date": "2024-12-15",
        "event_tagging": "Health and Wellness",
        "has_socials": true,
        "has_sortie": true,
        "asc_attended": true,
        "llc_attended": false,
        "psc_attended": true,
        "pol_activities": [
            "Blood pressure monitoring",
            "Dental checkup",
            "Vaccine administration"
        ],
        "sector": "Youth",
        "remarks": "First deployment in this area",
        "created_by": 1,
        "created_at": "2024-12-20T14:30:00.000000Z",
        "updated_at": "2024-12-20T14:30:00.000000Z"
    }
}
```

---

#### GET `/w-asc-deployments/{id}`

Get a specific W ASC deployment by ID.

**Authentication:** Required  
**Authorization:** User must have permission to view this deployment

**Path Parameters:**

- `id` (number): W ASC deployment ID

**Success Response (200):** Similar structure to POST response

---

#### PUT `/w-asc-deployments/{id}`

Update an existing W ASC deployment.

**Authentication:** Required  
**Authorization:** User must have permission to update this deployment

**Path Parameters:**

- `id` (number): W ASC deployment ID

**Request Payload:** (All fields optional - same as POST)

**Success Response (200):** Similar structure to POST response

---

#### DELETE `/w-asc-deployments/{id}`

Delete a W ASC deployment.

**Authentication:** Required  
**Authorization:** User must have permission to delete this deployment

**Path Parameters:**

- `id` (number): W ASC deployment ID

**Success Response (200):**

```json
{
    "success": true,
    "message": "W ASC deployment deleted successfully",
    "data": null
}
```

---

#### GET `/w-asc-deployments/{id}/officers`

Get all officers assigned to a W ASC deployment.

**Authentication:** Required

**Path Parameters:**

- `id` (number): W ASC deployment ID

**Success Response (200):**

```json
{
    "success": true,
    "message": "Officers retrieved successfully",
    "data": [
        {
            "id": 1,
            "w_asc_deployment_id": 1,
            "name": "Captain Pedro Garcia",
            "rank": "Captain",
            "position": "Team Leader",
            "unit": "Alpha Company",
            "created_at": "2024-11-10T09:00:00.000000Z",
            "updated_at": "2024-11-10T09:00:00.000000Z"
        }
    ]
}
```

---

#### POST `/w-asc-deployments/{id}/officers`

Add an officer to a W ASC deployment.

**Authentication:** Required

**Path Parameters:**

- `id` (number): W ASC deployment ID

**Request Payload:**

```json
{
    "name": "Lieutenant Maria Santos",
    "rank": "Lieutenant",
    "position": "Medical Officer",
    "unit": "Medical Detachment"
}
```

**Success Response (200):**

```json
{
    "success": true,
    "message": "Officer added to deployment successfully",
    "data": {
        "id": 2,
        "w_asc_deployment_id": 1,
        "name": "Lieutenant Maria Santos",
        "rank": "Lieutenant",
        "position": "Medical Officer",
        "unit": "Medical Detachment",
        "created_at": "2024-12-20T15:00:00.000000Z",
        "updated_at": "2024-12-20T15:00:00.000000Z"
    }
}
```

---

#### PUT `/w-asc-deployments/{id}/officers/{officerId}`

Update an officer's information.

**Authentication:** Required

**Path Parameters:**

- `id` (number): W ASC deployment ID
- `officerId` (number): Officer ID

**Request Payload:** (All fields optional)

```json
{
    "rank": "Captain",
    "position": "Senior Medical Officer"
}
```

**Success Response (200):**

```json
{
    "success": true,
    "message": "Officer updated successfully",
    "data": {
        "id": 2,
        "w_asc_deployment_id": 1,
        "name": "Lieutenant Maria Santos",
        "rank": "Captain",
        "position": "Senior Medical Officer",
        "unit": "Medical Detachment",
        "created_at": "2024-12-20T15:00:00.000000Z",
        "updated_at": "2024-12-20T16:00:00.000000Z"
    }
}
```

---

#### DELETE `/w-asc-deployments/{id}/officers/{officerId}`

Remove an officer from a W ASC deployment.

**Authentication:** Required

**Path Parameters:**

- `id` (number): W ASC deployment ID
- `officerId` (number): Officer ID

**Success Response (200):**

```json
{
    "success": true,
    "message": "Officer removed from deployment successfully",
    "data": null
}
```

---

#### GET `/w-asc-deployments/{id}/vips`

Get all VIPs associated with a W ASC deployment.

**Authentication:** Required

(Similar to POL deployment VIPs endpoint)

---

#### POST `/w-asc-deployments/{id}/vips`

Add a VIP to a W ASC deployment.

**Authentication:** Required

**Path Parameters:**

- `id` (number): W ASC deployment ID

**Request Payload:**

```json
{
    "vip_id": 1,
    "remarks": "Guest of honor"
}
```

(Response similar to POL deployment VIP addition)

---

#### DELETE `/w-asc-deployments/{id}/vips/{vipId}`

Remove a VIP from a W ASC deployment.

**Authentication:** Required

(Similar to POL deployment VIP removal)

---

### VIPs Endpoints

#### GET `/vips`

Get paginated list of all VIPs.

**Authentication:** Required

**Query Parameters:**

- `search` (string): Search by name, email, or contact number
- `per_page` (number): Items per page

**Success Response (200):**

```json
{
    "success": true,
    "message": "VIPs retrieved successfully",
    "data": {
        "data": [
            {
                "id": 1,
                "first_name": "Juan",
                "last_name": "Dela Cruz",
                "full_name": "Juan Dela Cruz",
                "contact_number": "+639171234567",
                "email": "juan@example.com",
                "birth_date": "1980-05-15",
                "created_by": {
                    "id": 1,
                    "name": "Admin User"
                },
                "events_count": 3,
                "created_at": "2024-11-01T10:00:00.000000Z",
                "updated_at": "2024-11-01T10:00:00.000000Z"
            }
        ],
        "links": {
            "first": "http://api.com/api/v1/vips?page=1",
            "last": "http://api.com/api/v1/vips?page=5",
            "prev": null,
            "next": "http://api.com/api/v1/vips?page=2"
        },
        "meta": {
            "current_page": 1,
            "from": 1,
            "last_page": 5,
            "path": "http://api.com/api/v1/vips",
            "per_page": 15,
            "to": 15,
            "total": 72
        }
    }
}
```

---

#### GET `/vips/check-exists`

Check if a VIP already exists in the database.

**Authentication:** Required

**Query Parameters:**

```typescript
interface CheckVipExistsParams {
    first_name: string;
    last_name: string;
    birth_date: string; // YYYY-MM-DD
}
```

**Request Example:**

```
GET /api/v1/vips/check-exists?first_name=Juan&last_name=Dela Cruz&birth_date=1980-05-15
```

**Success Response (200) - VIP Exists:**

```json
{
    "success": true,
    "message": "VIP exists",
    "data": {
        "exists": true,
        "vip": {
            "id": 1,
            "first_name": "Juan",
            "last_name": "Dela Cruz",
            "full_name": "Juan Dela Cruz",
            "contact_number": "+639171234567",
            "email": "juan@example.com",
            "birth_date": "1980-05-15",
            "created_by": {
                "id": 1,
                "name": "Admin User"
            },
            "created_at": "2024-11-01T10:00:00.000000Z",
            "updated_at": "2024-11-01T10:00:00.000000Z"
        }
    }
}
```

**Success Response (200) - VIP Does Not Exist:**

```json
{
    "success": true,
    "message": "VIP does not exist",
    "data": {
        "exists": false,
        "vip": null
    }
}
```

---

#### POST `/vips`

Create a new VIP.

**Authentication:** Required

**Request Payload:**

```json
{
    "first_name": "Maria",
    "last_name": "Santos",
    "contact_number": "+639181234567",
    "email": "maria@example.com",
    "birth_date": "1990-08-20"
}
```

**Success Response (201):**

```json
{
    "success": true,
    "message": "VIP created successfully",
    "data": {
        "id": 2,
        "first_name": "Maria",
        "last_name": "Santos",
        "full_name": "Maria Santos",
        "contact_number": "+639181234567",
        "email": "maria@example.com",
        "birth_date": "1990-08-20",
        "created_by": {
            "id": 1,
            "name": "Admin User"
        },
        "created_at": "2024-12-20T16:30:00.000000Z",
        "updated_at": "2024-12-20T16:30:00.000000Z"
    }
}
```

**Validation Error (422):**

```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "first_name": ["The first name field is required."],
        "birth_date": ["The birth date must be a date before today."]
    }
}
```

---

#### GET `/vips/{id}`

Get a specific VIP by ID.

**Authentication:** Required

**Path Parameters:**

- `id` (number): VIP ID

**Success Response (200):** Similar structure to POST response

---

#### PUT `/vips/{id}`

Update an existing VIP.

**Authentication:** Required

**Path Parameters:**

- `id` (number): VIP ID

**Request Payload:** (All fields optional)

```json
{
    "email": "newemail@example.com",
    "contact_number": "+639991234567"
}
```

**Success Response (200):** Similar structure to POST response

---

#### DELETE `/vips/{id}`

Delete a VIP.

**Authentication:** Required

**Path Parameters:**

- `id` (number): VIP ID

**Success Response (200):**

```json
{
    "success": true,
    "message": "VIP deleted successfully",
    "data": null
}
```

---

### ASC Directives Endpoints

ASC Directives are polymorphic - they can be associated with either POL Deployments or W ASC Deployments.

#### GET `/{deploymentType}/{deploymentId}/asc-directives`

Get all ASC directives for a specific deployment.

**Authentication:** Required

**Path Parameters:**

- `deploymentType` (string): Either `pol-deployment` or `w-asc-deployment`
- `deploymentId` (number): Deployment ID

**Request Example:**

```
GET /api/v1/pol-deployment/1/asc-directives
GET /api/v1/w-asc-deployment/2/asc-directives
```

**Success Response (200):**

```json
{
    "success": true,
    "message": "ASC directives retrieved successfully",
    "data": [
        {
            "id": 1,
            "event_id": 1,
            "directive_text": "All personnel must wear proper uniform during the event",
            "issued_by": "Colonel Juan Reyes",
            "issued_date": "2024-11-01",
            "created_by": {
                "id": 1,
                "name": "Admin User"
            },
            "created_at": "2024-11-01T08:00:00.000000Z",
            "updated_at": "2024-11-01T08:00:00.000000Z"
        }
    ]
}
```

---

#### POST `/{deploymentType}/{deploymentId}/asc-directives`

Create a new ASC directive for a deployment.

**Authentication:** Required

**Path Parameters:**

- `deploymentType` (string): Either `pol-deployment` or `w-asc-deployment`
- `deploymentId` (number): Deployment ID

**Request Payload:**

```json
{
    "event_id": 1,
    "directive_text": "Security protocols must be strictly followed",
    "issued_by": "Major Pedro Garcia",
    "issued_date": "2024-12-15"
}
```

**Success Response (201):**

```json
{
    "success": true,
    "message": "ASC directive created successfully",
    "data": {
        "id": 2,
        "event_id": 1,
        "directive_text": "Security protocols must be strictly followed",
        "issued_by": "Major Pedro Garcia",
        "issued_date": "2024-12-15",
        "created_by": {
            "id": 1,
            "name": "Admin User"
        },
        "created_at": "2024-12-20T17:00:00.000000Z",
        "updated_at": "2024-12-20T17:00:00.000000Z"
    }
}
```

---

#### GET `/asc-directives/{ascDirective}`

Get a specific ASC directive by ID.

**Authentication:** Required

**Path Parameters:**

- `ascDirective` (number): ASC Directive ID

**Success Response (200):** Similar structure to POST response

---

#### PUT `/asc-directives/{ascDirective}`

Update an existing ASC directive.

**Authentication:** Required

**Path Parameters:**

- `ascDirective` (number): ASC Directive ID

**Request Payload:** (All fields optional)

```json
{
    "directive_text": "Updated directive text",
    "issued_by": "Updated officer name"
}
```

**Success Response (200):** Similar structure to POST response

---

#### DELETE `/asc-directives/{ascDirective}`

Delete an ASC directive.

**Authentication:** Required

**Path Parameters:**

- `ascDirective` (number): ASC Directive ID

**Success Response (200):**

```json
{
    "success": true,
    "message": "ASC directive deleted successfully",
    "data": null
}
```

---

### ASC Participations Endpoints

ASC Participations are also polymorphic - they can be associated with either POL Deployments or W ASC Deployments.

#### GET `/{deploymentType}/{deploymentId}/asc-participation`

Get all ASC participations for a specific deployment.

**Authentication:** Required

**Path Parameters:**

- `deploymentType` (string): Either `pol-deployment` or `w-asc-deployment`
- `deploymentId` (number): Deployment ID

**Request Example:**

```
GET /api/v1/pol-deployment/1/asc-participation
GET /api/v1/w-asc-deployment/2/asc-participation
```

**Success Response (200):**

```json
{
    "success": true,
    "message": "ASC participations retrieved successfully",
    "data": [
        {
            "id": 1,
            "event_id": 1,
            "participant_name": "Captain Maria Santos",
            "participant_role": "Medical Officer",
            "participation_date": "2024-11-15",
            "remarks": "Led the medical team",
            "created_by": {
                "id": 1,
                "name": "Admin User"
            },
            "created_at": "2024-11-15T10:00:00.000000Z",
            "updated_at": "2024-11-15T10:00:00.000000Z"
        }
    ]
}
```

---

#### POST `/{deploymentType}/{deploymentId}/asc-participation`

Create a new ASC participation record for a deployment.

**Authentication:** Required

**Path Parameters:**

- `deploymentType` (string): Either `pol-deployment` or `w-asc-deployment`
- `deploymentId` (number): Deployment ID

**Request Payload:**

```json
{
    "event_id": 1,
    "participant_name": "Lieutenant Juan Reyes",
    "participant_role": "Security Officer",
    "participation_date": "2024-12-15",
    "remarks": "Handled perimeter security"
}
```

**Success Response (201):**

```json
{
    "success": true,
    "message": "ASC participation created successfully",
    "data": {
        "id": 2,
        "event_id": 1,
        "participant_name": "Lieutenant Juan Reyes",
        "participant_role": "Security Officer",
        "participation_date": "2024-12-15",
        "remarks": "Handled perimeter security",
        "created_by": {
            "id": 1,
            "name": "Admin User"
        },
        "created_at": "2024-12-20T17:30:00.000000Z",
        "updated_at": "2024-12-20T17:30:00.000000Z"
    }
}
```

---

#### GET `/asc-participation/{ascParticipation}`

Get a specific ASC participation by ID.

**Authentication:** Required

**Path Parameters:**

- `ascParticipation` (number): ASC Participation ID

**Success Response (200):** Similar structure to POST response

---

#### PUT `/asc-participation/{ascParticipation}`

Update an existing ASC participation.

**Authentication:** Required

**Path Parameters:**

- `ascParticipation` (number): ASC Participation ID

**Request Payload:** (All fields optional)

```json
{
    "participant_role": "Senior Security Officer",
    "remarks": "Updated remarks"
}
```

**Success Response (200):** Similar structure to POST response

---

#### DELETE `/asc-participation/{ascParticipation}`

Delete an ASC participation.

**Authentication:** Required

**Path Parameters:**

- `ascParticipation` (number): ASC Participation ID

**Success Response (200):**

```json
{
    "success": true,
    "message": "ASC participation deleted successfully",
    "data": null
}
```

---

### Admin Management Endpoints

**Note:** All admin endpoints require superadmin role.

#### GET `/admins`

Get paginated list of all admin users.

**Authentication:** Required  
**Authorization:** Superadmin only

**Query Parameters:**

- `per_page` (number): Items per page

**Success Response (200):**

```json
{
    "success": true,
    "message": "Admins retrieved successfully",
    "data": {
        "data": [
            {
                "id": 1,
                "name": "Super Admin",
                "email": "superadmin@example.com",
                "role": "superadmin",
                "created_at": "2024-01-01T00:00:00.000000Z",
                "updated_at": "2024-01-01T00:00:00.000000Z"
            },
            {
                "id": 2,
                "name": "POL Admin",
                "email": "poladmin@example.com",
                "role": "pol_admin",
                "created_at": "2024-06-15T10:00:00.000000Z",
                "updated_at": "2024-06-15T10:00:00.000000Z"
            }
        ],
        "links": {
            "first": "http://api.com/api/v1/admins?page=1",
            "last": "http://api.com/api/v1/admins?page=1",
            "prev": null,
            "next": null
        },
        "meta": {
            "current_page": 1,
            "from": 1,
            "last_page": 1,
            "path": "http://api.com/api/v1/admins",
            "per_page": 15,
            "to": 2,
            "total": 2
        }
    }
}
```

---

#### POST `/admins`

Create a new admin user.

**Authentication:** Required  
**Authorization:** Superadmin only

**Request Payload:**

```json
{
    "name": "New Admin",
    "email": "newadmin@example.com",
    "password": "securepassword123",
    "password_confirmation": "securepassword123"
}
```

**Success Response (201):**

```json
{
    "success": true,
    "message": "Admin created successfully",
    "data": {
        "id": 3,
        "name": "New Admin",
        "email": "newadmin@example.com",
        "role": "pol_admin",
        "created_at": "2024-12-20T18:00:00.000000Z",
        "updated_at": "2024-12-20T18:00:00.000000Z"
    }
}
```

**Validation Error (422):**

```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "email": ["The email has already been taken."],
        "password": ["The password confirmation does not match."]
    }
}
```

---

#### GET `/admins/{id}`

Get a specific admin user by ID.

**Authentication:** Required  
**Authorization:** Superadmin only

**Path Parameters:**

- `id` (number): Admin user ID

**Success Response (200):** Similar structure to POST response

---

#### PUT `/admins/{id}`

Update an existing admin user.

**Authentication:** Required  
**Authorization:** Superadmin only

**Path Parameters:**

- `id` (number): Admin user ID

**Request Payload:** (All fields optional)

```json
{
    "name": "Updated Admin Name",
    "email": "updatedemail@example.com",
    "password": "newpassword123",
    "password_confirmation": "newpassword123"
}
```

**Success Response (200):** Similar structure to POST response

---

#### DELETE `/admins/{id}`

Delete an admin user.

**Authentication:** Required  
**Authorization:** Superadmin only

**Path Parameters:**

- `id` (number): Admin user ID

**Success Response (200):**

```json
{
    "success": true,
    "message": "Admin deleted successfully",
    "data": null
}
```

---

## Query Parameters for Filtering

### POL Deployments Filters

```typescript
interface PolDeploymentFilters {
    // Text search (searches across multiple fields)
    search?: string;

    // Date filters
    year?: number;
    month?: number; // 1-12

    // Category filters
    source?:
        | "TESDA"
        | "DSWD-AICS"
        | "DOLE-DILP"
        | "DOLE-TUPAD"
        | "DOH-MAIFIP"
        | "Private";
    category?: string;
    asc_type?: "virtual" | "actual";

    // Sorting
    sort_by?:
        | "deployment_month"
        | "deployment_year"
        | "event_name"
        | "created_at";
    sort_order?: "asc" | "desc";

    // Pagination
    per_page?: number; // Default: 15
}
```

**Example Usage:**

```
GET /api/v1/pol-deployments?search=Christmas&year=2024&source=TESDA&sort_by=deployment_month&sort_order=desc&per_page=25
```

### W ASC Deployments Filters

Similar filter structure to POL Deployments:

```typescript
interface WAscDeploymentFilters {
    search?: string;
    year?: number;
    month?: number;
    sector?: "PTK" | "Kababaihan" | "MSMEs" | "Youth" | "BHW";
    sort_by?:
        | "deployment_month"
        | "deployment_year"
        | "exact_date"
        | "created_at";
    sort_order?: "asc" | "desc";
    per_page?: number;
}
```

### VIPs Filters

```typescript
interface VipFilters {
    search?: string; // Searches in name, email, contact_number
    per_page?: number;
}
```

**Example Usage:**

```
GET /api/v1/vips?search=Juan&per_page=20
```

---

## React Query Integration Examples

### Setting Up API Client

```typescript
// lib/api-client.ts
import axios from "axios";

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth_token"); // Or your preferred token storage
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle responses
apiClient.interceptors.response.use(
    (response) => response.data, // Return just the data
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized (redirect to login, etc.)
            localStorage.removeItem("auth_token");
            window.location.href = "/login";
        }
        return Promise.reject(error.response?.data || error);
    },
);

export default apiClient;
```

### Type-Safe Query Hooks

```typescript
// hooks/use-pol-deployments.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export function usePolDeployments(filters?: PolDeploymentFilters) {
    return useQuery({
        queryKey: ["pol-deployments", filters],
        queryFn: async () => {
            const response = await apiClient.get<
                ApiResponse<PaginatedResponse<PolDeployment>>
            >("/pol-deployments", { params: filters });
            return response;
        },
    });
}

export function useCreatePolDeployment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreatePolDeploymentPayload) => {
            const response = await apiClient.post<ApiResponse<PolDeployment>>(
                "/pol-deployments",
                payload,
            );
            return response;
        },
        onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ["pol-deployments"] });
        },
    });
}
```

### Usage in Components

```typescript
// components/pol-deployments-list.tsx
'use client';

import { usePolDeployments } from '@/hooks/use-pol-deployments';

export function PolDeploymentsList() {
  const { data, isLoading, error } = usePolDeployments({
    year: 2024,
    per_page: 20
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  if (!data?.success) return <div>Failed to load data</div>;

  return (
    <div>
      <h2>{data.message}</h2>
      {data.data.data.map((deployment) => (
        <div key={deployment.id}>
          <h3>{deployment.event_name}</h3>
          <p>{deployment.exact_venue}</p>
        </div>
      ))}
      {/* Pagination component */}
    </div>
  );
}
```

---

## Notes and Best Practices

### Date Formats

- **Request Payloads:** Use `YYYY-MM-DD` format (e.g., `2024-12-25`)
- **Response Data:**
    - Simple dates: `YYYY-MM-DD`
    - Timestamps: ISO 8601 format (e.g., `2024-12-20T10:15:00.000000Z`)

### Token Management

- Store tokens securely (consider httpOnly cookies for production)
- Include token in all authenticated requests via `Authorization: Bearer {token}` header
- Handle 401 responses by redirecting to login
- Refresh tokens periodically if needed

### Error Handling

Always check the `success` field in responses:

```typescript
if (!response.success) {
    // Handle error
    console.error(response.message);
    if (response.errors) {
        // Display validation errors
        Object.entries(response.errors).forEach(([field, messages]) => {
            console.error(`${field}: ${messages.join(", ")}`);
        });
    }
}
```

### Pagination

- Default page size is 15 items
- Use `per_page` query parameter to adjust (reasonable limits apply)
- Navigate using `meta.current_page`, `meta.last_page`, or `links.next`/`links.prev`

### Polymorphic Relationships

ASC Directives and ASC Participations can belong to either:

- POL Deployments (`pol-deployment`)
- W ASC Deployments (`w-asc-deployment`)

Use the appropriate `deploymentType` path parameter when accessing these endpoints.

---

## Changelog

**Version 1.0 (2024-12-20)**

- Initial documentation
- All endpoints documented
- TypeScript types provided
- Error handling guide included

---

For questions or issues, contact the backend development team.
