# 🚀 Footprint Frontend - Quick Start

## Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Install icons library:**

   ```bash
   npm install lucide-react
   ```

3. **Setup environment:**

   ```bash
   cp .env.local.example .env.local
   ```

   Then edit `.env.local` and set your API URL:

   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
   ```

4. **Run development server:**

   ```bash
   npm run dev
   ```

5. **Open browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Default Login

Use the credentials from your Laravel backend:

- Email: `admin@example.com` (or your configured admin)
- Password: (as configured in your backend)

## What's Included

✅ **Complete Application Structure**

- Authentication system with login/logout
- Dashboard with overview
- All 7 modules (POL Deployments, W ASC, VIPs, etc.)
- Role-based access control
- Responsive sidebar navigation

✅ **Ready to Connect**

- All API endpoints configured
- Type-safe API client
- Complete TypeScript types
- Error handling

## Next Steps

1. Connect to your backend API
2. Test authentication flow
3. Implement data tables in list pages
4. Complete form fields in create pages
5. Add React Query for efficient data fetching

See `README_SETUP.md` for complete documentation.

---

**Need Help?**

- Check `README_SETUP.md` for detailed documentation
- Review `FRONTEND_API_INTEGRATION.md` for API specs
- Look at existing components for examples
