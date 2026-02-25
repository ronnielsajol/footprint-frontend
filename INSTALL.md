# 📦 Required Installation Commands

## 1. Install Missing Icon Library

The application uses `lucide-react` for icons, which needs to be installed:

```bash
npm install lucide-react
```

## 2. Optional: Install React Query (Recommended for Data Fetching)

For efficient data fetching and caching:

```bash
npm install @tanstack/react-query
```

Then add to your `app/layout.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

// Wrap your app with QueryClientProvider
<QueryClientProvider client={queryClient}>
	<AuthProvider>{children}</AuthProvider>
</QueryClientProvider>;
```

## 3. Setup Environment Variables

```bash
cp .env.local.example .env.local
```

Then edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

## 4. Run the Application

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

---

## That's It!

Your frontend is ready to use. All dependencies are already installed except for `lucide-react`.

If you encounter any TypeScript errors, run:

```bash
npm run build
```

This will show any type errors that need to be fixed.
