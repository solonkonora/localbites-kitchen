# LocalBite - Next.js Migration

This is the modernized version of LocalBite, migrated from React (Vite) to **Next.js 15** with **TypeScript** and **Tailwind CSS**.

## What's New

- **Next.js App Router** - Modern file-based routing
- **TypeScript** - Full type safety across the application
- **Tailwind CSS** - Utility-first styling (replacing CSS files)
- **Server Components** - Improved performance with React Server Components
- **Type-safe API Client** - Fully typed API interactions

## Project Structure

```
localbite-nextjs/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home/Welcome page
│   ├── login/page.tsx     # Authentication page
│   ├── dashboard/page.tsx # Main dashboard (authenticated)
│   └── layout.tsx         # Root layout with providers
├── components/            # Reusable React components
├── contexts/              # React Context providers
│   ├── AuthContext.tsx    # Authentication state
│   └── AppContext.tsx     # Application state (recipes, categories)
├── lib/                   # Utility functions
│   └── apiClient.ts       # Type-safe API client
├── types/                 # TypeScript type definitions
│   └── index.ts           # Core types (User, Recipe, etc.)
└── public/               # Static assets
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

### 3. Start Backend API

Make sure your backend is running:

```bash
cd ../tasty-api
npm start
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## Migration Status

### Completed
- Next.js project setup with TypeScript & Tailwind
- API client migrated to TypeScript
- Context providers migrated (AuthContext, AppContext)
- Basic routing (Home, Login, Dashboard)
- Authentication pages with Tailwind styling

### To Be Migrated
- Individual recipe components
- Add Recipe form
- Favorites functionality
- Category browsing
- Search functionality
- Recipe detail view
- Social auth integration

### Planned Enhancements
- **TanStack Query (React Query)** - API caching, background fetching, and async state management
- **Zustand** - Lightweight global state management

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
