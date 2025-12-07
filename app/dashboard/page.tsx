"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useAppContext } from "@/contexts/AppContext";

type Tab = "home" | "favorites" | "add";

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const { recipes, fetchRecipes, fetchCategories } = useAppContext();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("home");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
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
    router.push("/");
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
              Welcome,{" "}
              {user.full_name || user.username || user.email.split("@")[0]}!
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
      <div className="bg-white shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <nav className="flex gap-1">
            <button
              onClick={() => setActiveTab("home")}
              className={`relative px-8 py-4 font-semibold transition-all duration-300 ${
                activeTab === "home"
                  ? "text-orange-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <span className="relative z-10">Home</span>
              {activeTab === "home" && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-t-lg"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`relative px-8 py-4 font-semibold transition-all duration-300 ${
                activeTab === "favorites"
                  ? "text-orange-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <span className="relative z-10">Favorites</span>
              {activeTab === "favorites" && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-t-lg"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("add")}
              className={`relative px-8 py-4 font-semibold transition-all duration-300 ${
                activeTab === "add"
                  ? "text-orange-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <span className="relative z-10">Add Recipe</span>
              {activeTab === "add" && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-t-lg"></span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === "home" && (
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              All Recipes
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
                >
                  {recipe.image_path && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={recipe.image_path}
                        alt={recipe.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                      {recipe.title}
                    </h3>
                    <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                      {recipe.description}
                    </p>
                    <button
                      onClick={() => router.push(`/recipe/${recipe.id}`)}
                      className="w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:scale-105"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {recipes.length === 0 && (
              <p className="text-center text-gray-600">
                No recipes found. Add your first recipe!
              </p>
            )}
          </div>
        )}

        {activeTab === "favorites" && (
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              Your Favorites
            </h2>
            <p className="text-gray-600">
              Your favorite recipes will appear here.
            </p>
          </div>
        )}

        {activeTab === "add" && (
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              Add New Recipe
            </h2>
            <div className="rounded-lg bg-white p-6 shadow-md">
              <p className="text-gray-600">
                Recipe form will be implemented here.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
