'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Heart, Share2, ChefHat } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/apiClient';
import type { Recipe, Ingredient, Instruction, Category } from '@/types';

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const recipeId = params.id as string;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch recipe details
        const recipeData = await apiClient.getRecipeById(Number(recipeId));
        setRecipe(recipeData);

        // Fetch ingredients
        const ingredientsData = await apiClient.getIngredientsByRecipeId(Number(recipeId));
        setIngredients(ingredientsData);

        // Fetch instructions
        const instructionsData = await apiClient.getInstructionsByRecipeId(Number(recipeId));
        setInstructions(instructionsData);

        // Fetch category
        const categoriesData = await apiClient.getCategories();
        const recipeCategory = categoriesData.find(cat => cat.id === recipeData.category_id);
        setCategory(recipeCategory || null);

        // Check if favorite (if user is logged in)
        if (user) {
          const favorites = await apiClient.getFavorites();
          setIsFavorite(favorites.some(fav => fav.recipe_id === Number(recipeId)));
        }
      } catch (err) {
        console.error('Error fetching recipe details:', err);
        setError('Failed to load recipe details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (recipeId) {
      fetchRecipeDetails();
    }
  }, [recipeId, user]);

  const handleToggleFavorite = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      if (isFavorite) {
        await apiClient.removeFavorite(Number(recipeId));
        setIsFavorite(false);
      } else {
        await apiClient.addFavorite(Number(recipeId));
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe?.title,
          text: recipe?.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Recipe Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The recipe you\'re looking for doesn\'t exist.'}</p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-full hover:shadow-lg transition-all duration-300"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors duration-300 font-medium"
          >
            <ArrowLeft size={20} />
            Back
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative w-full bg-gray-900">
        <div className="relative h-[400px] md:h-[500px] max-w-7xl mx-auto">
          <Image
            src={recipe.image_path || '/images/placeholder-recipe.jpg'}
            alt={recipe.title || 'Recipe Image'}
            fill
            className="object-contain"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        </div>
        
        {/* Category Badge */}
        {category && (
          <div className="absolute top-6 right-6 z-10">
            <span className="inline-block px-4 py-2 bg-orange-600 text-white text-sm font-bold rounded-full uppercase tracking-wide shadow-lg">
              {category.name}
            </span>
          </div>
        )}

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-10">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">
              {recipe.title}
            </h1>
            {recipe.description && (
              <p className="text-lg md:text-xl text-white/90 max-w-3xl leading-relaxed drop-shadow">
                {recipe.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Ingredients */}
            <section className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-orange-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Ingredients</h2>
              </div>

              {/* Main Ingredients */}
              {ingredients.filter(ing => ing.is_main).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-orange-600 mb-3">Main Ingredients</h3>
                  <ul className="space-y-3">
                    {ingredients
                      .filter(ing => ing.is_main)
                      .map((ingredient) => (
                        <li
                          key={ingredient.id}
                          className="flex items-start gap-3 text-gray-700 text-lg group"
                        >
                          <span className="w-2 h-2 bg-orange-500 rounded-full mt-2.5 group-hover:scale-150 transition-transform duration-300" />
                          <span>
                            <strong className="font-semibold text-gray-900">
                              {ingredient.quantity} {ingredient.unit}
                            </strong>{' '}
                            {ingredient.name}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Optional Ingredients */}
              {ingredients.filter(ing => !ing.is_main).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-3">Optional Ingredients</h3>
                  <ul className="space-y-3">
                    {ingredients
                      .filter(ing => !ing.is_main)
                      .map((ingredient) => (
                        <li
                          key={ingredient.id}
                          className="flex items-start gap-3 text-gray-600 text-lg group"
                        >
                          <span className="w-2 h-2 bg-gray-400 rounded-full mt-2.5 group-hover:scale-150 transition-transform duration-300" />
                          <span>
                            <strong className="font-medium text-gray-700">
                              {ingredient.quantity} {ingredient.unit}
                            </strong>{' '}
                            {ingredient.name}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {ingredients.length === 0 && (
                <p className="text-gray-500 italic">No ingredients listed.</p>
              )}
            </section>

            {/* Instructions */}
            <section className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Instructions</h2>
              <ol className="space-y-6">
                {instructions.length > 0 ? (
                  instructions.map((instruction) => (
                    <li
                      key={instruction.id}
                      className="flex gap-4 group"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md group-hover:scale-110 transition-transform duration-300">
                        {instruction.step_number}
                      </div>
                      <p className="text-gray-700 text-lg leading-relaxed pt-1.5">
                        {instruction.description}
                      </p>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No instructions available.</p>
                )}
              </ol>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Action Buttons */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 space-y-4">
                <button
                  onClick={handleToggleFavorite}
                  className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                    isFavorite
                      ? 'bg-red-50 text-red-600 hover:bg-red-100 border-2 border-red-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                  }`}
                >
                  <Heart
                    size={24}
                    className={isFavorite ? 'fill-current' : ''}
                  />
                  {isFavorite ? 'Saved' : 'Save Recipe'}
                </button>

                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-50 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 border-2 border-gray-200 transition-all duration-300"
                >
                  <Share2 size={24} />
                  Share Recipe
                </button>
              </div>

              {/* Recipe Info */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 space-y-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Recipe Info</h3>
                
                {/* <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Prep Time</p>
                    <p className="font-semibold">45 mins</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Servings</p>
                    <p className="font-semibold">4 people</p>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
