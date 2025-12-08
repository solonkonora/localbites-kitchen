"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Heart, ArrowLeft } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/apiClient";
import type { Recipe, Category } from "@/types";

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const categoryId = parseInt(params.id as string);
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<Category | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's favorites
  const { data: favoritesData = [] } = useQuery({
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

  const favoriteRecipeIds = new Set(favoritesData.map((fav) => fav.recipe_id));

  // Add favorite mutation
  const addFavoriteMutation = useMutation({
    mutationFn: (recipeId: number) => apiClient.addFavorite(recipeId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  // Remove favorite mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: (recipeId: number) => apiClient.removeFavorite(recipeId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const toggleFavorite = async (recipeId: number, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (!user) {
      if (confirm("You need to sign up to save favorites. Would you like to sign up now?")) {
        router.push("/login?redirect=/category/" + categoryId);
      }
      return;
    }

    const isFavorite = favoriteRecipeIds.has(recipeId);
    try {
      if (isFavorite) {
        await removeFavoriteMutation.mutateAsync(recipeId);
      } else {
        await addFavoriteMutation.mutateAsync(recipeId);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        // Fetch category details
        const categories = await apiClient.getCategories();
        const foundCategory = categories.find((c) => c.id === categoryId);
        setCategory(foundCategory || null);

        // Fetch all recipes and filter by category
        const allRecipes = await apiClient.getRecipes();
        const categoryRecipes = allRecipes.filter((r) => r.category_id === categoryId);
        setRecipes(categoryRecipes);
      } catch (error) {
        console.error("Error fetching category data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategoryData();
    }
  }, [categoryId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-orange-600"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Category not found</h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={24} className="text-gray-700" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Local<span className="text-orange-500">Bite</span>
            </h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h2>
          {category.description && (
            <p className="text-gray-600">{category.description}</p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"} found
          </p>
        </div>

        {recipes.length > 0 ? (
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
                        onClick={(e) => toggleFavorite(recipe.id, e)}
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
                          isFavorite ? "Remove from favorites" : "Add to favorites"
                        }
                      >
                        {addFavoriteMutation.isPending ||
                        removeFavoriteMutation.isPending ? (
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
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              No recipes found in this category yet.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-lg bg-orange-500 px-6 py-3 text-white hover:bg-orange-600 transition-colors"
            >
              Browse All Recipes
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
