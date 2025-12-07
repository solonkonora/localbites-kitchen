"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Heart } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useAppContext } from "@/contexts/AppContext";
import Favorites from "@/components/Favorites";
import apiClient from "@/lib/apiClient";

type Tab = "home" | "favorites" | "add";

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const { recipes, fetchRecipes, fetchCategories } = useAppContext();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const queryClient = useQueryClient();

  // Fetch user's favorites
  const { data: favoritesData = [], refetch: refetchFavorites } = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      try {
        return await apiClient.getFavorites();
      } catch (error) {
        console.error("Error fetching favorites:", error);
        return [];
      }
    },
    enabled: !!user,
  });

  // Get favorite recipe IDs for quick lookup
  const favoriteRecipeIds = new Set(favoritesData.map((fav) => fav.recipe_id));

  // Add favorite mutation
  const addFavoriteMutation = useMutation({
    mutationFn: (recipeId: number) => apiClient.addFavorite(recipeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      refetchFavorites();
    },
    onError: (error: Error & { status?: number }) => {
      console.error("Error adding favorite:", error);
      // If it's already favorited (409), just refetch to sync state
      if (error.status === 409) {
        console.log("Recipe already favorited, refreshing state...");
        refetchFavorites();
      } else {
        alert("Failed to add favorite. Please try again.");
      }
    },
  });

  // Remove favorite mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: (recipeId: number) => apiClient.removeFavorite(recipeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      refetchFavorites();
    },
    onError: (error: Error & { status?: number }) => {
      console.error("Error removing favorite:", error);
      // If it's not found (404), just refetch to sync state
      if (error.status === 404) {
        console.log("Favorite not found, refreshing state...");
        refetchFavorites();
      } else {
        alert("Failed to remove favorite. Please try again.");
      }
    },
  });

  const toggleFavorite = async (recipeId: number) => {
    console.log("Toggling favorite for recipe:", recipeId);
    console.log("Current favorites:", favoritesData);
    console.log("Is currently favorite:", favoriteRecipeIds.has(recipeId));
    
    if (favoriteRecipeIds.has(recipeId)) {
      await removeFavoriteMutation.mutateAsync(recipeId);
    } else {
      await addFavoriteMutation.mutateAsync(recipeId);
    }
  };

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
              {recipes.map((recipe) => {
                const isFavorite = favoriteRecipeIds.has(recipe.id);
                
                return (
                  <div
                    key={recipe.id}
                    className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg relative"
                  >
                    {recipe.image_path && (
                      <div className="relative h-64 w-full">
                        <Image
                          src={recipe.image_path}
                          alt={recipe.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        
                        {/* Heart Icon on Image */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            toggleFavorite(recipe.id);
                          }}
                          disabled={
                            addFavoriteMutation.isPending ||
                            removeFavoriteMutation.isPending
                          }
                          className={`absolute top-4 right-4 p-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 z-50 border-2 ${
                            isFavorite
                              ? "bg-red-50 border-red-500 hover:bg-red-100"
                              : "bg-white border-gray-300 hover:bg-gray-50"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                          aria-label={
                            isFavorite
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                        >
                          {(addFavoriteMutation.isPending ||
                            removeFavoriteMutation.isPending) ? (
                            <div className="h-5.5 w-5.5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"></div>
                          ) : (
                            <Heart
                              size={24}
                              className={
                                isFavorite
                                  ? "text-red-500 fill-red-500 drop-shadow-lg"
                                  : "text-gray-500 hover:text-gray-700"
                              }
                            />
                          )}
                        </button>
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
                        className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-red-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:scale-105"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {recipes.length === 0 && (
              <p className="text-center text-gray-600">
                No recipes found. Add your first recipe!
              </p>
            )}
          </div>
        )}

        {activeTab === "favorites" && (
          <Favorites />
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
