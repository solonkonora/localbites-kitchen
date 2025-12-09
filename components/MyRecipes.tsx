"use client";

import { useState } from "react";
import Image from "next/image";
import { Pencil, Trash2, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";
import type { Recipe } from "@/types";

export default function MyRecipes() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch user's recipes
  const { data: myRecipes = [], isLoading } = useQuery({
    queryKey: ["myRecipes"],
    queryFn: () => apiClient.getMyRecipes(),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (recipeId: number) => apiClient.deleteRecipe(recipeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myRecipes"] });
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      setDeletingId(null);
    },
    onError: (error) => {
      console.error("Error deleting recipe:", error);
      alert("Failed to delete recipe. Please try again.");
      setDeletingId(null);
    },
  });

  const handleDelete = (recipeId: number, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      setDeletingId(recipeId);
      deleteMutation.mutate(recipeId);
    }
  };

  const handleEdit = (recipeId: number) => {
    router.push(`/recipe/${recipeId}/edit`);
  };

  const handleView = (recipeId: number) => {
    router.push(`/recipe/${recipeId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your recipes...</p>
        </div>
      </div>
    );
  }

  if (myRecipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <div className="bg-gray-100 rounded-full p-6 mb-4">
          <svg
            className="w-16 h-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Recipes Yet</h3>
        <p className="text-gray-600 mb-6 max-w-md">
          You haven&apos;t created any recipes yet. Start sharing your culinary creations with the community!
        </p>
        <button
          onClick={() => router.push("/dashboard?tab=add")}
          className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
        >
          Create Your First Recipe
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Recipes</h2>
          <p className="text-gray-600 mt-1">{myRecipes.length} recipe{myRecipes.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {myRecipes.map((recipe: Recipe) => (
          <div
            key={recipe.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
          >
            {/* Recipe Image */}
            <div className="relative h-48 w-full bg-gray-200">
              {recipe.image_path ? (
                <Image
                  src={recipe.image_path}
                  alt={recipe.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-300">
                  <span className="text-gray-500">No image</span>
                </div>
              )}
            </div>

            {/* Recipe Info */}
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                {recipe.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                {recipe.description}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => handleView(recipe.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  title="View recipe"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => handleEdit(recipe.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  title="Edit recipe"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(recipe.id, recipe.title)}
                  disabled={deletingId === recipe.id}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  title="Delete recipe"
                >
                  {deletingId === recipe.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
