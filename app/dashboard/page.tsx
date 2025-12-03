'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAppContext } from '@/contexts/AppContext';

type Tab = 'home' | 'favorites' | 'add';

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const { recipes, fetchRecipes, fetchCategories } = useAppContext();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('home');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    fetchRecipes();
    fetchCategories();
  }, [fetchRecipes, fetchCategories]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Local<span className="text-orange-500">Bite</span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              Welcome, {user.full_name || user.username || user.email.split('@')[0]}!
            </span>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('home')}
              className={`border-b-2 py-4 font-medium transition-colors ${
                activeTab === 'home'
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`border-b-2 py-4 font-medium transition-colors ${
                activeTab === 'favorites'
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Favorites
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`border-b-2 py-4 font-medium transition-colors ${
                activeTab === 'add'
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Add Recipe
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'home' && (
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">All Recipes</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recipes.map((recipe) => (
                <div key={recipe.id} className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg">
                  {recipe.image_path && (
                    <img
                      src={recipe.image_path}
                      alt={recipe.title}
                      className="h-48 w-full object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">{recipe.title}</h3>
                    <p className="text-sm text-gray-600">{recipe.description}</p>
                  </div>
                </div>
              ))}
            </div>
            {recipes.length === 0 && (
              <p className="text-center text-gray-600">No recipes found. Add your first recipe!</p>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Your Favorites</h2>
            <p className="text-gray-600">Your favorite recipes will appear here.</p>
          </div>
        )}

        {activeTab === 'add' && (
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Add New Recipe</h2>
            <div className="rounded-lg bg-white p-6 shadow-md">
              <p className="text-gray-600">Recipe form will be implemented here.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
