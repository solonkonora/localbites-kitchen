'use client';

import { useAppContext } from '@/contexts/AppContext';
import RecipeCard from './RecipeCard';

interface DisplayRecipe {
  id: number;
  title: string;
  image: string;
  // prep_time: number;
  category: string;
}

export default function FeaturedRecipes() {
  const { recipes, categories } = useAppContext();
  
  // Transform API recipes to display format
  const transformedRecipes: DisplayRecipe[] = recipes?.slice(0, 3).map(recipe => {
    const category = categories.find(cat => cat.id === recipe.category_id);
    return {
      id: recipe.id,
      title: recipe.title,
      image: recipe.image_path || 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1735656088/foodie/featured-recipes/katikati.jpg',
      // prep_time: recipe.prep_time ?? 45,
      category: category?.name || 'General'
    };
  }) || [];
  
  // Use hardcoded recipes if no API recipes available
  const featuredRecipes: DisplayRecipe[] = transformedRecipes.length > 0 ? transformedRecipes : [
    {
      id: 1,
      title: 'Kati Kati',
      image: 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/lunch/kati-kati.png',
      // prep_time: 45,
      category: 'Dinner'
    },
    {
      id: 2,
      title: 'Ndolé',
      image: 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/lunch/ndole.jpeg',
      // prep_time: 60,
      category: 'Lunch'
    },
    {
      id: 3,
      title: 'Okra Soup',
      image: 'https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/dinner/okra-soup.png',
      // prep_time: 90,
      category: 'Dinner'
    }
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-orange-50 via-white to-red-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-200/30 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-red-200/30 to-transparent rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-6 py-2 bg-orange-600 text-white text-sm font-bold rounded-full uppercase tracking-wider mb-4 shadow-lg">
            Discover
          </span>
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6 text-gray-900 tracking-tight">
            Featured <span className="text-transparent bg-clip-text bg-orange-600">Recipes</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Explore our hand-picked collection of delicious recipes from around the world
          </p>
        </div>

        {/* Recipe Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {featuredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              id={recipe.id}
              title={recipe.title}
              image={recipe.image}
              // time={`${recipe.prep_time} mins`}
              category={recipe.category}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
