"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";
import type { Recipe } from "@/types";

interface FavoriteRecipe extends Recipe {
  favorite_id: number;
}

export default function Favorites() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch favorites
  const {
    data: favorites = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const favoritesData = await apiClient.getFavorites();

      // Fetch full recipe details for each favorite
      const recipesWithDetails = await Promise.all(
        favoritesData.map(async (fav) => {
          try {
            const recipe = await apiClient.getRecipe(fav.recipe_id);
            return { ...recipe, favorite_id: fav.id };
          } catch (err) {
            console.error(`Error fetching recipe ${fav.recipe_id}:`, err);
            return null;
          }
        })
      );

      return recipesWithDetails.filter(
        (recipe): recipe is FavoriteRecipe => recipe !== null && recipe.favorite_id !== undefined
      ) as FavoriteRecipe[];
    },
  });

  // Remove favorite mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: (recipeId: number) => apiClient.removeFavorite(recipeId),
    onSuccess: () => {
      // Invalidate and refetch favorites
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
    onError: (error) => {
      console.error("Error removing favorite:", error);
      alert("Failed to remove favorite. Please try again.");
    },
  });

  const handleRemoveFavorite = (recipeId: number) => {
    if (window.confirm("Remove this recipe from favorites?")) {
      removeFavoriteMutation.mutate(recipeId);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Heart size={28} className="text-red-600 fill-red-600" />
          <h2 className="text-3xl font-bold text-gray-900">
            My Favorite Recipes
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Heart size={28} className="text-red-600 fill-red-600" />
          <h2 className="text-3xl font-bold text-gray-900">
            My Favorite Recipes
          </h2>
        </div>
        <div className="text-center py-16">
          <p className="text-red-600 font-medium">
            Error loading favorites. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="flex items-center justify-center gap-3 mb-8">
        <Heart size={28} className="text-red-600 fill-red-600" />
        <h2 className="text-3xl font-bold text-gray-900">
          My Favorite Recipes
        </h2>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <Heart size={64} className="text-gray-300 mb-4" strokeWidth={1} />
          <p className="text-xl font-semibold text-gray-700 mb-2">
            No favorite recipes yet
          </p>
          <p className="text-gray-500 text-center max-w-md">
            Start adding recipes to your favorites by clicking the heart icon on
            recipe cards!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((recipe) => (
            <div
              key={recipe.id}
              className="group overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-xl relative"
            >
              {/* Image Container - Takes up most of the card */}
              <div className="relative h-72 overflow-hidden">
                {recipe.image_path ? (
                  <Image
                    src={recipe.image_path}
                    alt={recipe.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No image</span>
                  </div>
                )}
                
                {/* Heart Icon on Image - Always render if there's an image */}
                {recipe.image_path && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(recipe.id);
                    }}
                    disabled={removeFavoriteMutation.isPending}
                    className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-xl hover:bg-red-50 transition-all duration-300 hover:scale-110 z-50 border-2 border-red-100"
                    aria-label="Remove from favorites"
                  >
                    <Heart size={22} className="text-red-600 fill-red-600" />
                  </button>
                )}
              </div>

              {/* Content - Compact */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors">
                  {recipe.title}
                </h3>
                {recipe.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {recipe.description}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/recipe/${recipe.id}`)}
                    className="flex-1 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:scale-105"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleRemoveFavorite(recipe.id)}
                    disabled={removeFavoriteMutation.isPending}
                    className="px-4 py-2.5 rounded-lg border-2 border-gray-200 text-gray-600 hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-300 disabled:opacity-50"
                    aria-label="Remove from favorites"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
