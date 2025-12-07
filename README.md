# LocalBite - Next.js Migration

This is the modernized version of LocalBite, migrated from React (Vite) to **Next.js 15** with **TypeScript** and **Tailwind CSS**.

## What's New

- **Next.js App Router** - Modern file-based routing
- **TypeScript** - Full type safety across the application
- **Tailwind CSS** - Utility-first styling (replacing CSS files)
- **Server Components** - Improved performance with React Server Components
- **Type-safe API Client** - Fully typed API interactions

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

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
