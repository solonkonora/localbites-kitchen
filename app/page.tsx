'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAppContext } from '@/contexts/AppContext';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { fetchRecipes } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    // Fetch recipes for all users
    fetchRecipes();
  }, [fetchRecipes]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (user) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="mb-4 text-6xl font-bold text-gray-900">
            Local<span className="text-orange-500">Bite</span>
          </h1>
          <p className="mb-8 text-xl text-gray-600">
            Discover delicious recipes from around the world
          </p>
          <button
            onClick={() => router.push('/login')}
            className="rounded-full bg-orange-500 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Get Started
          </button>
        </div>
        
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Browse Recipes</h3>
            <p className="text-gray-600">
              Explore thousands of recipes from various cuisines
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Save Favorites</h3>
            <p className="text-gray-600">
              Keep track of recipes you love for quick access
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Share Your Own</h3>
            <p className="text-gray-600">
              Upload and share your favorite recipes with the community
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
