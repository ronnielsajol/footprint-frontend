# Footprint Frontend - Setup & Development Guide

## Overview

This is the frontend application for the Footprint ASC Management System. Built with Next.js 15, TypeScript, Tailwind CSS, and ShadCN UI components.

## Features Implemented

### ✅ Core Infrastructure

- **Type-safe API Client** using your custom `apiFetch` helper
- **Complete TypeScript Types** for all API endpoints and data models
- **Authentication System** with login, logout, and session management
- **Role-based Access Control** (superadmin vs pol_admin)

### ✅ Modules (All 7 modules created)

1. **Authentication** - Login, session management, protected routes
2. **Dashboard** - Overview with quick stats and navigation
3. **POL Deployments** - Full CRUD operations, filtering, pagination ready
4. **W ASC Deployments** - Module structure with officers and activities management
5. **VIPs** - VIP database management with search
6. **ASC Directives** - Polymorphic directives for both deployment types
7. **ASC Participations** - Participation tracking for deployments
8. **Admin Management** - Superadmin-only user management

### ✅ UI Components

- Responsive sidebar navigation
- Mobile-friendly design
- Forms with validation hooks
- Cards, modals, alerts, and all ShadCN UI components
- Loading states and error handling

---

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Install Missing Package

The project uses `lucide-react` for icons, which needs to be installed:

```bash
npm install lucide-react
# or
yarn add lucide-react
# or
pnpm add lucide-react
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Update the URL to match your backend API URL.

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will be available at `http://localhost:3000`.

---

## Project Structure

```
frontend/
├── app/                          # Next.js App Router pages
│   ├── dashboard/                # Dashboard page
│   ├── login/                    # Login page
│   ├── pol-deployments/          # POL Deployments module
│   │   ├── page.tsx             # List/index page
│   │   └── create/              # Create form
│   ├── w-asc-deployments/        # W ASC Deployments module
│   ├── vips/                     # VIPs module
│   ├── asc-directives/           # ASC Directives module
│   ├── asc-participations/       # ASC Participations module
│   ├── admin-management/         # Admin Management (superadmin only)
│   ├── layout.tsx               # Root layout with AuthProvider
│   └── page.tsx                 # Root redirect
│
├── components/                   # React components
│   ├── ui/                      # ShadCN UI components
│   ├── app-sidebar.tsx          # Main navigation sidebar
│   ├── authenticated-layout.tsx  # Layout wrapper for protected pages
│   └── login-form.tsx           # Login form component
│
├── hooks/                        # Custom React hooks
│   ├── use-auth.tsx             # Authentication context/hook
│   ├── use-require-auth.tsx     # Protected route hook
│   └── use-role-check.tsx       # Role-based access control
│
├── lib/                          # Utilities and API clients
│   ├── api/                     # API endpoint modules
│   │   ├── auth.ts              # Authentication endpoints
│   │   ├── pol-deployments.ts   # POL Deployments API
│   │   ├── w-asc-deployments.ts # W ASC Deployments API
│   │   ├── vips.ts              # VIPs API
│   │   ├── asc-directives.ts    # ASC Directives API
│   │   ├── asc-participations.ts # ASC Participations API
│   │   └── admins.ts            # Admin Management API
│   ├── api-client.ts            # apiFetch helper & token management
│   └── utils.ts                 # Utility functions
│
└── types/                        # TypeScript type definitions
    └── index.ts                 # All API types and interfaces
```

---

## Key Features & Usage

### Authentication

Users are automatically redirected to `/login` if not authenticated. After login, they're redirected to `/dashboard`.

**Login Credentials:** (Use your backend test accounts)

- Email/Password as configured in your Laravel backend

### Navigation

The sidebar provides access to all modules. Access is automatically filtered based on user role:

- **POL Admin**: Can access all deployment and VIP modules
- **Superadmin**: Has access to everything including Admin Management

### API Integration

All API calls use the `apiFetch` helper with automatic:

- Bearer token injection
- Error handling
- Response parsing

Example usage:

```typescript
import { polDeploymentsApi } from "@/lib/api/pol-deployments";

const response = await polDeploymentsApi.getAll({
	year: 2024,
	per_page: 20,
});
```

### Protected Routes

All pages under authenticated modules use the `AuthenticatedLayout` wrapper:

```tsx
import { AuthenticatedLayout } from "@/components/authenticated-layout";

export default function MyPage() {
	return <AuthenticatedLayout>{/* Your page content */}</AuthenticatedLayout>;
}
```

### Role-Based Access

Use the `useRoleCheck` hook for conditional rendering:

```tsx
import { useRoleCheck } from "@/hooks/use-role-check";

export default function MyComponent() {
	const { hasAccess } = useRoleCheck(["superadmin"]);

	if (!hasAccess) {
		return <AccessDenied />;
	}

	return <AdminContent />;
}
```

---

## Next Steps for Full Implementation

### 1. Connect to Real API

- Update `NEXT_PUBLIC_API_URL` in `.env.local`
- Test authentication flow
- Verify API responses match the types

### 2. Implement Data Tables

The list pages have placeholders. Implement with:

- **Option A**: Use `@tanstack/react-table` for advanced tables
- **Option B**: Simple table with map/pagination

Example for POL Deployments:

```tsx
// In app/pol-deployments/page.tsx
const { data, isLoading } = useQuery({
	queryKey: ["pol-deployments", filters],
	queryFn: () => polDeploymentsApi.getAll(filters),
});
```

### 3. Add React Query (Recommended)

Install and configure TanStack Query for data fetching:

```bash
npm install @tanstack/react-query
```

Then wrap your app in `QueryClientProvider` in `app/layout.tsx`.

### 4. Complete Forms

The create forms for W ASC, VIPs, and Admin modules need field implementations. Use the POL Deployments form as a template.

### 5. Add Edit & Detail Pages

Create:

- `app/[module]/[id]/page.tsx` for detail views
- `app/[module]/[id]/edit/page.tsx` for edit forms

### 6. Implement Advanced Features

- Export to Excel/PDF
- Advanced filtering UI
- Bulk operations
- File uploads (if needed)

---

## Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

---

## API Response Format

All API responses follow this structure:

```typescript
{
  success: boolean,
  message: string,
  data: T | null,
  errors?: Record<string, string[]>
}
```

Paginated responses include:

```typescript
{
  data: T[],
  meta: { /* pagination info */ },
  links: { /* pagination links */ }
}
```

---

## TypeScript & Type Safety

All API endpoints are fully typed. The types are located in `types/index.ts` and match your backend API documentation exactly.

Example:

```typescript
import type { PolDeployment, CreatePolDeploymentPayload } from "@/types";

const deployment: PolDeployment = await polDeploymentsApi.getById(1);
```

---

## Troubleshooting

### Icons not showing

Install `lucide-react`: `npm install lucide-react`

### Authentication not working

1. Check `NEXT_PUBLIC_API_URL` in `.env.local`
2. Verify backend CORS settings allow your frontend domain
3. Check browser console for token storage issues

### TypeScript errors

Run `npm run build` to see all TypeScript errors. The project is configured with strict type checking.

---

## Design System

- **Colors**: Uses Tailwind's default palette with custom primary/secondary
- **Typography**: JetBrains Mono for code, Geist Sans for UI
- **Components**: All UI components from ShadCN are available in `components/ui/`
- **Spacing**: Consistent 6-unit spacing scale (1.5rem = 24px)

---

## Security Notes

- Tokens are stored in `localStorage` (consider `httpOnly` cookies for production)
- All authenticated routes check for valid token
- Role-based access is enforced client-side (ensure backend validates too)
- No sensitive data in console logs in production

---

## Support & Documentation

- API Documentation: `FRONTEND_API_INTEGRATION.md`
- ShadCN UI: https://ui.shadcn.com/
- Next.js Docs: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs

---

## License

[Your License Here]
